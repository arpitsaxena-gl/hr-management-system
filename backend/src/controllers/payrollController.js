const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const ApiResponse = require('../utils/apiResponse');
const { createError } = require('../utils/helpers');
const { calculatePayroll } = require('../services/payrollService');

const normalizeMonthYear = (month, year) => {
  const m = Number.parseInt(month, 10);
  const y = Number.parseInt(year, 10);
  if (!Number.isInteger(m) || m < 1 || m > 12) throw createError('Valid month is required', 400);
  if (!Number.isInteger(y) || y < 2000 || y > 2100) throw createError('Valid year is required', 400);
  return { m, y };
};

const getPayrolls = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { month, year, status, employeeId } = req.query;
    let query = {};
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ user: req.user._id });
      if (emp) query.employee = emp._id;
    } else if (employeeId) query.employee = employeeId;
    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);
    if (status) query.status = status;
    const [payrolls, total] = await Promise.all([
      Payroll.find(query).populate({ path: 'employee', populate: { path: 'user', select: 'firstName lastName avatar' }, select: 'employeeId designation' }).populate('processedBy', 'firstName lastName').skip(skip).limit(limit).sort({ year: -1, month: -1 }),
      Payroll.countDocuments(query)
    ]);
    ApiResponse.paginated(res, payrolls, total, page, limit);
  } catch (err) { next(err); }
};

const processPayroll = async (req, res, next) => {
  try {
    const { m: month, y: year } = normalizeMonthYear(req.body.month, req.body.year);
    const employeeIds = Array.isArray(req.body.employeeIds) ? req.body.employeeIds.filter(Boolean) : [];
    let employees;
    if (employeeIds.length > 0) employees = await Employee.find({ _id: { $in: employeeIds } });
    else employees = await Employee.find({ employmentStatus: 'active' });
    const results = await Promise.allSettled(employees.map(async (emp) => {
      const existing = await Payroll.findOne({ employee: emp._id, month, year });
      if (existing && existing.status !== 'draft') throw createError(`Payroll already processed for ${emp.employeeId}`, 409);
      const data = await calculatePayroll(emp, month, year);
      const payload = { ...data, month, year, processedBy: req.user._id, processedAt: new Date(), updatedBy: req.user._id };
      if (existing) return Payroll.findByIdAndUpdate(existing._id, payload, { new: true });
      return Payroll.create({ ...payload, createdBy: req.user._id });
    }));
    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - success;
    ApiResponse.success(res, { processed: success, failed }, 'Payroll processed');
  } catch (err) { next(err); }
};

const approvePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return next(createError('Payroll not found', 404));
    if (payroll.status !== 'draft') return next(createError('Only draft payrolls can be approved', 400));
    payroll.status = 'processed';
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();
    payroll.updatedBy = req.user._id;
    await payroll.save();
    ApiResponse.success(res, payroll, 'Payroll approved');
  } catch (err) { next(err); }
};

const markAsPaid = async (req, res, next) => {
  try {
    const { paymentDate, paymentMethod, transactionId } = req.body;
    if (!paymentMethod || typeof paymentMethod !== 'string') return next(createError('paymentMethod is required', 400));
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return next(createError('Payroll not found', 404));
    if (payroll.status !== 'processed') return next(createError('Only processed payrolls can be marked as paid', 400));
    payroll.status = 'paid';
    payroll.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    payroll.paymentMethod = paymentMethod;
    payroll.transactionId = transactionId || payroll.transactionId;
    payroll.updatedBy = req.user._id;
    await payroll.save();
    ApiResponse.success(res, payroll, 'Payroll marked as paid');
  } catch (err) { next(err); }
};

const getPayrollSummary = async (req, res, next) => {
  try {
    const { m: month, y: year } = normalizeMonthYear(req.query.month || new Date().getMonth() + 1, req.query.year || new Date().getFullYear());
    const summary = await Payroll.aggregate([
      { $match: { month, year } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalGross: { $sum: '$earnings.grossEarnings' }, totalNet: { $sum: '$netSalary' }, totalDeductions: { $sum: '$deductions.totalDeductions' } } }
    ]);
    ApiResponse.success(res, { month, year, summary });
  } catch (err) { next(err); }
};

module.exports = { getPayrolls, processPayroll, approvePayroll, markAsPaid, getPayrollSummary };

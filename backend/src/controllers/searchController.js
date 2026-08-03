const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Payroll = require('../models/Payroll');
const ApiResponse = require('../utils/apiResponse');
const { createError } = require('../utils/helpers');

const search = async (req, res, next) => {
  try {
    const { q, limit: rawLimit = 5 } = req.query;
    if (!q || String(q).trim().length < 2) {
      return next(createError('Query must be at least 2 characters', 400));
    }
    const query = String(q).trim();
    const limit = Math.min(parseInt(rawLimit) || 5, 20);
    const regex = new RegExp(query, 'i');

    const [allEmployees, departments, allPayrolls] = await Promise.all([
      Employee.find({ employmentStatus: 'active' })
        .populate({ path: 'user', select: 'firstName lastName email avatar' })
        .populate('department', 'name')
        .select('employeeId department')
        .limit(limit * 5),
      Department.find({ isActive: true, $or: [{ name: regex }, { code: regex }] })
        .select('name code employeeCount').limit(limit),
      Payroll.find({ status: { $in: ['draft', 'processed', 'paid'] } })
        .populate({ path: 'employee', populate: { path: 'user', select: 'firstName lastName' }, select: 'user' })
        .select('month year netSalary status employee')
        .sort({ createdAt: -1 }).limit(limit * 5),
    ]);

    const employees = allEmployees
      .filter(e => e.user && (
        regex.test(e.user.firstName) || regex.test(e.user.lastName) || regex.test(e.user.email)
      ))
      .slice(0, limit)
      .map(e => ({
        _id: e._id, firstName: e.user.firstName, lastName: e.user.lastName,
        employeeId: e.employeeId, avatar: e.user.avatar, department: e.department,
      }));

    const payrolls = allPayrolls
      .filter(p => p.employee && p.employee.user && (
        regex.test(p.employee.user.firstName) || regex.test(p.employee.user.lastName)
      ))
      .slice(0, limit);

    ApiResponse.success(res, { employees, departments, payrolls });
  } catch (err) { next(err); }
};

module.exports = { search };

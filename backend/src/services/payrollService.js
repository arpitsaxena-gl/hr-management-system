const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');

const calculatePayroll = async (employee, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const holidays = await Holiday.countDocuments({ date: { $gte: startDate, $lte: endDate } });
  const attendance = await Attendance.find({ employee: employee._id, date: { $gte: startDate, $lte: endDate } });
  const presentDays = attendance.filter(a => ['present', 'work_from_home'].includes(a.status)).length;
  const halfDays = attendance.filter(a => a.status === 'half_day').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const leaveDays = await Leave.countDocuments({
    employee: employee._id, status: 'approved',
    startDate: { $lte: endDate }, endDate: { $gte: startDate }
  });
  const totalDays = endDate.getDate();
  const totalWorkingDays = Math.max(totalDays - holidays, 0);
  const salary = employee.salary || {};
  const basic = salary.basic || 0;
  const hra = salary.hra || 0;
  const da = salary.da || 0;
  const ta = salary.ta || 0;
  const medical = salary.medical || 0;
  const other = salary.other || 0;
  const perDaySalary = totalWorkingDays > 0 ? basic / totalWorkingDays : 0;
  const overtimeHours = attendance.reduce((acc, a) => acc + (a.overtime || 0), 0);
  const overtimePay = (perDaySalary / 8) * overtimeHours * 1.5;
  const absentDeduction = perDaySalary * absentDays;
  const halfDayDeduction = perDaySalary * 0.5 * halfDays;
  const pf = basic * 0.12;
  const esi = basic <= 21000 ? basic * 0.0075 : 0;
  const pt = basic <= 10000 ? 0 : basic <= 15000 ? 150 : 200;
  const grossEarnings = Math.round(basic + hra + da + ta + medical + other + overtimePay);
  const totalDeductions = Math.round(pf + esi + pt + absentDeduction + halfDayDeduction);

  return {
    employee: employee._id,
    month, year,
    payPeriod: { start: startDate, end: endDate },
    earnings: {
      basic,
      hra,
      da,
      ta,
      medical,
      overtime: Math.round(overtimePay),
      other,
      bonus: 0,
      incentive: 0,
      grossEarnings,
    },
    deductions: {
      pf: Math.round(pf),
      esi: Math.round(esi),
      professionalTax: pt,
      leave: Math.round(absentDeduction + halfDayDeduction),
      tds: 0,
      loanRepayment: 0,
      other: 0,
      totalDeductions,
    },
    attendanceSummary: {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      holidays,
      workingDays: totalWorkingDays,
      overtimeHours,
    }
  };
};

module.exports = { calculatePayroll };

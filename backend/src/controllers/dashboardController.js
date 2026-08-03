const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const ApiResponse = require('../utils/apiResponse');

let Job = null;
try { const R = require('../models/Recruitment'); Job = R.Job; } catch (_) {}

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const birthdayAgg = Employee.aggregate([
      { $match: { employmentStatus: 'active', dateOfBirth: { $exists: true, $ne: null } } },
      { $addFields: { birthdayThisYear: { $dateFromParts: { year: today.getFullYear(), month: { $month: '$dateOfBirth' }, day: { $dayOfMonth: '$dateOfBirth' } } } } },
      { $match: { birthdayThisYear: { $gte: today, $lte: thirtyDaysOut } } },
      { $sort: { birthdayThisYear: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      { $project: { firstName: '$user.firstName', lastName: '$user.lastName', avatar: '$user.avatar', dateOfBirth: 1, employeeId: 1 } }
    ]);

    const [
      totalEmployees, activeEmployees, newJoinees, todayPresent, todayAbsent,
      pendingLeaves, monthPayroll, pendingRecruitment, attrition, departments, upcomingBirthdays
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: 'active' }),
      Employee.countDocuments({ joiningDate: { $gte: thisMonth } }),
      Attendance.countDocuments({ date: today, status: { $in: ['present', 'work_from_home'] } }),
      Attendance.countDocuments({ date: today, status: 'absent' }),
      Leave.countDocuments({ status: 'pending' }),
      Payroll.aggregate([{ $match: { month: today.getMonth() + 1, year: today.getFullYear(), status: { $in: ['processed', 'paid'] } } }, { $group: { _id: null, total: { $sum: '$netSalary' } } }]),
      Job ? Job.countDocuments({ status: 'open' }).catch(() => 0) : Promise.resolve(0),
      Employee.countDocuments({ terminationDate: { $gte: thisMonth } }),
      Employee.distinct('department').then(ids => ids.length),
      birthdayAgg,
    ]);

    const attendanceRate = totalEmployees > 0 ? Math.round((todayPresent / totalEmployees) * 100) : 0;

    const [monthlyTrend, deptDistribution] = await Promise.all([
      Attendance.aggregate([
        { $match: { date: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) } } },
        { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' }, status: '$status' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Employee.aggregate([
        { $match: { employmentStatus: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { name: '$dept.name', count: 1, color: '$dept.color' } },
        { $sort: { count: -1 } }, { $limit: 10 }
      ])
    ]);

    ApiResponse.success(res, {
      overview: { totalEmployees, activeEmployees, newJoinees, attrition, departments },
      attendance: { todayPresent, todayAbsent, attendanceRate },
      leaves: { pendingLeaves },
      payroll: { monthTotal: monthPayroll[0] ? monthPayroll[0].total : 0 },
      recruitment: { openPositions: pendingRecruitment },
      upcomingBirthdays,
      charts: { monthlyTrend, deptDistribution }
    });
  } catch (err) { next(err); }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const [headcountTrend, payrollTrend] = await Promise.all([
      Employee.aggregate([{ $match: { joiningDate: { $gte: yearStart } } }, { $group: { _id: { month: { $month: '$joiningDate' }, year: { $year: '$joiningDate' } }, joined: { $sum: 1 } } }, { $sort: { '_id.month': 1 } }]),
      Payroll.aggregate([{ $match: { year: today.getFullYear(), status: { $in: ['processed', 'paid'] } } }, { $group: { _id: '$month', total: { $sum: '$netSalary' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    ApiResponse.success(res, { headcountTrend, payrollTrend });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getAdminDashboard };

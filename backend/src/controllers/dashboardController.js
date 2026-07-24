const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const ApiResponse = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalEmployees, activeEmployees, newJoinees,
      todayPresent, todayAbsent, pendingLeaves,
      monthPayroll, pendingRecruitment, attrition
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: 'active' }),
      Employee.countDocuments({ joiningDate: { $gte: thisMonth } }),
      Attendance.countDocuments({ date: today, status: { $in: ['present', 'work_from_home'] } }),
      Attendance.countDocuments({ date: today, status: 'absent' }),
      Leave.countDocuments({ status: 'pending' }),
      Payroll.aggregate([
        { $match: { month: today.getMonth() + 1, year: today.getFullYear(), status: { $in: ['processed', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } }
      ]),
      (async () => {
        const { Job } = require('../models/Recruitment');
        return Job.countDocuments({ status: 'open' });
      })(),
      Employee.countDocuments({ terminationDate: { $gte: thisMonth } }),
    ]);

    // Birthday aggregation — no full collection scan in application memory
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const currentDay = today.getDate();
    const nextWeekDay = new Date(today);
    nextWeekDay.setDate(nextWeekDay.getDate() + 7);
    const nextWeekMonth = nextWeekDay.getMonth() + 1;
    const nextWeekDayNum = nextWeekDay.getDate();

    const upcomingBirthdays = await Employee.aggregate([
      { $match: { employmentStatus: 'active', dateOfBirth: { $exists: true, $ne: null } } },
      {
        $addFields: {
          birthMonth: { $month: '$dateOfBirth' },
          birthDay: { $dayOfMonth: '$dateOfBirth' },
        },
      },
      {
        $match: {
          $or: [
            // Same month: day must be between today and today+7
            {
              birthMonth: currentMonth,
              birthDay: { $gte: currentDay, $lte: currentMonth === nextWeekMonth ? nextWeekDayNum : 31 },
            },
            // Wraps into next month
            ...(currentMonth !== nextWeekMonth
              ? [{ birthMonth: nextWeekMonth, birthDay: { $lte: nextWeekDayNum } }]
              : []),
          ],
        },
      },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      {
        $project: {
          _id: 1,
          dateOfBirth: 1,
          employeeId: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.avatar': 1,
        },
      },
    ]);

    const attendanceRate = totalEmployees > 0 ? Math.round((todayPresent / totalEmployees) * 100) : 0;

    const [monthlyTrend, deptDistribution] = await Promise.all([
      Attendance.aggregate([
        { $match: { date: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) } } },
        { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' }, status: '$status' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Employee.aggregate([
        { $match: { employmentStatus: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { name: '$dept.name', count: 1, color: '$dept.color' } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    ApiResponse.success(res, {
      overview: { totalEmployees, activeEmployees, newJoinees, attrition },
      attendance: { todayPresent, todayAbsent, attendanceRate },
      leaves: { pendingLeaves },
      payroll: { monthTotal: monthPayroll[0] ? monthPayroll[0].total : 0 },
      recruitment: { openPositions: pendingRecruitment },
      upcomingBirthdays,
      charts: { monthlyTrend, deptDistribution },
    });
  } catch (err) { next(err); }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const [headcountTrend, payrollTrend] = await Promise.all([
      Employee.aggregate([
        { $match: { joiningDate: { $gte: yearStart } } },
        { $group: { _id: { month: { $month: '$joiningDate' }, year: { $year: '$joiningDate' } }, joined: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } },
      ]),
      Payroll.aggregate([
        { $match: { year: today.getFullYear(), status: { $in: ['processed', 'paid'] } } },
        { $group: { _id: '$month', total: { $sum: '$netSalary' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    ApiResponse.success(res, { headcountTrend, payrollTrend });
  } catch (err) { next(err); }
};

const getAttendanceTrend = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const trend = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo, $lte: today } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, status: '$status' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Pivot by date
    const byDate = trend.reduce((acc, item) => {
      const dateKey = item._id.date;
      if (!acc[dateKey]) acc[dateKey] = { month: dateKey, present: 0, absent: 0, on_leave: 0 };
      acc[dateKey][item._id.status] = item.count;
      return acc;
    }, {});

    ApiResponse.success(res, Object.values(byDate));
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getAdminDashboard, getAttendanceTrend };

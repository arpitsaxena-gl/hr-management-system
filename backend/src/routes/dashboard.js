const express = require('express');
const router = express.Router();
const { getDashboardStats, getAdminDashboard, getAttendanceTrend } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getDashboardStats);
router.get('/admin', authorize('admin', 'hr'), getAdminDashboard);
router.get('/attendance-trend', getAttendanceTrend);

module.exports = router;

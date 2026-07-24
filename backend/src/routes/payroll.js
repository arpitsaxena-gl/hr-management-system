const express = require('express');
const router = express.Router();
const { getPayrolls, processPayroll, approvePayroll, markAsPaid, getPayrollSummary } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');
const paginate = require('../middleware/paginate');
const { query, validationResult } = require('express-validator');

const validatePayrollQuery = [
  query('status')
    .optional()
    .isIn(['draft', 'processed', 'paid', 'cancelled'])
    .withMessage('status must be one of: draft, processed, paid, cancelled'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('month must be an integer between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('year must be an integer between 2000 and 2100'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

router.use(protect);
router.get('/summary', authorize('admin', 'hr'), getPayrollSummary);
router.get('/', validatePayrollQuery, paginate, getPayrolls);
router.post('/process', authorize('admin', 'hr'), processPayroll);
router.put('/:id/approve', authorize('admin', 'hr'), approvePayroll);
router.put('/:id/paid', authorize('admin', 'hr'), markAsPaid);

module.exports = router;

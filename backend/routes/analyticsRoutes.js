const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getWeeklyAnalytics,
  getSubjectBreakdown,
  getTaskDistribution,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardSummary);
router.get('/weekly', getWeeklyAnalytics);
router.get('/subjects', getSubjectBreakdown);
router.get('/tasks-distribution', getTaskDistribution);

module.exports = router;

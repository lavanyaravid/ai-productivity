const express = require('express');
const router = express.Router();
const { getPomodoros, logPomodoro, getTodayStats } = require('../controllers/pomodoroController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getPomodoros).post(logPomodoro);
router.get('/today', getTodayStats);

module.exports = router;

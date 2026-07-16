const Pomodoro = require('../models/Pomodoro');
const asyncHandler = require('../middleware/asyncHandler');
const { checkPomodoroBadges } = require('../services/achievementService');

// @desc    Get pomodoro history
// @route   GET /api/pomodoro
// @access  Private
exports.getPomodoros = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const pomodoros = await Pomodoro.find({ user: req.user._id })
    .sort('-completedAt')
    .limit(Number(limit));
  res.status(200).json({ success: true, count: pomodoros.length, pomodoros });
});

// @desc    Log a completed pomodoro cycle
// @route   POST /api/pomodoro
// @access  Private
exports.logPomodoro = asyncHandler(async (req, res) => {
  const { cycleType, durationMinutes, subject, wasCompleted } = req.body;

  const pomodoro = await Pomodoro.create({
    user: req.user._id,
    cycleType: cycleType || 'work',
    durationMinutes,
    subject,
    wasCompleted: wasCompleted !== false,
  });

  if (pomodoro.cycleType === 'work' && pomodoro.wasCompleted) {
    req.user.totalPomodorosCompleted += 1;
    req.user.updateStreak();
    await checkPomodoroBadges(req.user);
    await req.user.save();
  }

  res.status(201).json({ success: true, message: 'Pomodoro logged', pomodoro });
});

// @desc    Today's pomodoro stats
// @route   GET /api/pomodoro/today
// @access  Private
exports.getTodayStats = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const pomodoros = await Pomodoro.find({
    user: req.user._id,
    completedAt: { $gte: start, $lte: end },
    cycleType: 'work',
    wasCompleted: true,
  });

  const totalMinutes = pomodoros.reduce((sum, p) => sum + p.durationMinutes, 0);

  res.status(200).json({
    success: true,
    completedToday: pomodoros.length,
    totalMinutesToday: totalMinutes,
  });
});

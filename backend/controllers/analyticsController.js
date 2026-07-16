const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const Pomodoro = require('../models/Pomodoro');
const Goal = require('../models/Goal');
const asyncHandler = require('../middleware/asyncHandler');

const startOfDay = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Dashboard summary (used on the main dashboard page)
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const todayStart = startOfDay();
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    activeGoals,
    completedGoals,
    todaySessions,
    todayPomodoros,
  ] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, status: 'completed' }),
    Task.countDocuments({ user: userId, status: { $ne: 'completed' } }),
    Task.countDocuments({ user: userId, status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }),
    Goal.countDocuments({ user: userId, status: 'active' }),
    Goal.countDocuments({ user: userId, status: 'completed' }),
    StudySession.find({ user: userId, startedAt: { $gte: todayStart, $lte: todayEnd } }),
    Pomodoro.countDocuments({ user: userId, completedAt: { $gte: todayStart, $lte: todayEnd }, cycleType: 'work', wasCompleted: true }),
  ]);

  const todayStudyMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  res.status(200).json({
    success: true,
    summary: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      activeGoals,
      completedGoals,
      todayStudyMinutes,
      todayPomodoros,
      studyStreak: req.user.studyStreak,
      totalStudyMinutes: req.user.totalStudyMinutes,
      totalPomodorosCompleted: req.user.totalPomodorosCompleted,
      totalTasksCompleted: req.user.totalTasksCompleted,
      badges: req.user.badges,
    },
  });
});

// @desc    Weekly productivity chart data (study minutes + tasks completed per day, last 7 days)
// @route   GET /api/analytics/weekly
// @access  Private
exports.getWeeklyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const days = [];
  const today = startOfDay();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    days.push({ date: day, nextDay, label: day.toLocaleDateString('en-US', { weekday: 'short' }) });
  }

  const results = await Promise.all(
    days.map(async ({ date, nextDay, label }) => {
      const [sessions, tasksCompleted, pomodoros] = await Promise.all([
        StudySession.find({ user: userId, startedAt: { $gte: date, $lt: nextDay } }),
        Task.countDocuments({ user: userId, completedAt: { $gte: date, $lt: nextDay } }),
        Pomodoro.countDocuments({ user: userId, completedAt: { $gte: date, $lt: nextDay }, cycleType: 'work', wasCompleted: true }),
      ]);
      return {
        date: date.toISOString().split('T')[0],
        label,
        studyMinutes: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        tasksCompleted,
        pomodoros,
      };
    })
  );

  res.status(200).json({ success: true, weekly: results });
});

// @desc    Subject-wise study time breakdown (for pie chart)
// @route   GET /api/analytics/subjects
// @access  Private
exports.getSubjectBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await StudySession.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$subject', totalMinutes: { $sum: '$durationMinutes' }, sessions: { $sum: 1 } } },
    { $sort: { totalMinutes: -1 } },
  ]);

  res.status(200).json({ success: true, breakdown });
});

// @desc    Task priority / status distribution (for pie/bar chart)
// @route   GET /api/analytics/tasks-distribution
// @access  Private
exports.getTaskDistribution = asyncHandler(async (req, res) => {
  const [byStatus, byPriority] = await Promise.all([
    Task.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
  ]);
  res.status(200).json({ success: true, byStatus, byPriority });
});

const StudySession = require('../models/StudySession');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { checkStreakBadges } = require('../services/achievementService');

// @desc    Get study sessions (optionally filtered by range)
// @route   GET /api/study-sessions
// @access  Private
exports.getStudySessions = asyncHandler(async (req, res) => {
  const { from, to, limit = 50 } = req.query;
  const query = { user: req.user._id };
  if (from || to) {
    query.startedAt = {};
    if (from) query.startedAt.$gte = new Date(from);
    if (to) query.startedAt.$lte = new Date(to);
  }
  const sessions = await StudySession.find(query).sort('-startedAt').limit(Number(limit));
  res.status(200).json({ success: true, count: sessions.length, sessions });
});

// @desc    Log a completed study session
// @route   POST /api/study-sessions
// @access  Private
exports.createStudySession = asyncHandler(async (req, res) => {
  const { subject, type, durationMinutes, startedAt, endedAt, notes, relatedTask } = req.body;

  if (!durationMinutes || !startedAt || !endedAt) {
    throw new ApiError('durationMinutes, startedAt and endedAt are required', 400);
  }

  const session = await StudySession.create({
    user: req.user._id,
    subject,
    type,
    durationMinutes,
    startedAt,
    endedAt,
    notes,
    relatedTask: relatedTask || null,
  });

  req.user.totalStudyMinutes += Number(durationMinutes);
  req.user.updateStreak();
  await checkStreakBadges(req.user);
  await req.user.save();

  res.status(201).json({ success: true, message: 'Study session logged', session });
});

// @desc    Delete a study session
// @route   DELETE /api/study-sessions/:id
// @access  Private
exports.deleteStudySession = asyncHandler(async (req, res) => {
  const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!session) throw new ApiError('Study session not found', 404);
  res.status(200).json({ success: true, message: 'Study session deleted' });
});

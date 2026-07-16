const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { awardBadge } = require('../services/achievementService');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;
  if (category) query.category = category;

  const goals = await Goal.find(query).sort('-createdAt');
  res.status(200).json({ success: true, count: goals.length, goals });
});

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);
  res.status(200).json({ success: true, goal });
});

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Goal created successfully', goal });
});

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);

  const wasCompleted = goal.status === 'completed';
  Object.assign(goal, req.body);
  goal.recalcProgress();

  if (goal.status === 'completed' && !wasCompleted) {
    goal.completedAt = new Date();
    const badge = await awardBadge(req.user, 'GOAL_FIRST');
    await req.user.save();
    await Notification.create({
      user: req.user._id,
      title: 'Goal Achieved! 🎉',
      message: `Congratulations! You completed the goal: "${goal.title}"`,
      type: 'goal',
    });
  }

  await goal.save();
  res.status(200).json({ success: true, message: 'Goal updated successfully', goal });
});

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);
  res.status(200).json({ success: true, message: 'Goal deleted successfully' });
});

// @desc    Add milestone
// @route   POST /api/goals/:id/milestones
// @access  Private
exports.addMilestone = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);
  if (!req.body.title) throw new ApiError('Milestone title is required', 400);

  goal.milestones.push({ title: req.body.title });
  goal.recalcProgress();
  await goal.save();
  res.status(201).json({ success: true, goal });
});

// @desc    Toggle milestone completion
// @route   PATCH /api/goals/:id/milestones/:milestoneId
// @access  Private
exports.toggleMilestone = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);

  const milestone = goal.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ApiError('Milestone not found', 404);

  milestone.isCompleted = !milestone.isCompleted;
  milestone.completedAt = milestone.isCompleted ? new Date() : undefined;
  goal.recalcProgress();

  if (goal.status === 'completed') {
    await req.user.save();
  }

  await goal.save();
  res.status(200).json({ success: true, goal });
});

// @desc    Delete milestone
// @route   DELETE /api/goals/:id/milestones/:milestoneId
// @access  Private
exports.deleteMilestone = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw new ApiError('Goal not found', 404);

  goal.milestones.pull({ _id: req.params.milestoneId });
  goal.recalcProgress();
  await goal.save();
  res.status(200).json({ success: true, goal });
});

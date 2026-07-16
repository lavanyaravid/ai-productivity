const Task = require('../models/Task');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { checkTaskBadges, checkStreakBadges } = require('../services/achievementService');

// @desc    Get all tasks for logged in user (with filter/search/sort/pagination)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const { status, priority, subject, search, sort, page = 1, limit = 20, dueDate } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (subject) query.subject = subject;
  if (search) query.$text = { $search: search };
  if (dueDate === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query.dueDate = { $gte: start, $lte: end };
  } else if (dueDate === 'overdue') {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: 'completed' };
  } else if (dueDate === 'week') {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    query.dueDate = { $gte: start, $lte: end };
  }

  const sortMap = {
    newest: '-createdAt',
    oldest: 'createdAt',
    dueDate: 'dueDate',
    priority: '-priority',
  };
  const sortBy = sortMap[sort] || '-createdAt';

  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    stats,
    tasks,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError('Task not found', 404);
  res.status(200).json({ success: true, task });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, user: req.user._id });

  if (req.body.reminder) {
    await Notification.create({
      user: req.user._id,
      title: 'Task Reminder Set',
      message: `Reminder set for task: "${task.title}"`,
      type: 'task',
      link: `/tasks/${task._id}`,
    });
  }

  res.status(201).json({ success: true, message: 'Task created successfully', task });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError('Task not found', 404);

  const wasCompleted = task.status === 'completed';
  Object.assign(task, req.body);

  if (task.status === 'completed' && !wasCompleted) {
    task.completedAt = new Date();
    req.user.totalTasksCompleted += 1;
    req.user.updateStreak();
    await checkTaskBadges(req.user);
    await checkStreakBadges(req.user);
    await req.user.save();
  } else if (task.status !== 'completed' && wasCompleted) {
    task.completedAt = undefined;
  }

  await task.save();
  res.status(200).json({ success: true, message: 'Task updated successfully', task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError('Task not found', 404);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// @desc    Toggle task status quickly (pending <-> completed)
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new ApiError('Task not found', 404);

  if (task.status === 'completed') {
    task.status = 'pending';
    task.completedAt = undefined;
  } else {
    task.status = 'completed';
    task.completedAt = new Date();
    req.user.totalTasksCompleted += 1;
    req.user.updateStreak();
    await checkTaskBadges(req.user);
    await checkStreakBadges(req.user);
    await req.user.save();
  }
  await task.save();
  res.status(200).json({ success: true, task });
});

// @desc    Bulk delete completed tasks
// @route   DELETE /api/tasks/clear-completed
// @access  Private
exports.clearCompleted = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({ user: req.user._id, status: 'completed' });
  res.status(200).json({ success: true, message: `${result.deletedCount} completed tasks cleared` });
});

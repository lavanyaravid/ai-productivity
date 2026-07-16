const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all study plans
// @route   GET /api/study-plans
// @access  Private
exports.getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: plans.length, plans });
});

// @desc    Get active weekly plan (for calendar view)
// @route   GET /api/study-plans/active
// @access  Private
exports.getActivePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ user: req.user._id, isActive: true }).sort('-createdAt');
  res.status(200).json({ success: true, plan });
});

// @desc    Get single plan
// @route   GET /api/study-plans/:id
// @access  Private
exports.getStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) throw new ApiError('Study plan not found', 404);
  res.status(200).json({ success: true, plan });
});

// @desc    Create study plan
// @route   POST /api/study-plans
// @access  Private
exports.createStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Study plan created successfully', plan });
});

// @desc    Update study plan
// @route   PUT /api/study-plans/:id
// @access  Private
exports.updateStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!plan) throw new ApiError('Study plan not found', 404);
  res.status(200).json({ success: true, message: 'Study plan updated successfully', plan });
});

// @desc    Delete study plan
// @route   DELETE /api/study-plans/:id
// @access  Private
exports.deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!plan) throw new ApiError('Study plan not found', 404);
  res.status(200).json({ success: true, message: 'Study plan deleted successfully' });
});

// @desc    Add a study block to a plan
// @route   POST /api/study-plans/:id/blocks
// @access  Private
exports.addBlock = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) throw new ApiError('Study plan not found', 404);

  plan.blocks.push(req.body);
  await plan.save();
  res.status(201).json({ success: true, plan });
});

// @desc    Update / toggle a study block
// @route   PUT /api/study-plans/:id/blocks/:blockId
// @access  Private
exports.updateBlock = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) throw new ApiError('Study plan not found', 404);

  const block = plan.blocks.id(req.params.blockId);
  if (!block) throw new ApiError('Study block not found', 404);

  Object.assign(block, req.body);
  await plan.save();
  res.status(200).json({ success: true, plan });
});

// @desc    Delete a study block
// @route   DELETE /api/study-plans/:id/blocks/:blockId
// @access  Private
exports.deleteBlock = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!plan) throw new ApiError('Study plan not found', 404);

  plan.blocks.pull({ _id: req.params.blockId });
  await plan.save();
  res.status(200).json({ success: true, plan });
});

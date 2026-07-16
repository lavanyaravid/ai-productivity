const mongoose = require('mongoose');

const studyBlockSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "10:30"
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Plan title is required'], trim: true, maxlength: 150 },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    blocks: [studyBlockSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studyPlanSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);

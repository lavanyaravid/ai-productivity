const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Goal title is required'], trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    category: {
      type: String,
      enum: ['academic', 'personal', 'career', 'skill', 'other'],
      default: 'academic',
    },
    targetDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
    milestones: [milestoneSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });

// Auto-calc progress based on milestones if milestones exist
goalSchema.methods.recalcProgress = function () {
  if (this.milestones.length > 0) {
    const completed = this.milestones.filter((m) => m.isCompleted).length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
};

module.exports = mongoose.model('Goal', goalSchema);

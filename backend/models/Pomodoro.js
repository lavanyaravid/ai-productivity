const mongoose = require('mongoose');

// Stores each individual pomodoro cycle (work/short-break/long-break) completed by the user
const pomodoroSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cycleType: { type: String, enum: ['work', 'short-break', 'long-break'], default: 'work' },
    durationMinutes: { type: Number, required: true },
    subject: { type: String, default: 'General' },
    completedAt: { type: Date, default: Date.now },
    wasCompleted: { type: Boolean, default: true }, // false if user skipped/cancelled
  },
  { timestamps: true }
);

pomodoroSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('Pomodoro', pomodoroSchema);

const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, trim: true, default: 'General' },
    type: { type: String, enum: ['pomodoro', 'manual', 'timer'], default: 'pomodoro' },
    durationMinutes: { type: Number, required: true, min: 1 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    notes: { type: String, default: '' },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  },
  { timestamps: true }
);

// For fast day/week aggregation
studySessionSchema.index({ user: 1, startedAt: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    subject: { type: String, trim: true, default: 'General' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    completedAt: { type: Date },
    tags: [{ type: String, trim: true }],
    reminder: { type: Boolean, default: false },
    reminderTime: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', subject: 'text', tags: 'text' });
taskSchema.index({ user: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: 'New conversation', maxlength: 150 },
    subject: { type: String, trim: true, default: 'General' },
    messages: { type: [aiMessageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiConversationSchema.index({ user: 1, lastMessageAt: -1 });
aiConversationSchema.index({ title: 'text', subject: 'text' });

module.exports = mongoose.model('AiConversation', aiConversationSchema);

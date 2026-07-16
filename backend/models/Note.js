const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Note title is required'], trim: true, maxlength: 150 },
    content: { type: String, default: '' },
    subject: { type: String, trim: true, default: 'General' },
    color: { type: String, default: '#6366f1' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    attachments: [
      {
        public_id: String,
        url: String,
        fileType: String,
        fileName: String,
      },
    ],
    // Populated after a PDF is uploaded and processed by the AI Study Assistant (Feature 2)
    aiSummary: {
      summary: { type: String, default: '' },
      keyPoints: [{ type: String }],
      revisionNotes: { type: String, default: '' },
      importantTopics: [{ type: String }],
      sourceFileName: { type: String, default: '' },
      generatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);

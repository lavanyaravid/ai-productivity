const Note = require('../models/Note');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { uploadBufferToCloudinary, uploadRawBufferToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { extractTextFromPdf } = require('../services/pdfService');
const { generateStudyMaterials } = require('../services/ai/aiService');

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
exports.getNotes = asyncHandler(async (req, res) => {
  const { search, subject, archived, tag } = req.query;
  const query = { user: req.user._id };

  if (search) query.$text = { $search: search };
  if (subject) query.subject = subject;
  if (tag) query.tags = tag;
  query.isArchived = archived === 'true';

  const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
  res.status(200).json({ success: true, count: notes.length, notes });
});

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  res.status(200).json({ success: true, note });
});

// @desc    Create note
// @route   POST /api/notes
// @access  Private
exports.createNote = asyncHandler(async (req, res) => {
  const note = await Note.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Note created successfully', note });
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!note) throw new ApiError('Note not found', 404);
  res.status(200).json({ success: true, message: 'Note updated successfully', note });
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);

  for (const att of note.attachments) {
    await deleteFromCloudinary(att.public_id);
  }
  await note.deleteOne();
  res.status(200).json({ success: true, message: 'Note deleted successfully' });
});

// @desc    Toggle pin
// @route   PATCH /api/notes/:id/pin
// @access  Private
exports.togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  note.isPinned = !note.isPinned;
  await note.save();
  res.status(200).json({ success: true, note });
});

// @desc    Toggle archive
// @route   PATCH /api/notes/:id/archive
// @access  Private
exports.toggleArchive = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  note.isArchived = !note.isArchived;
  await note.save();
  res.status(200).json({ success: true, note });
});

// @desc    Upload attachment to a note
// @route   POST /api/notes/:id/attachments
// @access  Private
exports.uploadAttachment = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  if (!req.file) throw new ApiError('Please provide a file to upload', 400);

  const result = await uploadBufferToCloudinary(req.file.buffer, 'student-productivity-hub/notes');
  note.attachments.push({
    public_id: result.public_id,
    url: result.secure_url,
    fileType: req.file.mimetype,
    fileName: req.file.originalname,
  });
  await note.save();
  res.status(200).json({ success: true, message: 'Attachment uploaded', note });
});

// @desc    Upload a PDF to a note, extract its text, and generate an AI summary,
//          key points, revision notes, and important topics
// @route   POST /api/notes/:id/pdf
// @access  Private
exports.uploadNotePdf = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  if (!req.file) throw new ApiError('Please provide a PDF file to upload', 400);

  // 1. Extract text from the PDF buffer
  const extractedText = await extractTextFromPdf(req.file.buffer);

  // 2. Store the PDF securely in Cloudinary (raw file, not transformed like images)
  const uploadResult = await uploadRawBufferToCloudinary(
    req.file.buffer,
    'student-productivity-hub/notes/pdfs',
    req.file.originalname
  );
  note.attachments.push({
    public_id: uploadResult.public_id,
    url: uploadResult.secure_url,
    fileType: 'application/pdf',
    fileName: req.file.originalname,
  });

  // 3. Generate structured study materials via the AI service layer
  const materials = await generateStudyMaterials(extractedText, note.subject);

  note.aiSummary = {
    ...materials,
    sourceFileName: req.file.originalname,
    generatedAt: new Date(),
  };

  await note.save();
  res.status(200).json({ success: true, message: 'PDF processed and summary generated', note });
});

// @desc    Download the generated AI summary for a note as a plain-text file
// @route   GET /api/notes/:id/ai-summary/download
// @access  Private
exports.downloadAiSummary = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError('Note not found', 404);
  if (!note.aiSummary?.summary) throw new ApiError('No AI summary has been generated for this note yet', 404);

  const { summary, keyPoints, revisionNotes, importantTopics, sourceFileName, generatedAt } = note.aiSummary;

  const lines = [
    `${note.title} — AI Summary`,
    sourceFileName ? `Source: ${sourceFileName}` : '',
    generatedAt ? `Generated: ${new Date(generatedAt).toLocaleString()}` : '',
    '',
    '## Summary',
    summary,
    '',
    '## Key Points',
    ...keyPoints.map((p) => `- ${p}`),
    '',
    '## Revision Notes',
    revisionNotes,
    '',
    '## Important Topics',
    ...importantTopics.map((t) => `- ${t}`),
  ].filter((l) => l !== '' || true);

  const content = lines.join('\n');
  const safeFileName = note.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-') || 'note-summary';

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}-summary.txt"`);
  res.status(200).send(content);
});

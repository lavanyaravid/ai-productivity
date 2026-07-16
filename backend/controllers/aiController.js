const AiConversation = require('../models/AiConversation');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateChatReply } = require('../services/ai/aiService');

// Derives a short, human-friendly title from the first user message
const deriveTitle = (message) => {
  const clean = message.trim().replace(/\s+/g, ' ');
  return clean.length > 60 ? `${clean.slice(0, 57)}...` : clean || 'New conversation';
};

// @desc    Get all conversations for the logged-in user (list view — recent conversations)
// @route   GET /api/ai/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  const { search, subject } = req.query;
  const query = { user: req.user._id };
  if (search) query.$text = { $search: search };
  if (subject) query.subject = subject;

  const conversations = await AiConversation.find(query)
    .select('title subject lastMessageAt createdAt updatedAt messages')
    .sort({ lastMessageAt: -1 })
    .limit(50);

  // Attach a lightweight preview of the last message without sending the full history
  const withPreview = conversations.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return {
      _id: c._id,
      title: c.title,
      subject: c.subject,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      preview: last ? last.content.slice(0, 120) : '',
    };
  });

  res.status(200).json({ success: true, count: withPreview.length, conversations: withPreview });
});

// @desc    Get a single conversation with full message history
// @route   GET /api/ai/conversations/:id
// @access  Private
exports.getConversation = asyncHandler(async (req, res) => {
  const conversation = await AiConversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw new ApiError('Conversation not found', 404);
  res.status(200).json({ success: true, conversation });
});

// @desc    Delete a conversation
// @route   DELETE /api/ai/conversations/:id
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await AiConversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw new ApiError('Conversation not found', 404);
  await conversation.deleteOne();
  res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
});

// @desc    Rename a conversation
// @route   PATCH /api/ai/conversations/:id
// @access  Private
exports.renameConversation = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) throw new ApiError('Title is required', 400);

  const conversation = await AiConversation.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { title: title.trim().slice(0, 150) } },
    { new: true, runValidators: true }
  );
  if (!conversation) throw new ApiError('Conversation not found', 404);
  res.status(200).json({ success: true, conversation });
});

// @desc    Send a chat message — creates a new conversation if conversationId is not provided
// @route   POST /api/ai/chat
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message, subject } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError('A message is required', 400);
  }
  if (message.length > 4000) {
    throw new ApiError('Message is too long. Please keep it under 4000 characters.', 400);
  }

  let conversation;
  if (conversationId) {
    conversation = await AiConversation.findOne({ _id: conversationId, user: req.user._id });
    if (!conversation) throw new ApiError('Conversation not found', 404);
  } else {
    conversation = await AiConversation.create({
      user: req.user._id,
      title: deriveTitle(message),
      subject: subject || 'General',
      messages: [],
    });
  }

  conversation.messages.push({ role: 'user', content: message.trim() });

  const historyForModel = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
  const replyText = await generateChatReply(historyForModel, conversation.subject);

  conversation.messages.push({ role: 'assistant', content: replyText });
  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(200).json({ success: true, conversation });
});

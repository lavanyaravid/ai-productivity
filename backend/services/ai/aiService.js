const geminiProvider = require('./geminiProvider');
const ApiError = require('../../utils/ApiError');

// Provider registry — add 'openai': require('./openaiProvider') here in the future
// and the rest of the app (controllers) never needs to change.
const PROVIDERS = {
  gemini: geminiProvider,
};

const getProvider = () => {
  const key = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  return PROVIDERS[key] || geminiProvider;
};

const STUDY_ASSISTANT_PERSONA = `You are the AI Study Assistant inside "StudyDesk", a student productivity platform.
You help students with study guidance, doubt solving, explaining concepts clearly, recommending what to study next,
and offering learning suggestions tailored to their subject. Be encouraging, concise, and clear.
Use simple language, short paragraphs, and bullet points or numbered steps when explaining processes or concepts.
If a question is ambiguous, briefly ask for the missing detail instead of guessing.
Stay focused on academic and study-related help.`;

/**
 * Generates the assistant's next reply for a conversation.
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - prior messages (oldest first), including the latest user message
 * @param {string} [subject] - optional subject context (e.g. "Physics") to tailor the persona
 * @returns {Promise<string>}
 */
const generateChatReply = async (history, subject) => {
  const provider = getProvider();
  const persona = subject && subject !== 'General'
    ? `${STUDY_ASSISTANT_PERSONA}\nThe student is currently focused on the subject: ${subject}.`
    : STUDY_ASSISTANT_PERSONA;

  // Keep only the most recent messages to bound token usage/cost.
  const MAX_HISTORY_MESSAGES = 20;
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  return provider.generateReply(trimmedHistory, persona);
};

/**
 * Generic single-shot text generation, reusable by future features
 * (e.g. PDF summarization, voice note summarization) without duplicating provider logic.
 * @param {string} prompt
 * @param {string} [systemPrompt]
 * @returns {Promise<string>}
 */
const generateText = async (prompt, systemPrompt = 'You are a helpful, precise academic assistant.') => {
  const provider = getProvider();
  return provider.generateReply([{ role: 'user', content: prompt }], systemPrompt);
};

const STUDY_MATERIALS_SYSTEM_PROMPT = `You are an academic content summarizer for a student productivity app.
Given raw study text (from a PDF or a voice note transcript), produce structured study materials.
Respond with ONLY a JSON object (no markdown fences, no commentary) matching exactly this shape:
{
  "summary": "a clear 3-6 sentence overview of the material",
  "keyPoints": ["short bullet point", "..."],
  "revisionNotes": "condensed notes suitable for last-minute revision, using short paragraphs or bullet-style lines separated by newlines",
  "importantTopics": ["topic or term worth remembering", "..."]
}
Keep keyPoints and importantTopics to at most 8 items each. Base everything strictly on the provided text — do not invent facts.`;

// Max characters of source text sent to the model, to bound cost/latency on very long documents.
const MAX_SOURCE_TEXT_CHARS = 18000;

/**
 * Generates a structured summary (summary, key points, revision notes, important topics)
 * from raw extracted text. Reused by both the PDF upload feature and the voice-notes feature.
 * @param {string} text - raw extracted/transcribed text
 * @param {string} [subject] - optional subject context
 * @returns {Promise<{summary: string, keyPoints: string[], revisionNotes: string, importantTopics: string[]}>}
 */
const generateStudyMaterials = async (text, subject) => {
  const provider = getProvider();
  if (!provider.generateJSON) {
    throw new ApiError('The configured AI provider does not support structured generation.', 501);
  }

  const truncated = text.length > MAX_SOURCE_TEXT_CHARS ? `${text.slice(0, MAX_SOURCE_TEXT_CHARS)}...` : text;
  const subjectLine = subject && subject !== 'General' ? `Subject context: ${subject}\n\n` : '';
  const prompt = `${subjectLine}Study material text:\n"""\n${truncated}\n"""`;

  const raw = await provider.generateJSON([{ role: 'user', content: prompt }], STUDY_MATERIALS_SYSTEM_PROMPT);

  let parsed;
  try {
    // Defensive: strip accidental markdown fences even though we asked for raw JSON
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new ApiError('AI generated an unexpected response format. Please try again.', 502);
  }

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 8).map(String) : [],
    revisionNotes: typeof parsed.revisionNotes === 'string' ? parsed.revisionNotes : '',
    importantTopics: Array.isArray(parsed.importantTopics) ? parsed.importantTopics.slice(0, 8).map(String) : [],
  };
};

module.exports = { generateChatReply, generateText, generateStudyMaterials };

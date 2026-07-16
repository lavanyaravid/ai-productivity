const ApiError = require('../../utils/ApiError');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Maps our internal { role, content } message shape to Gemini's `contents` format.
// Gemini has no 'system' role in contents — system instructions are sent separately.
const toGeminiContents = (messages) =>
  messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

/**
 * Sends a chat history to Gemini and returns the assistant's reply text.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages - conversation so far (oldest first)
 * @param {string} systemPrompt - persona / instructions for the assistant
 * @returns {Promise<string>} the generated reply text
 */
const generateReply = async (messages, systemPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError('AI Study Assistant is not configured. Missing GEMINI_API_KEY.', 503);
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: toGeminiContents(messages),
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('Could not reach the AI service. Please try again shortly.', 503);
  }

  if (!response.ok) {
    let details = '';
    try {
      const errJson = await response.json();
      details = errJson?.error?.message || '';
    } catch {
      // ignore parse errors
    }
    if (response.status === 429) {
      throw new ApiError('AI Study Assistant is receiving too many requests. Please try again in a moment.', 429);
    }
    throw new ApiError(`AI Study Assistant failed to respond${details ? `: ${details}` : '.'}`, 502);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

  if (!text) {
    // Handle safety blocks or empty candidates gracefully
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      throw new ApiError('That request could not be processed by the AI Study Assistant. Try rephrasing it.', 400);
    }
    throw new ApiError('AI Study Assistant returned an empty response. Please try again.', 502);
  }

  return text.trim();
};

/**
 * Same as generateReply, but instructs Gemini to return a strict JSON string
 * (no markdown fences). Used for structured features like PDF/voice-note summarization.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @param {string} systemPrompt
 * @returns {Promise<string>} raw JSON text (caller is responsible for JSON.parse)
 */
const generateJSON = async (messages, systemPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError('AI features are not configured. Missing GEMINI_API_KEY.', 503);
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: toGeminiContents(messages),
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('Could not reach the AI service. Please try again shortly.', 503);
  }

  if (!response.ok) {
    let details = '';
    try {
      const errJson = await response.json();
      details = errJson?.error?.message || '';
    } catch {
      // ignore parse errors
    }
    if (response.status === 429) {
      throw new ApiError('AI features are receiving too many requests. Please try again in a moment.', 429);
    }
    throw new ApiError(`AI generation failed${details ? `: ${details}` : '.'}`, 502);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

  if (!text) {
    throw new ApiError('AI generation returned an empty response. Please try again.', 502);
  }

  return text.trim();
};

module.exports = { generateReply, generateJSON };

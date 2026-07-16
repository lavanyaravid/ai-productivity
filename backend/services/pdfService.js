const { PDFParse } = require('pdf-parse');
const ApiError = require('../utils/ApiError');

// Removes pdf-parse's internal page-boundary markers (e.g. "-- 1 of 3 --") and
// collapses excess whitespace so the extracted text is clean before storage or AI use.
const cleanExtractedText = (rawText) =>
  rawText
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Extracts plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>} cleaned extracted text
 */
const extractTextFromPdf = async (buffer) => {
  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const cleaned = cleanExtractedText(result.text || '');

    if (!cleaned || cleaned.length < 20) {
      throw new ApiError(
        'Could not extract readable text from this PDF. It may be a scanned image without a text layer.',
        422
      );
    }

    return cleaned;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Failed to read the PDF file. Please make sure it is a valid, unencrypted PDF.', 400);
  } finally {
    if (parser?.destroy) await parser.destroy().catch(() => {});
  }
};

module.exports = { extractTextFromPdf };

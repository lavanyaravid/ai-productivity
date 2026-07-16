const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  uploadAttachment,
  uploadNotePdf,
  downloadAiSummary,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const uploadPdf = require('../middleware/uploadPdf');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router
  .route('/')
  .get(getNotes)
  .post(validate({ title: { required: true, maxLength: 150 } }), createNote);

router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);
router.patch('/:id/pin', togglePin);
router.patch('/:id/archive', toggleArchive);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.post('/:id/pdf', aiLimiter, uploadPdf.single('file'), uploadNotePdf);
router.get('/:id/ai-summary/download', downloadAiSummary);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getStudySessions, createStudySession, deleteStudySession } = require('../controllers/studySessionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getStudySessions).post(createStudySession);
router.delete('/:id', deleteStudySession);

module.exports = router;

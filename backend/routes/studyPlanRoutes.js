const express = require('express');
const router = express.Router();
const {
  getStudyPlans,
  getActivePlan,
  getStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  addBlock,
  updateBlock,
  deleteBlock,
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getStudyPlans).post(createStudyPlan);
router.get('/active', getActivePlan);
router.route('/:id').get(getStudyPlan).put(updateStudyPlan).delete(deleteStudyPlan);
router.post('/:id/blocks', addBlock);
router.route('/:id/blocks/:blockId').put(updateBlock).delete(deleteBlock);

module.exports = router;

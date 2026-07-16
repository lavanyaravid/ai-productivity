const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getGoals)
  .post(validate({ title: { required: true, maxLength: 150 } }), createGoal);

router.route('/:id').get(getGoal).put(updateGoal).delete(deleteGoal);
router.post('/:id/milestones', addMilestone);
router.patch('/:id/milestones/:milestoneId', toggleMilestone);
router.delete('/:id/milestones/:milestoneId', deleteMilestone);

module.exports = router;

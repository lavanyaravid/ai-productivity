const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  clearCompleted,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(validate({ title: { required: true, maxLength: 150 } }), createTask);

router.delete('/clear-completed', clearCompleted);
router.patch('/:id/toggle', toggleTaskStatus);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;

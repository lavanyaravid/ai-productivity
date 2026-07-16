const Notification = require('../models/Notification');

// Badge catalogue keyed by trigger condition
const BADGES = {
  FIRST_TASK: { name: 'First Step', icon: '🎯', description: 'Completed your first task' },
  TASK_10: { name: 'Task Warrior', icon: '⚔️', description: 'Completed 10 tasks' },
  TASK_50: { name: 'Task Master', icon: '🏆', description: 'Completed 50 tasks' },
  STREAK_3: { name: 'Getting Started', icon: '🔥', description: '3-day study streak' },
  STREAK_7: { name: 'Week Warrior', icon: '🔥', description: '7-day study streak' },
  STREAK_30: { name: 'Unstoppable', icon: '🚀', description: '30-day study streak' },
  POMODORO_10: { name: 'Focus Novice', icon: '🍅', description: 'Completed 10 pomodoro sessions' },
  POMODORO_50: { name: 'Focus Master', icon: '🧠', description: 'Completed 50 pomodoro sessions' },
  GOAL_FIRST: { name: 'Goal Getter', icon: '🌟', description: 'Achieved your first goal' },
};

// Awards a badge if not already earned, and creates a notification
const awardBadge = async (user, badgeKey) => {
  const badge = BADGES[badgeKey];
  if (!badge) return null;

  const alreadyHas = user.badges.some((b) => b.name === badge.name);
  if (alreadyHas) return null;

  user.badges.push(badge);

  await Notification.create({
    user: user._id,
    title: 'New Achievement Unlocked! 🎉',
    message: `You've earned the "${badge.name}" badge — ${badge.description}`,
    type: 'achievement',
  });

  return badge;
};

// Checks task-related badges
const checkTaskBadges = async (user) => {
  const count = user.totalTasksCompleted;
  if (count === 1) await awardBadge(user, 'FIRST_TASK');
  if (count === 10) await awardBadge(user, 'TASK_10');
  if (count === 50) await awardBadge(user, 'TASK_50');
};

// Checks streak-related badges
const checkStreakBadges = async (user) => {
  const streak = user.studyStreak.current;
  if (streak === 3) await awardBadge(user, 'STREAK_3');
  if (streak === 7) await awardBadge(user, 'STREAK_7');
  if (streak === 30) await awardBadge(user, 'STREAK_30');
};

// Checks pomodoro-related badges
const checkPomodoroBadges = async (user) => {
  const count = user.totalPomodorosCompleted;
  if (count === 10) await awardBadge(user, 'POMODORO_10');
  if (count === 50) await awardBadge(user, 'POMODORO_50');
};

module.exports = {
  BADGES,
  awardBadge,
  checkTaskBadges,
  checkStreakBadges,
  checkPomodoroBadges,
};

// Creates JWT, sets it as an httpOnly cookie, and sends the user object in the response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 7;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const safeUser = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    bio: user.bio,
    institution: user.institution,
    course: user.course,
    studyStreak: user.studyStreak,
    totalStudyMinutes: user.totalStudyMinutes,
    totalTasksCompleted: user.totalTasksCompleted,
    totalPomodorosCompleted: user.totalPomodorosCompleted,
    badges: user.badges,
    theme: user.theme,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token,
    user: safeUser,
  });
};

module.exports = sendTokenResponse;

const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const {
  otpEmailTemplate,
  resetPasswordEmailTemplate,
} = require("../utils/emailTemplates");
const sendTokenResponse = require("../utils/sendTokenResponse");
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinaryService");

// @desc    Register new user & send OTP for email verification
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError("An account with this email already exists", 400);
  }

  const user = await User.create({ firstName, lastName, email, password });

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Student Productivity Hub",
      html: otpEmailTemplate(user.firstName, otp),
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
    // Don't block registration if email fails in dev — still let them proceed
  }

  res.status(201).json({
    success: true,
    message:
      "Registration successful! Please check your email for the OTP to verify your account.",
    userId: user._id,
    email: user.email,
  });
});

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError("Email and OTP are required", 400);
  }

  const user = await User.findOne({ email }).select("+otp +otpExpire");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isVerified) {
    return res
      .status(200)
      .json({
        success: true,
        message: "Account already verified. Please login.",
      });
  }

  if (!user.verifyOTP(otp)) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(
    user,
    200,
    res,
    "Email verified successfully! Welcome aboard 🎉",
  );
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new ApiError("User not found", 404);
  if (user.isVerified) throw new ApiError("Account is already verified", 400);

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Your New OTP - Student Productivity Hub",
    html: otpEmailTemplate(user.firstName, otp),
  });

  res
    .status(200)
    .json({ success: true, message: "A new OTP has been sent to your email." });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    // Auto-resend an OTP so the user can verify immediately
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Student Productivity Hub",
        html: otpEmailTemplate(user.firstName, otp),
      });
    } catch (err) {
      console.error("Email sending failed:", err.message);
    }
    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message:
        "Your account is not verified. A new OTP has been sent to your email.",
    });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, `Welcome back, ${user.firstName}!`);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("There is no account with that email", 404);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - Student Productivity Hub",
      html: resetPasswordEmailTemplate(user.firstName, resetUrl),
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Password reset link sent to your email",
      });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError("Email could not be sent. Please try again later.", 500);
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  if (!req.body.password || req.body.password.length < 6) {
    throw new ApiError("Password must be at least 6 characters", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, "Password reset successful!");
});

// @desc    Change password (while logged in)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError("Current password is incorrect", 401);
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError("New password must be at least 6 characters", 400);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, "Password changed successfully");
});

// @desc    Update profile details
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "bio",
    "institution",
    "course",
    "theme",
    "notificationPreferences",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json({ success: true, message: "Profile updated successfully", user });
});

// @desc    Upload/update avatar
// @route   PUT /api/auth/update-avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("Please upload an image file", 400);
  }

  const user = await User.findById(req.user.id);

  if (user.avatar && user.avatar.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    "student-productivity-hub/avatars",
  );

  user.avatar = { public_id: result.public_id, url: result.secure_url };
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json({
      success: true,
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
});

// @desc    Remove the current custom avatar and revert to the default generated avatar
// @route   DELETE /api/auth/remove-avatar
// @access  Private
exports.removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.avatar || !user.avatar.public_id) {
    throw new ApiError("You do not have a custom avatar to remove", 400);
  }

  await deleteFromCloudinary(user.avatar.public_id);

  user.avatar = {
    public_id: "",
    url: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.fullName || user.firstName)}`,
  };
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json({
      success: true,
      message: "Avatar removed successfully",
      avatar: user.avatar,
    });
});

const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  updateAvatar,
  removeAvatar,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/upload");

// Public routes
router.post(
  "/register",
  authLimiter,
  validate({
    firstName: { required: true, maxLength: 50 },
    lastName: { required: true, maxLength: 50 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 },
  }),
  register,
);

router.post(
  "/verify-otp",
  authLimiter,
  validate({
    email: { required: true, isEmail: true },
    otp: { required: true },
  }),
  verifyOTP,
);
router.post(
  "/resend-otp",
  authLimiter,
  validate({ email: { required: true, isEmail: true } }),
  resendOTP,
);
router.post(
  "/login",
  authLimiter,
  validate({
    email: { required: true, isEmail: true },
    password: { required: true },
  }),
  login,
);
router.post(
  "/forgot-password",
  authLimiter,
  validate({ email: { required: true, isEmail: true } }),
  forgotPassword,
);
router.put("/reset-password/:resetToken", authLimiter, resetPassword);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.put("/update-profile", protect, updateProfile);
router.put("/update-avatar", protect, upload.single("avatar"), updateAvatar);
router.delete("/remove-avatar", protect, removeAvatar);

module.exports = router;

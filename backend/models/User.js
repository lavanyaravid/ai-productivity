const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      public_id: { type: String, default: '' },
      url: {
        type: String,
        default:
          'https://api.dicebear.com/7.x/initials/svg?seed=Student&backgroundColor=6366f1',
      },
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    bio: { type: String, maxlength: 200, default: '' },
    institution: { type: String, default: '' },
    course: { type: String, default: '' },

    // Email verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpire: { type: Date, select: false },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // Productivity metadata
    studyStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
    totalStudyMinutes: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    totalPomodorosCompleted: { type: Number, default: 0 },
    badges: [
      {
        name: String,
        icon: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    // Preferences
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true },
    },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Index for search
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate & hash OTP (6-digit)
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpire = Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000;
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  const hashedOTP = crypto.createHash('sha256').update(enteredOTP).digest('hex');
  return hashedOTP === this.otp && this.otpExpire > Date.now();
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
  return resetToken;
};

// Update study streak (called when user completes a task/session)
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = this.studyStreak.lastActiveDate
    ? new Date(this.studyStreak.lastActiveDate)
    : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  if (!lastActive) {
    this.studyStreak.current = 1;
  } else {
    const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // already counted today, do nothing
    } else if (diffDays === 1) {
      this.studyStreak.current += 1;
    } else {
      this.studyStreak.current = 1;
    }
  }

  if (this.studyStreak.current > this.studyStreak.longest) {
    this.studyStreak.longest = this.studyStreak.current;
  }
  this.studyStreak.lastActiveDate = today;
};

// Virtual full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

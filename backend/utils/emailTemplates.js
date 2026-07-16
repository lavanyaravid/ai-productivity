const otpEmailTemplate = (name, otp) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 22px;">📚 Student Productivity Hub</h1>
  </div>
  <div style="padding: 32px; color: #333;">
    <h2 style="margin-top:0;">Hi ${name},</h2>
    <p>Use the OTP below to verify your account. This code expires in <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.</p>
    <div style="text-align: center; margin: 28px 0;">
      <span style="display: inline-block; background: #f3f4f6; color: #6366f1; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 24px; border-radius: 10px;">${otp}</span>
    </div>
    <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #999;">
    &copy; ${new Date().getFullYear()} Student Productivity Hub. All rights reserved.
  </div>
</div>
`;

const resetPasswordEmailTemplate = (name, resetUrl) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
    <h1 style="color: #fff; margin: 0; font-size: 22px;">📚 Student Productivity Hub</h1>
  </div>
  <div style="padding: 32px; color: #333;">
    <h2 style="margin-top:0;">Hi ${name},</h2>
    <p>We received a request to reset your password. Click the button below to set a new password. This link expires in 30 minutes.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email — your password will remain unchanged.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #999;">
    &copy; ${new Date().getFullYear()} Student Productivity Hub. All rights reserved.
  </div>
</div>
`;

module.exports = { otpEmailTemplate, resetPasswordEmailTemplate };

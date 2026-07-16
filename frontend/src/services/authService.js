import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data).then((r) => r.data),
  resendOTP: (data) => api.post("/auth/resend-otp", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (data) =>
    api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (token, data) =>
    api.put(`/auth/reset-password/${token}`, data).then((r) => r.data),
  changePassword: (data) =>
    api.put("/auth/change-password", data).then((r) => r.data),
  updateProfile: (data) =>
    api.put("/auth/update-profile", data).then((r) => r.data),
  updateAvatar: (formData) =>
    api
      .put("/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  removeAvatar: () => api.delete("/auth/remove-avatar").then((r) => r.data),
};

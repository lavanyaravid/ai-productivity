import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Camera, Save, Lock, Sun, Moon, Award, Flame, X } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { authService } from "../services/authService";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      bio: user?.bio,
      institution: user?.institution,
      course: user?.course,
    },
  });

  const passwordForm = useForm();

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await authService.updateAvatar(formData);
      updateUser({ avatar: res.avatar });
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onRemoveAvatar = async () => {
    if (
      !confirm("Remove your profile picture and revert to the default avatar?")
    )
      return;
    setAvatarUploading(true);
    try {
      const res = await authService.removeAvatar();
      updateUser({ avatar: res.avatar });
      toast.success("Avatar removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSavingPassword(true);
    try {
      await authService.changePassword(data);
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50">
          Profile
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={
              user?.avatar?.url ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName}`
            }
            className="w-24 h-24 rounded-2xl object-cover bg-amber-100"
            alt="avatar"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-ink-950 flex items-center justify-center shadow-lg hover:bg-amber-300 disabled:opacity-60"
          >
            <Camera size={14} />
          </button>
          {user?.avatar?.public_id && (
            <button
              onClick={onRemoveAvatar}
              disabled={avatarUploading}
              title="Remove profile picture"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center shadow-lg hover:bg-coral-400 disabled:opacity-60"
            >
              <X size={12} />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onAvatarChange}
          />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-50">
            {user?.fullName}
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {user?.email}
          </p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <Badge tone="coral">
              <Flame size={11} className="inline mr-1" />
              {user?.studyStreak?.current || 0}-day streak
            </Badge>
            <Badge tone="amber">
              <Award size={11} className="inline mr-1" />
              {user?.badges?.length || 0} badges
            </Badge>
          </div>
        </div>
        {avatarUploading && (
          <span className="text-xs text-ink-400">Uploading...</span>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">
            Appearance
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon size={18} className="text-violet-400" />
            ) : (
              <Sun size={18} className="text-amber-500" />
            )}
            <span className="text-sm text-ink-700 dark:text-ink-200">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-amber-400" : "bg-ink-200"}`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-5">
          Personal details
        </h3>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              {...profileForm.register("firstName", { required: true })}
            />
            <Input
              label="Last name"
              {...profileForm.register("lastName", { required: true })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Institution"
              placeholder="Your university"
              {...profileForm.register("institution")}
            />
            <Input
              label="Course"
              placeholder="e.g. Computer Science"
              {...profileForm.register("course")}
            />
          </div>
          <TextArea
            label="Bio"
            rows={3}
            placeholder="A short intro about you..."
            {...profileForm.register("bio")}
          />
          <Button type="submit" icon={Save} loading={savingProfile}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50 mb-5">
          Change password
        </h3>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4 max-w-md"
        >
          <Input
            label="Current password"
            type="password"
            icon={Lock}
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword", {
              required: "Required",
            })}
          />
          <Input
            label="New password"
            type="password"
            icon={Lock}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword", {
              required: "Required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
          />
          <Button type="submit" variant="outline" loading={savingPassword}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}

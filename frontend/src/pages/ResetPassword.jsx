import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authService } from '../services/authService';
import { IMAGES } from '../utils/images';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, { password: data.password });
      toast.success('Password reset! You can sign in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout image={IMAGES.forgotBg}>
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-ink-800 flex items-center justify-center mb-6">
        <KeyRound size={26} className="text-amber-500" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Set a new password
      </h1>
      <p className="text-ink-500 dark:text-ink-400 mb-8">Make it something you'll remember.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Reset password
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-8">
        <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

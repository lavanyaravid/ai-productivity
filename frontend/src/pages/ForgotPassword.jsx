import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authService } from '../services/authService';
import { IMAGES } from '../utils/images';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout image={IMAGES.forgotBg}>
        <div className="w-14 h-14 rounded-2xl bg-mint-400/10 flex items-center justify-center mb-6">
          <CheckCircle2 size={26} className="text-mint-500" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
          Check your inbox
        </h1>
        <p className="text-ink-500 dark:text-ink-400 mb-8">
          We've sent a password reset link to <strong className="text-ink-700 dark:text-ink-200">{getValues('email')}</strong>. The link expires in 10 minutes.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full" size="lg">Back to sign in</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout image={IMAGES.forgotBg}>
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Forgot password?
      </h1>
      <p className="text-ink-500 dark:text-ink-400 mb-8">
        No worries — enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@university.edu"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        <Button type="submit" className="w-full" size="lg" loading={loading} icon={Send}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-8">
        <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

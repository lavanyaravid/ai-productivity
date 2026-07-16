import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../utils/images';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data);
      toast.success(`Welcome back, ${res.user?.firstName || 'there'}!`);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      const payload = err.response?.data;
      if (payload?.requiresVerification) {
        toast('Please verify your email first — we sent a fresh OTP.', { icon: '📩' });
        navigate('/verify-otp', { state: { email: payload.email || data.email } });
        return;
      }
      toast.error(payload?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout image={IMAGES.loginBg}>
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Welcome back
      </h1>
      <p className="text-ink-500 dark:text-ink-400 mb-8">
        Pick up right where you left off.
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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-[38px] text-ink-400 hover:text-ink-600"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading} icon={LogIn}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-8">
        New to StudyDesk?{' '}
        <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

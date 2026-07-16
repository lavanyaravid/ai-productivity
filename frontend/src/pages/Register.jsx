import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../utils/images';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success(res.message || 'Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout image={IMAGES.registerBg}>
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Create your account
      </h1>
      <p className="text-ink-500 dark:text-ink-400 mb-8">
        Free forever. Set up in under a minute.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            icon={User}
            placeholder="Ada"
            error={errors.firstName?.message}
            {...register('firstName', { required: 'Required', maxLength: { value: 40, message: 'Too long' } })}
          />
          <Input
            label="Last name"
            placeholder="Lovelace"
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Required', maxLength: { value: 40, message: 'Too long' } })}
          />
        </div>

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
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-[38px] text-ink-400 hover:text-ink-600"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />

        <label className="flex items-start gap-2.5 text-sm text-ink-500 dark:text-ink-400">
          <input
            type="checkbox"
            className="mt-0.5 accent-amber-400"
            {...register('terms', { required: 'Please accept the terms to continue' })}
          />
          I agree to the Terms of Service and Privacy Policy
        </label>
        {errors.terms && <p className="text-xs text-coral-500 -mt-3">{errors.terms.message}</p>}

        <Button type="submit" className="w-full" size="lg" loading={loading} icon={UserPlus}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../utils/images';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const email = location.state?.email;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[idx] = value.slice(-1);
    setDigits(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      setDigits(pasted.split('').concat(Array(6 - pasted.length).fill('')));
      e.preventDefault();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) {
      toast.error('Enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp });
      toast.success(res.message || 'Email verified! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP({ email });
      toast.success('A new OTP has been sent to your email.');
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout image={IMAGES.forgotBg}>
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-ink-800 flex items-center justify-center mb-6">
        <ShieldCheck size={26} className="text-amber-500" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Verify your email
      </h1>
      <p className="text-ink-500 dark:text-ink-400 mb-8">
        We sent a 6-digit code to <span className="font-medium text-ink-700 dark:text-ink-200">{email}</span>
      </p>

      <form onSubmit={onSubmit}>
        <div className="flex gap-2.5 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-paper-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all"
            />
          ))}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Verify account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
        Didn't get the code?{' '}
        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
        </button>
      </p>
      <p className="text-center text-sm text-ink-400 mt-3">
        <Link to="/login" className="hover:text-ink-600">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}

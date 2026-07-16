import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-amber-400 text-ink-950 hover:bg-amber-300 shadow-[0_8px_24px_-8px_rgba(245,184,65,0.55)] active:scale-[0.98]',
  secondary:
    'bg-ink-800 text-paper-50 hover:bg-ink-700 dark:bg-ink-800 dark:hover:bg-ink-700 border border-ink-600',
  ghost:
    'bg-transparent text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800',
  outline:
    'bg-transparent border border-ink-300 dark:border-ink-600 text-ink-800 dark:text-ink-100 hover:border-amber-400 hover:text-amber-500',
  danger:
    'bg-coral-500/10 text-coral-500 border border-coral-500/30 hover:bg-coral-500/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', loading = false, icon: Icon, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;

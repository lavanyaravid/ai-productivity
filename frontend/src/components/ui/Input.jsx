import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-paper-50 dark:bg-ink-800 border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 placeholder:text-ink-400 px-4 py-2.5 ${
            Icon ? 'pl-10' : ''
          } focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all ${
            error ? 'border-coral-500 focus:ring-coral-500/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-coral-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;

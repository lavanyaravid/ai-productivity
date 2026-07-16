import { Check } from 'lucide-react';

export default function Checkbox({ checked, onChange, className = '' }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
        checked
          ? 'bg-amber-400 border-amber-400'
          : 'border-ink-300 dark:border-ink-600 hover:border-amber-400'
      } ${className}`}
    >
      {checked && <Check size={13} strokeWidth={3} className="text-ink-950" />}
    </button>
  );
}

const tones = {
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  violet: 'bg-violet-300/20 text-violet-600 dark:text-violet-300',
  mint: 'bg-mint-400/10 text-mint-500 dark:text-mint-400',
  coral: 'bg-coral-400/10 text-coral-500 dark:text-coral-400',
  ink: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
};

export default function Badge({ children, tone = 'ink', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

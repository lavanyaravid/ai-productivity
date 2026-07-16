export default function Card({ children, className = '', hover = false, as: Component = 'div', ...props }) {
  return (
    <Component
      className={`bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-[var(--radius-card)] shadow-sm ${
        hover ? 'transition-all duration-200 hover:shadow-lg hover:border-amber-300/50 dark:hover:border-amber-400/30 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

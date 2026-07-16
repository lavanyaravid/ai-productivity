export default function Loader({ size = 32, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-400">
      <div
        className="rounded-full border-2 border-ink-200 dark:border-ink-700 border-t-amber-400 animate-spin"
        style={{ width: size, height: size }}
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

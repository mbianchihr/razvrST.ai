export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight select-none ${className}`}
    >
      <span className="text-ink">razvr</span>
      <span className="text-mint">ST</span>
      <span className="text-ink-soft">.ai</span>
    </span>
  );
}

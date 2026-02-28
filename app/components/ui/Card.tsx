export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl bg-white shadow-soft border border-black/5 ${className}`}>{children}</div>;
}
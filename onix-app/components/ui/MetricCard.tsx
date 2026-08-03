interface MetricCardProps {
  label: string;
  value: string | number;
  change: number;
  prefix?: string;
}

export default function MetricCard({ label, value, change, prefix = '' }: MetricCardProps) {
  const positive = change >= 0;
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
    >
      <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--onix-muted)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--onix-gold)' }}>
        {prefix}{value}
      </p>
      <p className="text-xs" style={{ color: positive ? 'var(--onix-green)' : 'var(--onix-red)' }}>
        {positive ? '↑' : '↓'} {Math.abs(change)}% vs last month
      </p>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number; // 0–100
}

export default function ScoreBar({ label, score }: ScoreBarProps) {
  const color =
    score >= 75 ? 'var(--onix-green)'
    : score >= 50 ? 'var(--onix-amber)'
    : 'var(--onix-red)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--onix-muted)' }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{score}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--onix-border)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

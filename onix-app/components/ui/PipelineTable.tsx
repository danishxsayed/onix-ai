import { Deal } from '@/lib/api';

interface PipelineTableProps {
  deals: Deal[];
  onAdvance: (id: string) => void;
}

export default function PipelineTable({ deals, onAdvance }: PipelineTableProps) {
  return (
    <table className="w-full text-sm min-w-[600px]" data-testid="pipeline-table">
      <thead>
        <tr style={{ borderBottom: '1px solid var(--onix-border)' }}>
          {['Deal', 'Sector', 'Stage', 'Value', 'Fit Score', 'Agent'].map((h) => (
            <th
              key={h}
              className="px-5 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--onix-muted)' }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {deals.map((deal) => (
          <tr
            key={deal.id}
            className="transition-colors"
            style={{ borderBottom: '1px solid var(--onix-border)' }}
          >
            <td className="px-5 py-3 font-medium" style={{ color: 'var(--onix-text)' }}>
              {deal.name}
            </td>
            <td className="px-5 py-3" style={{ color: 'var(--onix-muted)' }}>
              {deal.sector}
            </td>
            <td className="px-5 py-3">
              <button
                onClick={() => onAdvance(deal.id)}
                title="Click to advance stage"
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{ background: 'var(--onix-surface)', color: 'var(--onix-amber)' }}
              >
                {deal.stage} →
              </button>
            </td>
            <td className="px-5 py-3" style={{ color: 'var(--onix-text)' }}>
              {deal.value}
            </td>
            <td className="px-5 py-3">
              <span className="font-semibold" style={{ color: 'var(--onix-gold)' }}>
                {deal.fit_score}%
              </span>
            </td>
            <td className="px-5 py-3" style={{ color: 'var(--onix-muted)' }}>
              {deal.assigned_agent}
            </td>
          </tr>
        ))}
        {deals.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="px-5 py-8 text-center text-sm"
              style={{ color: 'var(--onix-muted)' }}
            >
              No deals yet — click + New Deal to add one.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

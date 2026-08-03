'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboard, fetchDeals } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import ScoreBar from '@/components/ui/ScoreBar';
import { MetricCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

const STAGES = ['Diagnose', 'Prepare', 'Match', 'Outreach', 'Close'];

export default function DashboardPage() {
  const { data: dash, isLoading: dashLoading, isError: dashError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
  });

  const notConfigured = dashError || (!dashLoading && !dash);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Setup banner ── */}
      {notConfigured && (
        <div
          className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ background: 'rgba(232,167,48,0.08)', border: '1px solid rgba(232,167,48,0.3)' }}
        >
          <span style={{ color: 'var(--onix-amber)' }}>⚠</span>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--onix-amber)' }}>
              Database not connected
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--onix-muted)' }}>
              Run <code style={{ color: 'var(--onix-gold)' }}>supabase-setup.sql</code> in your Supabase SQL Editor, then restart the dev server.
            </p>
          </div>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {dashLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : dashError || !dash ? (
          <>
            <MetricCard label="Active Deals"      value={0}    change={0} />
            <MetricCard label="Total Value"       value="0"    change={0} prefix="$" />
            <MetricCard label="Avg Fit Score"     value="0%"   change={0} />
            <MetricCard label="Closed This Month" value={0}    change={0} />
          </>
        ) : (
          <>
            <MetricCard label="Active Deals"     value={dash.metrics.activeDeals}       change={dash.metrics.activeDealsChange} />
            <MetricCard label="Total Value"      value={dash.metrics.totalValue}         change={dash.metrics.totalValueChange}   prefix="$" />
            <MetricCard label="Avg Fit Score"    value={`${dash.metrics.avgFitScore}%`}  change={dash.metrics.avgFitScoreChange} />
            <MetricCard label="Closed This Month" value={dash.metrics.closedThisMonth}  change={dash.metrics.closedThisMonthChange} />
          </>
        )}
      </div>

      {/* ── Deal Stage Strip ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--onix-text)' }}>
          Deal Stages
        </h2>
        <div className="flex gap-2">
          {dashLoading
            ? STAGES.map((s) => <Skeleton key={s} className="flex-1 h-10 rounded-lg" />)
            : STAGES.map((stage, i) => {
                const count = dash?.stages?.[i]?.count ?? 0;
                return (
                  <div
                    key={stage}
                    className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-lg"
                    style={{ background: 'var(--onix-surface)', border: '1px solid var(--onix-border)' }}
                  >
                    <span className="text-lg font-semibold" style={{ color: 'var(--onix-gold)' }}>
                      {count}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: 'var(--onix-muted)' }}>
                      {stage}
                    </span>
                  </div>
                );
              })}
        </div>
      </div>

      {/* ── Pipeline Table + Readiness ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Pipeline Table */}
        <div
          className="col-span-2 rounded-xl overflow-hidden"
          style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--onix-border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--onix-text)' }}>
              Pipeline Overview
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--onix-border)' }}>
                {['Deal', 'Sector', 'Stage', 'Value', 'Fit'].map((h) => (
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
              {dealsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--onix-border)' }}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <Skeleton className="h-3 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (deals ?? []).slice(0, 5).map((deal) => (
                    <tr
                      key={deal.id}
                      style={{ borderBottom: '1px solid var(--onix-border)' }}
                    >
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--onix-text)' }}>
                        {deal.name}
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--onix-muted)' }}>
                        {deal.sector}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--onix-surface)', color: 'var(--onix-amber)' }}
                        >
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--onix-text)' }}>
                        {deal.value}
                      </td>
                      <td className="px-5 py-3 font-semibold" style={{ color: 'var(--onix-gold)' }}>
                        {deal.fit_score}%
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Investment Readiness */}
        <div
          className="rounded-xl p-5 flex flex-col gap-5"
          style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--onix-text)' }}>
            Investment Readiness
          </h2>

          {/* SVG Dial */}
          {dashLoading ? (
            <Skeleton className="w-32 h-32 rounded-full mx-auto" />
          ) : (
            <ReadinessDial value={dash?.readiness?.overall ?? 0} />
          )}

          {/* Category Bars */}
          <div className="flex flex-col gap-3">
            {dashLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
              : (dash?.readiness?.categories ?? []).map((cat) => (
                  <ScoreBar key={cat.label} label={cat.label} score={cat.score} />
                ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--onix-text)' }}>
          Recent Activity
        </h2>
        <div className="flex flex-col gap-3">
          {dashLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            : (dash?.activity ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-2"
                  style={{ borderBottom: '1px solid var(--onix-border)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--onix-text)' }}>
                    {item.message}
                  </p>
                  <span className="text-xs ml-4 flex-shrink-0" style={{ color: 'var(--onix-muted)' }}>
                    {item.time}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

/* ── Readiness Dial SVG ── */
function ReadinessDial({ value }: { value: number }) {
  const r   = 48;
  const cx  = 64;
  const cy  = 64;
  const circ = 2 * Math.PI * r;
  // Semi-circle arc (180°)
  const arc  = circ / 2;
  const fill = (value / 100) * arc;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="80" viewBox="0 0 128 80">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--onix-border)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--onix-gold)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${arc}`}
        />
      </svg>
      <span className="text-2xl font-semibold -mt-4" style={{ color: 'var(--onix-gold)' }}>
        {value}%
      </span>
      <span className="text-xs" style={{ color: 'var(--onix-muted)' }}>
        Overall Readiness
      </span>
    </div>
  );
}

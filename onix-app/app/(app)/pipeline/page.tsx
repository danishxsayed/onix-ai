'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeals, createDeal, advanceDeal, Deal } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import PipelineTable from '@/components/ui/PipelineTable';
import { MetricCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

const STAGES = ['Diagnose', 'Prepare', 'Match', 'Outreach', 'Close'];
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Real Estate', 'Energy', 'Other'];

export default function PipelinePage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const { data: deals = [], isLoading, isError } = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
  });

  /* ── Derived metrics ── */
  const metrics = {
    total:  deals.length,
    active: deals.filter((d) => d.status === 'active').length,
    avgFit: deals.length ? Math.round(deals.reduce((s, d) => s + d.fit_score, 0) / deals.length) : 0,
    closed: deals.filter((d) => d.status === 'closed').length,
  };

  const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = deals.filter((d) => d.stage === s).length;
    return acc;
  }, {});

  const filtered = activeStage ? deals.filter((d) => d.stage === activeStage) : deals;

  /* ── Advance deal mutation ── */
  const advanceMutation = useMutation({
    mutationFn: advanceDeal,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['deals'] });
      const prev = qc.getQueryData<Deal[]>(['deals']);
      qc.setQueryData<Deal[]>(['deals'], (old = []) =>
        old.map((d) => {
          if (d.id !== id) return d;
          const idx = STAGES.indexOf(d.stage);
          return { ...d, stage: STAGES[Math.min(idx + 1, STAGES.length - 1)] };
        })
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['deals'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });

  return (
    <div className="flex flex-col gap-6">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Deals"   value={metrics.total}          change={8}  />
            <MetricCard label="Active Deals"  value={metrics.active}         change={12} />
            <MetricCard label="Avg Fit Score" value={`${metrics.avgFit}%`}  change={3}  />
            <MetricCard label="Closed"        value={metrics.closed}         change={-2} />
          </>
        )}
      </div>

      {/* ── Stage Strip ── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--onix-text)' }}>
          Pipeline Stages
        </h2>
        <div className="flex gap-2">
          {STAGES.map((stage) => {
            const active = activeStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setActiveStage(active ? null : stage)}
                className="flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all"
                style={{
                  background: active ? 'rgba(201,168,76,0.12)' : 'var(--onix-surface)',
                  border: `1px solid ${active ? 'var(--onix-gold)' : 'var(--onix-border)'}`,
                }}
              >
                <span className="text-xl font-semibold" style={{ color: 'var(--onix-gold)' }}>
                  {isLoading ? '–' : stageCounts[stage] ?? 0}
                </span>
                <span className="text-xs mt-0.5" style={{ color: active ? 'var(--onix-gold)' : 'var(--onix-muted)' }}>
                  {stage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Deals Table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--onix-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--onix-text)' }}>
            Deals {activeStage ? `— ${activeStage}` : ''}
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
          >
            + New Deal
          </button>
        </div>

        {isError && (
          <p className="px-5 py-4 text-sm" style={{ color: 'var(--onix-red)' }}>
            Failed to load deals. Please refresh.
          </p>
        )}

        {isLoading ? (
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--onix-border)' }}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3">
                      <Skeleton className="h-3 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <PipelineTable deals={filtered} onAdvance={(id) => advanceMutation.mutate(id)} />
        )}
      </div>

      {/* ── New Deal Modal ── */}
      {showModal && <NewDealModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ── New Deal Modal ── */
function NewDealModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', sector: '', value: '', stage: 'Diagnose', assigned_agent: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createDeal,
    onMutate: async (newDeal) => {
      await qc.cancelQueries({ queryKey: ['deals'] });
      const prev = qc.getQueryData<Deal[]>(['deals']);
      const optimistic: Deal = {
        id: `temp-${Date.now()}`,
        user_id: '',
        status: 'active',
        fit_score: 0,
        assigned_agent: newDeal.assigned_agent ?? '',
        created_at: new Date().toISOString(),
        name: newDeal.name ?? '',
        sector: newDeal.sector ?? '',
        stage: newDeal.stage ?? 'Diagnose',
        value: newDeal.value ?? '',
      };
      qc.setQueryData<Deal[]>(['deals'], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['deals'], ctx.prev);
      setError(err instanceof Error ? err.message : 'Failed to create deal. Please try again.');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sector || !form.value) {
      setError('Name, sector and value are required.');
      return;
    }
    setError('');
    mutation.mutate(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-5"
        style={{ background: 'var(--onix-surface)', border: '1px solid var(--onix-border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--onix-text)' }}>
            New Deal
          </h2>
          <button onClick={onClose} style={{ color: 'var(--onix-muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Deal Name',      key: 'name',           type: 'text', placeholder: 'Acme Corp Acquisition' },
            { label: 'Value',          key: 'value',          type: 'text', placeholder: '$5M' },
            { label: 'Assigned Agent', key: 'assigned_agent', type: 'text', placeholder: 'John Smith' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>{label}</label>
              <input
                type={type}
                required={key !== 'assigned_agent'}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="rounded-lg px-4 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--onix-card)',
                  border: '1px solid var(--onix-border)',
                  color: 'var(--onix-text)',
                }}
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>Sector</label>
            <select
              required
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              className="rounded-lg px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--onix-card)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-text)',
              }}
            >
              <option value="">Select sector</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>Starting Stage</label>
            <select
              value={form.stage}
              onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
              className="rounded-lg px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--onix-card)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-text)',
              }}
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--onix-red)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'var(--onix-card)', color: 'var(--onix-muted)', border: '1px solid var(--onix-border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
            >
              {mutation.isPending ? 'Creating…' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

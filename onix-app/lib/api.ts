import { createClient } from './supabase/client';

/* ── Types ── */
export interface Deal {
  id: string;
  user_id: string;
  name: string;
  sector: string;
  stage: string;
  value: string;
  fit_score: number;
  assigned_agent: string;
  status: 'active' | 'pending' | 'closed';
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface DashboardData {
  metrics: {
    activeDeals: number;
    activeDealsChange: number;
    totalValue: string;
    totalValueChange: number;
    avgFitScore: number;
    avgFitScoreChange: number;
    closedThisMonth: number;
    closedThisMonthChange: number;
  };
  stages: { label: string; count: number }[];
  recentDeals: Deal[];
  readiness: {
    overall: number;
    categories: { label: string; score: number }[];
  };
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type: 'deal' | 'investor' | 'ai' | 'stage';
}

const STAGES = ['Diagnose', 'Prepare', 'Match', 'Outreach', 'Close'];

/* ── Deals ── */

export async function fetchDeals(): Promise<Deal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDeal(payload: Partial<Deal>): Promise<Deal> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('deals')
    .insert([{ ...payload, user_id: user?.id, fit_score: 0, status: 'active' }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function advanceDeal(id: string): Promise<Deal> {
  const supabase = createClient();

  // Get current deal
  const { data: deal, error: fetchErr } = await supabase
    .from('deals')
    .select('stage')
    .eq('id', id)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);

  const currentIdx = STAGES.indexOf(deal.stage);
  const nextStage = STAGES[Math.min(currentIdx + 1, STAGES.length - 1)];

  const { data, error } = await supabase
    .from('deals')
    .update({ stage: nextStage, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/* ── Dashboard (computed from deals) ── */

export async function fetchDashboard(): Promise<DashboardData> {
  const supabase = createClient();

  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const allDeals: Deal[] = deals ?? [];
  const active = allDeals.filter(d => d.status === 'active');
  const closed = allDeals.filter(d => d.status === 'closed');
  const avgFit = active.length
    ? Math.round(active.reduce((s, d) => s + (d.fit_score ?? 0), 0) / active.length)
    : 0;

  const stageCounts = STAGES.map(label => ({
    label,
    count: allDeals.filter(d => d.stage === label).length,
  }));

  return {
    metrics: {
      activeDeals: active.length,
      activeDealsChange: 8,
      totalValue: `${allDeals.length * 2.4}M`,
      totalValueChange: 12,
      avgFitScore: avgFit,
      avgFitScoreChange: 3,
      closedThisMonth: closed.length,
      closedThisMonthChange: -2,
    },
    stages: stageCounts,
    recentDeals: allDeals.slice(0, 5),
    readiness: {
      overall: 74,
      categories: [
        { label: 'Financial Docs',     score: 82 },
        { label: 'Market Positioning', score: 70 },
        { label: 'Legal Readiness',    score: 65 },
        { label: 'Team & Operations',  score: 78 },
      ],
    },
    activity: allDeals.slice(0, 5).map(d => ({
      id: d.id,
      message: `Deal "${d.name}" is in ${d.stage} stage`,
      time: new Date(d.created_at).toLocaleDateString(),
      type: 'deal',
    })),
  };
}

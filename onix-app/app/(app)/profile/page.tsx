'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editName, setEditName] = useState('');
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, role, created_at')
        .eq('id', user.id)
        .single();

      const p: ProfileData = {
        full_name:  data?.full_name  ?? user.user_metadata?.full_name ?? '',
        email:      data?.email      ?? user.email ?? '',
        role:       data?.role       ?? 'user',
        created_at: data?.created_at ?? user.created_at ?? '',
      };
      setProfile(p);
      setEditName(p.full_name);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) { setError('Name cannot be empty.'); return; }
    setSaving(true);
    setError('');
    setSuccess('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (dbErr) {
      setError(dbErr.message);
    } else {
      setProfile((p) => p ? { ...p, full_name: editName.trim() } : p);
      setSuccess('Profile updated successfully.');
    }
    setSaving(false);
  }

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* ── Avatar + identity card ── */}
      <div
        className="rounded-xl p-6 flex items-center gap-5"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        {loading ? (
          <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: 'var(--onix-border)' }} />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col gap-1">
          {loading ? (
            <>
              <div className="h-5 w-40 rounded animate-pulse" style={{ background: 'var(--onix-border)' }} />
              <div className="h-3 w-56 rounded animate-pulse mt-1" style={{ background: 'var(--onix-border)' }} />
            </>
          ) : (
            <>
              <p className="text-base font-semibold" style={{ color: 'var(--onix-text)' }}>
                {profile?.full_name || '—'}
              </p>
              <p className="text-sm" style={{ color: 'var(--onix-muted)' }}>{profile?.email}</p>
              <span
                className="text-xs px-2 py-0.5 rounded mt-1 self-start capitalize"
                style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--onix-gold)', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                {profile?.role}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Edit form ── */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--onix-text)' }}>
          Personal Information
        </h2>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={loading}
              placeholder="Your full name"
              className="rounded-lg px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--onix-surface)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-text)',
              }}
            />
          </div>

          {/* Email — read only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="rounded-lg px-4 py-2.5 text-sm outline-none opacity-50 cursor-not-allowed"
              style={{
                background: 'var(--onix-surface)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-muted)',
              }}
            />
            <p className="text-xs" style={{ color: 'var(--onix-muted)' }}>
              Email cannot be changed here. Contact support to update it.
            </p>
          </div>

          {success && (
            <p className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(46,204,138,0.08)', color: 'var(--onix-green)', border: '1px solid rgba(46,204,138,0.2)' }}>
              ✓ {success}
            </p>
          )}
          {error && (
            <p className="text-xs" style={{ color: 'var(--onix-red)' }}>{error}</p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Account info ── */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--onix-card)', border: '1px solid var(--onix-border)' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--onix-text)' }}>
          Account Details
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Member since', value: joinedDate },
            { label: 'Account role',  value: profile?.role ?? '—' },
            { label: 'Platform',      value: 'ONIX AI Deal Room' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--onix-border)' }}>
              <span className="text-xs" style={{ color: 'var(--onix-muted)' }}>{label}</span>
              <span className="text-sm capitalize" style={{ color: 'var(--onix-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loginRequest } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginRequest({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--onix-dark)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-10 flex flex-col gap-8"
        style={{ background: 'var(--onix-surface)', border: '1px solid var(--onix-border)' }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="ONIX AI" width={120} height={40} style={{ objectFit: 'contain' }} />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--onix-text)' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--onix-muted)' }}>
            Sign in to your deal room
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@onixai.co.in"
              className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'var(--onix-card)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-text)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'var(--onix-card)',
                border: '1px solid var(--onix-border)',
                color: 'var(--onix-text)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--onix-red)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg py-3 text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--onix-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--onix-gold)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

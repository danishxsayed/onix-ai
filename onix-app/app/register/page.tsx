'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { registerRequest } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerRequest({ email, password, fullName });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12"
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

        {success ? (
          <div className="text-center flex flex-col gap-4">
            <div className="text-4xl">✓</div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--onix-green)' }}>
              Check your email
            </h1>
            <p className="text-sm" style={{ color: 'var(--onix-muted)' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--onix-text)' }}>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-2 py-3 rounded-lg text-sm font-semibold text-center block"
              style={{ background: 'var(--onix-gold)', color: '#0D0D0D' }}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--onix-text)' }}>
                Create your account
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--onix-muted)' }}>
                Join the ONIX AI deal room
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {[
                { label: 'Full Name', value: fullName, setter: setFullName, type: 'text',     placeholder: 'Robin Kumar' },
                { label: 'Email',     value: email,    setter: setEmail,    type: 'email',    placeholder: 'you@onixai.co.in' },
                { label: 'Password',  value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
                { label: 'Confirm Password', value: confirm, setter: setConfirm, type: 'password', placeholder: '••••••••' },
              ].map(({ label, value, setter, type, placeholder }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--onix-muted)' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="rounded-lg px-4 py-3 text-sm outline-none"
                    style={{
                      background: 'var(--onix-card)',
                      border: '1px solid var(--onix-border)',
                      color: 'var(--onix-text)',
                    }}
                  />
                </div>
              ))}

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
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm" style={{ color: 'var(--onix-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--onix-gold)' }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

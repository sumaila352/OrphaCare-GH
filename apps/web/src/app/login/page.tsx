'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';
import { PublicLayout } from '@/components/PublicLayout';
import { ContinueWithGoogle } from '@/components/ContinueWithGoogle';
import { PasswordField } from '@/components/PasswordField';
import { login } from '@/lib/api';
import { homePathForUser } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const { token, user } = await login(String(fd.get('email')), String(fd.get('password')));
      localStorage.setItem('token', token);
      router.push(next && next.startsWith('/') ? next : homePathForUser(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function afterGoogleAuth(token: string, user: Parameters<typeof homePathForUser>[0]) {
    localStorage.setItem('token', token);
    router.push(next && next.startsWith('/') ? next : homePathForUser(user));
  }

  return (
    <div className="container py-4 py-md-5 px-3">
      <div className="card auth-card mx-auto" style={{ maxWidth: 440, width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1">Welcome back</h1>
          <p className="text-muted small mb-4">Donors track gifts; staff use the admin dashboard.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <ContinueWithGoogle
            disabled={loading}
            onSuccess={({ token, user }) => afterGoogleAuth(token, user)}
            onError={setError}
          />
          <form onSubmit={onSubmit} className="vstack gap-3">
            <div>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" required disabled={loading} />
            </div>
            <PasswordField name="password" label="Password" required disabled={loading} autoComplete="current-password" />
            <button className="btn-oc-primary w-100 border-0" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in…' : 'Login with email'}
            </button>
            <div className="d-flex justify-content-between small">
              <Link href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}>
                Create donor account
              </Link>
              <Link href="/">← Home</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>}>
        <LoginForm />
      </Suspense>
    </PublicLayout>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { ContinueWithGoogle } from '@/components/ContinueWithGoogle';
import { PasswordField } from '@/components/PasswordField';
import { PublicLayout } from '@/components/PublicLayout';
import { register } from '@/lib/api';
import { homePathForUser } from '@/lib/auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function afterAuth(token: string, user: Parameters<typeof homePathForUser>[0]) {
    localStorage.setItem('token', token);
    router.push(next && next.startsWith('/') ? next : homePathForUser(user));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));
    const confirmPassword = String(fd.get('confirmPassword'));
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const { token, user } = await register(
        String(fd.get('fullName')),
        String(fd.get('email')),
        password,
        confirmPassword,
      );
      afterAuth(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4 py-md-5 px-3">
      <div className="card auth-card mx-auto" style={{ maxWidth: 440, width: '100%' }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-1">Create donor account</h1>
          <p className="text-muted small mb-4">Sign up to donate and track your contributions.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <ContinueWithGoogle
            disabled={loading}
            onSuccess={({ token, user }) => afterAuth(token, user)}
            onError={setError}
          />
          <form onSubmit={onSubmit} className="vstack gap-3">
            <div>
              <label className="form-label">Full name</label>
              <input className="form-control" name="fullName" required disabled={loading} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" required disabled={loading} />
            </div>
            <PasswordField
              name="password"
              label="Password"
              minLength={8}
              autoComplete="new-password"
              required
              disabled={loading}
              hint="At least 8 characters"
            />
            <PasswordField
              name="confirmPassword"
              label="Confirm password"
              minLength={8}
              autoComplete="new-password"
              required
              disabled={loading}
            />
            <button className="btn-oc-primary w-100 border-0" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating…' : 'Register with email'}
            </button>
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="small text-center">
              Already have an account? Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="container py-5 text-center"><div className="spinner-border text-primary" /></div>}>
        <RegisterForm />
      </Suspense>
    </PublicLayout>
  );
}

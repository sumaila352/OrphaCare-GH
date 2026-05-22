'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { PublicLayout } from '@/components/PublicLayout';
import { register } from '@/lib/api';
import { homePathForUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      localStorage.setItem('token', token);
      router.push(homePathForUser(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="container py-4 py-md-5 px-3">
        <div className="card auth-card mx-auto" style={{ maxWidth: 440, width: '100%' }}>
          <div className="card-body p-4">
            <h1 className="h4 mb-1">Create donor account</h1>
            <p className="text-muted small mb-4">Sign up to donate and track your contributions.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="vstack gap-3">
              <div>
                <label className="form-label">Full name</label>
                <input className="form-control" name="fullName" required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" required />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
                <div className="form-text">At least 8 characters</div>
              </div>
              <div>
                <label className="form-label">Confirm password</label>
                <input
                  className="form-control"
                  type="password"
                  name="confirmPassword"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button className="btn-oc-primary w-100 border-0" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating…' : 'Register'}
              </button>
              <Link href="/login" className="small text-center">
                Already have an account? Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { createDonor } from '@/lib/api';

export default function NewDonorPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await createDonor({
        fullName: fd.get('fullName'),
        phone: fd.get('phone') || null,
        email: fd.get('email') || null,
        address: fd.get('address') || null,
      });
      router.push('/donations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/donations" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Add donor</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Full name *</label>
                <input className="form-control" name="fullName" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea className="form-control" name="address" rows={2} />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  Save donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

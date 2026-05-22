'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { createStaff } from '@/lib/api';

export default function NewStaffPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await createStaff({
        fullName: fd.get('fullName'),
        phone: fd.get('phone') || null,
        email: fd.get('email') || null,
        position: fd.get('position') || null,
        status: fd.get('status') || 'active',
      });
      router.push('/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/staff" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Add staff member</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Full name *</label>
                <input className="form-control" name="fullName" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Position</label>
                <input className="form-control" name="position" placeholder="e.g. Caregiver" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

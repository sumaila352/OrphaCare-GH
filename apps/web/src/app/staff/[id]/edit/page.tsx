'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { api, updateStaff, type Staff } from '@/lib/api';

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Staff>(`/api/staff/${id}`).then(setStaff).catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!staff) return;
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await updateStaff(staff.id, {
        fullName: fd.get('fullName'),
        phone: fd.get('phone') || null,
        email: fd.get('email') || null,
        position: fd.get('position') || null,
        status: fd.get('status'),
      });
      router.push('/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  if (!staff && !error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/staff" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Edit staff</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {staff && (
              <form onSubmit={onSubmit} className="row g-3 mt-2">
                <div className="col-12">
                  <label className="form-label">Full name *</label>
                  <input className="form-control" name="fullName" defaultValue={staff.fullName} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Position</label>
                  <input className="form-control" name="position" defaultValue={staff.position ?? ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" defaultValue={staff.status}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" defaultValue={staff.phone ?? ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" name="email" defaultValue={staff.email ?? ''} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">
                    Save changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

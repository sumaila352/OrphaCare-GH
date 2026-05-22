'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { createChild } from '@/lib/api';

export default function NewChildPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await createChild({
        fullName: fd.get('fullName'),
        dateOfBirth: fd.get('dateOfBirth') || null,
        gender: fd.get('gender') || null,
        admissionDate: fd.get('admissionDate') || null,
        status: fd.get('status') || 'active',
        notes: fd.get('notes') || null,
      });
      router.push('/children');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/children" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Add child</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Full name</label>
                <input className="form-control" name="fullName" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date of birth</label>
                <input className="form-control" type="date" name="dateOfBirth" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" defaultValue="">
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Admission date</label>
                <input className="form-control" type="date" name="admissionDate" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" defaultValue="active">
                  {['active', 'reunified', 'adopted', 'transferred', 'deceased'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea className="form-control" name="notes" rows={3} />
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

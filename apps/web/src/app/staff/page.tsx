'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getStaff, type Staff } from '@/lib/api';

export default function StaffPage() {
  const [rows, setRows] = useState<Staff[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setRows(await getStaff({ q, status }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load staff');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="page-toolbar">
            <div>
              <h1 className="h3 mb-1">Staff Management</h1>
              <div className="text-muted">Staff records and attendance.</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-primary" href="/staff/new">
                Add staff
              </Link>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card mb-3">
            <div className="card-body row g-2">
              <div className="col-12 col-md-5">
                <input className="form-control" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="col-12 col-md-4">
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <button className="btn btn-outline-primary w-100" type="button" onClick={load}>
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No staff yet. <Link href="/staff/new">Add staff member</Link>
                      </td>
                    </tr>
                  ) : (
                    rows.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-medium">{s.fullName}</td>
                        <td>{s.position ?? '—'}</td>
                        <td>{s.phone ?? '—'}</td>
                        <td>
                          <span className={`badge ${s.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link className="btn btn-sm btn-outline-secondary me-1" href={`/staff/${s.id}`}>
                            View
                          </Link>
                          <Link className="btn btn-sm btn-outline-primary" href={`/staff/${s.id}/edit`}>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AuthGuard>
  );
}

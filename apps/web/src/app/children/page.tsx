'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getChildren, type Child } from '@/lib/api';

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setChildren(await getChildren({ q, status }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load children');
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
              <h1 className="h3 mb-1">Children / Orphans</h1>
              <div className="text-muted">Manage admission records and care status.</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-primary" href="/children/new">
                Add child
              </Link>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card mb-3">
            <div className="card-body row g-2">
              <div className="col-12 col-md-5">
                <input
                  className="form-control"
                  placeholder="Search by name"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  {['active', 'reunified', 'adopted', 'transferred', 'deceased'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Admitted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {children.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.photoUrl ? (
                          <Image src={c.photoUrl} alt="" width={40} height={40} className="rounded" />
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="fw-medium">{c.fullName}</td>
                      <td>
                        <span className="badge text-bg-secondary text-capitalize">{c.status}</span>
                      </td>
                      <td>{c.admissionDate ? String(c.admissionDate).slice(0, 10) : '—'}</td>
                      <td className="text-end">
                        <Link className="btn btn-sm btn-outline-secondary" href={`/children/${c.id}/edit`}>
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AuthGuard>
  );
}

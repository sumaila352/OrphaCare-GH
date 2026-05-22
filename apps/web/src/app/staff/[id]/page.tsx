'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getStaffMember, recordAttendance } from '@/lib/api';

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Awaited<ReturnType<typeof getStaffMember>> | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  async function load() {
    try {
      setData(await getStaffMember(Number(id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onAttendance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      await recordAttendance(Number(id), String(fd.get('attendDate')), String(fd.get('status')));
      setMsg('Attendance recorded.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record attendance');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="page-toolbar">
            <div>
              <Link href="/staff" className="small">
                ← Staff list
              </Link>
              <h1 className="h3 mt-2">{data?.fullName ?? 'Staff'}</h1>
              <div className="text-muted">{data?.position ?? 'No position set'}</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-outline-primary" href={`/staff/${id}/edit`}>
                Edit
              </Link>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}
          <div className="row g-3">
            <div className="col-md-5">
              <div className="card">
                <div className="card-body">
                  <h2 className="h6">Record attendance</h2>
                  <form onSubmit={onAttendance} className="vstack gap-2">
                    <input className="form-control" type="date" name="attendDate" defaultValue={today} />
                    <select className="form-select" name="status" defaultValue="present">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                    </select>
                    <button className="btn btn-primary" type="submit">
                      Save attendance
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-7">
              <div className="card">
                <div className="card-body">
                  <h2 className="h6">Recent attendance</h2>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.attendance ?? []).map((a) => (
                          <tr key={a.id}>
                            <td>{String(a.attendDate).slice(0, 10)}</td>
                            <td className="text-capitalize">{a.status}</td>
                          </tr>
                        ))}
                        {(data?.attendance ?? []).length === 0 && (
                          <tr>
                            <td colSpan={2} className="text-muted">
                              No attendance records yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AuthGuard>
  );
}

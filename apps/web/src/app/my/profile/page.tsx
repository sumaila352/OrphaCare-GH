'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getMyDonor, updateMyDonor, type DonorProfile } from '@/lib/api';

export default function MyProfilePage() {
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyDonor().then(setDonor).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    try {
      const row = await updateMyDonor({
        phone: String(fd.get('phone') || '') || null,
        address: String(fd.get('address') || '') || null,
      });
      setDonor(row);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard mode="donor">
      {() => (
        <div className="card border-0 shadow-sm" style={{ maxWidth: 520 }}>
          <div className="card-body p-4">
            <h1 className="h4 mb-3">My profile</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {saved && <div className="alert alert-success">Profile updated.</div>}
            {donor && (
              <form onSubmit={onSubmit} className="vstack gap-3">
                <div>
                  <label className="form-label">Full name</label>
                  <input className="form-control" value={donor.fullName} disabled />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-control" value={donor.email ?? ''} disabled />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" defaultValue={donor.phone ?? ''} />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <textarea className="form-control" name="address" rows={2} defaultValue={donor.address ?? ''} />
                </div>
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getMyDonor, updateMyDonor, type AuthUser, type DonorProfile } from '@/lib/api';

function ProfileContent({ user }: { user: AuthUser }) {
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyDonor()
      .then(setDonor)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
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
    <div className="donor-page">
      <div className="donor-profile-hero">
        <div className="donor-profile-avatar">
          <i className="bi bi-person-fill" aria-hidden />
        </div>
        <div>
          <p className="donor-hero-eyebrow mb-1">Donor profile</p>
          <h1 className="h4 mb-1 fw-bold">{user.fullName}</h1>
          <p className="small mb-0" style={{ color: 'var(--donor-hero-muted)' }}>
            Keep your contact details up to date so we can thank you for your generosity.
          </p>
        </div>
      </div>

      <div className="donor-panel donor-profile-form">
        {error && <div className="alert alert-danger">{error}</div>}
        {saved && <div className="alert alert-success">Profile updated successfully.</div>}
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
              <input className="form-control" name="phone" defaultValue={donor.phone ?? ''} placeholder="+233..." />
            </div>
            <div>
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                name="address"
                rows={2}
                defaultValue={donor.address ?? ''}
                placeholder="City, region"
              />
            </div>
            <button className="donor-btn-give border-0 align-self-start" type="submit">
              <i className="bi bi-check-lg" aria-hidden /> Save changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <AuthGuard mode="donor">
      {(user) => <ProfileContent user={user} />}
    </AuthGuard>
  );
}

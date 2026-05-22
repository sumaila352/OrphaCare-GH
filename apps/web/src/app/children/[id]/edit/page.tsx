'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { api, updateChild, uploadChildPhoto, type Child } from '@/lib/api';

export default function EditChildPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [error, setError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    api<Child>(`/api/children/${id}`)
      .then(setChild)
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!child) return;
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await updateChild(child.id, {
        fullName: fd.get('fullName'),
        dateOfBirth: fd.get('dateOfBirth') || null,
        gender: fd.get('gender') || null,
        admissionDate: fd.get('admissionDate') || null,
        status: fd.get('status'),
        notes: fd.get('notes') || null,
      });
      router.push('/children');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  async function onPhotoChange(file: File | undefined) {
    if (!file || !child) return;
    setUploadMsg('');
    try {
      const { photoUrl } = await uploadChildPhoto(child.id, file);
      setChild({ ...child, photoUrl });
      setUploadMsg('Photo uploaded via Cloudinary.');
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  if (!child && !error) {
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
            <Link href="/children" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Edit child</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {child && (
              <>
                <div className="mb-3">
                  <label className="form-label">Profile photo (Cloudinary)</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPhotoChange(e.target.files?.[0])}
                  />
                  {uploadMsg && <div className="form-text">{uploadMsg}</div>}
                  {child.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={child.photoUrl} alt="" className="mt-2 rounded" width={80} height={80} />
                  )}
                </div>
                <form onSubmit={onSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Full name</label>
                    <input className="form-control" name="fullName" defaultValue={child.fullName} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of birth</label>
                    <input
                      className="form-control"
                      type="date"
                      name="dateOfBirth"
                      defaultValue={child.dateOfBirth?.slice(0, 10) ?? ''}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" defaultValue={child.gender ?? ''}>
                      <option value="">—</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Admission date</label>
                    <input
                      className="form-control"
                      type="date"
                      name="admissionDate"
                      defaultValue={child.admissionDate?.slice(0, 10) ?? ''}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" defaultValue={child.status}>
                      {['active', 'reunified', 'adopted', 'transferred', 'deceased'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" name="notes" rows={3} defaultValue={child.notes ?? ''} />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary" type="submit">
                      Save changes
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

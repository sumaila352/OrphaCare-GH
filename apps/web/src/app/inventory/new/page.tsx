'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { createInventoryItem } from '@/lib/api';

export default function NewInventoryPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await createInventoryItem({
        itemName: fd.get('itemName'),
        category: fd.get('category') || 'other',
        quantity: Number(fd.get('quantity') || 0),
        unit: fd.get('unit') || null,
        lowStockThreshold: fd.get('lowStockThreshold') ? Number(fd.get('lowStockThreshold')) : null,
      });
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/inventory" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Add inventory item</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Item name *</label>
                <input className="form-control" name="itemName" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" defaultValue="other">
                  {['food', 'clothing', 'medical', 'other'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Quantity</label>
                <input className="form-control" type="number" name="quantity" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Unit</label>
                <input className="form-control" name="unit" placeholder="bags, bottles" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Low stock threshold</label>
                <input className="form-control" type="number" name="lowStockThreshold" min="0" step="0.01" />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  Save item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

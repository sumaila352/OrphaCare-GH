'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { api, updateInventoryItem, type InventoryItem } from '@/lib/api';

export default function EditInventoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<InventoryItem>(`/api/inventory/${id}`).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item) return;
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await updateInventoryItem(item.id, {
        itemName: fd.get('itemName'),
        category: fd.get('category'),
        quantity: Number(fd.get('quantity')),
        unit: fd.get('unit') || null,
        lowStockThreshold: fd.get('lowStockThreshold') ? Number(fd.get('lowStockThreshold')) : null,
      });
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  if (!item && !error) {
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
            <Link href="/inventory" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Edit inventory item</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {item && (
              <form onSubmit={onSubmit} className="row g-3 mt-2">
                <div className="col-12">
                  <label className="form-label">Item name *</label>
                  <input className="form-control" name="itemName" defaultValue={item.itemName} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" name="category" defaultValue={item.category}>
                    {['food', 'clothing', 'medical', 'other'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Quantity</label>
                  <input
                    className="form-control"
                    type="number"
                    name="quantity"
                    min="0"
                    step="0.01"
                    defaultValue={item.quantity}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Unit</label>
                  <input className="form-control" name="unit" defaultValue={item.unit ?? ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Low stock threshold</label>
                  <input
                    className="form-control"
                    type="number"
                    name="lowStockThreshold"
                    min="0"
                    step="0.01"
                    defaultValue={item.lowStockThreshold ?? ''}
                  />
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

'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getInventory, stockMovement, type InventoryItem } from '@/lib/api';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [category, setCategory] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [error, setError] = useState('');
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      setError('');
      setItems(await getInventory({ category, low: lowOnly }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onMovement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!moveItem) return;
    setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      await stockMovement(moveItem.id, {
        movementType: fd.get('movementType'),
        quantity: Number(fd.get('quantity')),
        reason: fd.get('reason') || null,
      });
      setMsg('Stock updated.');
      setMoveItem(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Movement failed');
    }
  }

  function isLow(i: InventoryItem) {
    return i.lowStockThreshold != null && i.quantity <= i.lowStockThreshold;
  }

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="page-toolbar">
            <div>
              <h1 className="h3 mb-1">Inventory</h1>
              <div className="text-muted">Stock levels, categories, and movements.</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-primary" href="/inventory/new">
                Add item
              </Link>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}
          <div className="card mb-3">
            <div className="card-body row g-2 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label small text-muted">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All</option>
                  {['food', 'clothing', 'medical', 'other'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lowOnly"
                    checked={lowOnly}
                    onChange={(e) => setLowOnly(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="lowOnly">
                    Low stock only
                  </label>
                </div>
              </div>
              <div className="col-12 col-md-4">
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
                    <th>Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Threshold</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className={isLow(i) ? 'table-warning' : undefined}>
                      <td className="fw-medium">{i.itemName}</td>
                      <td className="text-capitalize">{i.category}</td>
                      <td>
                        {i.quantity} {i.unit ?? ''}
                        {isLow(i) && <span className="badge text-bg-danger ms-2">Low</span>}
                      </td>
                      <td>{i.lowStockThreshold ?? '—'}</td>
                      <td className="text-end">
                        <div className="d-flex flex-column flex-sm-row gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => setMoveItem(i)}
                          >
                            Stock in/out
                          </button>
                          <Link className="btn btn-sm btn-outline-secondary" href={`/inventory/${i.id}/edit`}>
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No items. <Link href="/inventory/new">Add inventory item</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {moveItem && (
            <div className="card mt-3 border-primary">
              <div className="card-body">
                <h2 className="h6">Stock movement — {moveItem.itemName}</h2>
                <p className="small text-muted mb-2">
                  Current: {moveItem.quantity} {moveItem.unit ?? ''}
                </p>
                <form onSubmit={onMovement} className="row g-2">
                  <div className="col-md-4">
                    <select className="form-select" name="movementType" defaultValue="in">
                      <option value="in">Stock in (+)</option>
                      <option value="out">Stock out (−)</option>
                      <option value="adjust">Set quantity (=)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input className="form-control" type="number" name="quantity" min="0.01" step="0.01" required />
                  </div>
                  <div className="col-md-3">
                    <input className="form-control" name="reason" placeholder="Reason" />
                  </div>
                  <div className="col-md-2 d-flex gap-1">
                    <button className="btn btn-primary flex-grow-1" type="submit">
                      Apply
                    </button>
                    <button className="btn btn-light" type="button" onClick={() => setMoveItem(null)}>
                      ×
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </AuthGuard>
  );
}

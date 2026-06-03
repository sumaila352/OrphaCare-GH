'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardView } from '@/components/DashboardView';
import { getDashboardStats, type DashboardStats } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      {() => <DashboardView stats={stats} loading={loading} />}
    </AuthGuard>
  );
}

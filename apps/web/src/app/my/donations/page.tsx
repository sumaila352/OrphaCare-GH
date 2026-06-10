'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DonorHubView } from '@/components/DonorHubView';
import {
  getMyDonationSummary,
  getMyDonations,
  getPublicStats,
  verifyPaystackPayment,
  type AuthUser,
  type Donation,
  type MyDonationSummary,
  type PublicStats,
} from '@/lib/api';

function MyDonationsContent({ user }: { user: AuthUser }) {
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<MyDonationSummary | null>(null);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function load() {
    try {
      setError('');
      const [d, s, stats] = await Promise.all([
        getMyDonations(),
        getMyDonationSummary(),
        getPublicStats().catch(() => null),
      ]);
      setDonations(d);
      setSummary(s);
      setPublicStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const ref = searchParams.get('ref');
    if (payment !== 'success') return;

    if (!ref) {
      setSuccessMsg('Thank you! Your payment was received.');
      return;
    }

    verifyPaystackPayment(ref)
      .then(() => {
        setSuccessMsg('Thank you! Your payment was received and your donation is confirmed.');
        return load();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Could not verify payment');
      });
  }, [searchParams]);

  return (
    <DonorHubView
      user={user}
      donations={donations}
      summary={summary}
      publicStats={publicStats}
      loading={loading}
      successMsg={successMsg}
      error={error}
    />
  );
}

export default function MyDonationsPage() {
  return (
    <AuthGuard mode="donor">
      {(user) => (
        <Suspense
          fallback={
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          }
        >
          <MyDonationsContent user={user} />
        </Suspense>
      )}
    </AuthGuard>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, type AuthUser } from '@/lib/api';
import { homePathForUser, isDonor, isStaff } from '@/lib/auth';
import { AppShell } from './AppShell';
import { DonorShell } from './DonorShell';

type GuardMode = 'staff' | 'donor';

export function AuthGuard({
  children,
  mode = 'staff',
}: {
  children: (user: AuthUser) => React.ReactNode;
  mode?: GuardMode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace(mode === 'donor' ? '/login?next=/my/donations' : '/login');
      return;
    }
    getMe()
      .then((u) => {
        if (mode === 'staff' && isDonor(u)) {
          router.replace(homePathForUser(u));
          return;
        }
        if (mode === 'donor' && isStaff(u)) {
          router.replace('/dashboard');
          return;
        }
        if (mode === 'donor' && !u.roles.includes('donor')) {
          router.replace('/login');
          return;
        }
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router, mode]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }
  if (!user) return null;

  if (mode === 'donor') {
    return <DonorShell user={user}>{children(user)}</DonorShell>;
  }
  return <AppShell user={user}>{children(user)}</AppShell>;
}

const API_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || '')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000');

export type AuthUser = { id: number; fullName: string; email: string; roles: string[] };
export type Child = {
  id: number; fullName: string; dateOfBirth: string | null; gender: string | null;
  admissionDate: string | null; status: string; notes: string | null; photoUrl: string | null;
};
export type Staff = { id: number; fullName: string; phone: string | null; email: string | null; position: string | null; status: string };
export type Donor = { id: number; fullName: string; phone: string | null; email: string | null; address: string | null; _count?: { donations: number } };
export type DonationStatus = 'pending' | 'confirmed' | 'cancelled';
export type Donation = {
  id: number; donorId: number | null; type: 'cash' | 'in_kind'; status: DonationStatus;
  amount: number | null; currency: string;
  reference: string | null; notes: string | null; createdAt: string;
  donor?: { id: number; fullName: string } | null;
  items?: { id: number; itemName: string; quantity: number; unit: string | null }[];
};
export type PublicStats = {
  childrenActive: number;
  donorsTotal: number;
  donationsConfirmedCount: number;
  donationsConfirmedTotalGhs: number;
  donationsPendingCount: number;
};
export type DonorProfile = Donor & { userId?: number | null };
export type MyDonationSummary = {
  total: number;
  confirmed: number;
  pending: number;
  confirmedAmountGhs: number;
};
export type InventoryItem = { id: number; itemName: string; category: string; quantity: number; unit: string | null; lowStockThreshold: number | null };
export type ReportSummary = {
  children: { total: number; byStatus: { status: string; count: number }[] };
  staff: { total: number; active: number; presentToday: number };
  donors: { total: number };
  donations: { thisMonth: { count: number; amount: number }; yearToDate: number; recent: Donation[] };
  inventory: { totalItems: number; lowStock: InventoryItem[]; byCategory: unknown[] };
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Run npm run dev from the project root and ensure the API is on port 4000.',
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const login = (email: string, password: string) =>
  api<{ token: string; user: AuthUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const loginWithGoogle = (credential: string) =>
  api<{ token: string; user: AuthUser }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
export const register = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
) =>
  api<{ token: string; user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, confirmPassword }),
  });
export const getMe = () => api<AuthUser>('/api/auth/me');
export const getPublicStats = () => api<PublicStats>('/api/public/stats');
export const getMyDonor = () => api<DonorProfile>('/api/me/donor');
export const updateMyDonor = (payload: { phone?: string | null; address?: string | null }) =>
  api<DonorProfile>('/api/me/donor', { method: 'PATCH', body: JSON.stringify(payload) });
export const getMyDonations = () => api<Donation[]>('/api/me/donations');
export const getMyDonationSummary = () => api<MyDonationSummary>('/api/me/donations/summary');
export const createMyDonation = (payload: Record<string, unknown>) =>
  api<Donation>('/api/me/donations', { method: 'POST', body: JSON.stringify(payload) });
export const updateDonationStatus = (id: number, status: DonationStatus) =>
  api<Donation>(`/api/donations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export type DashboardStats = {
  totalChildren: number;
  donationsThisMonth: number;
  donationsYtd: number;
  pendingDonations: number;
  activeStaff: number;
  donationsByMonth: { label: string; amount: number }[];
  childrenByStatus: { status: string; count: number }[];
  donationsBreakdown: { cashAmount: number; inKindCount: number };
  lowStock: { itemName: string; quantity: number; lowStockThreshold: number }[];
};

export const getDashboardStats = () => api<DashboardStats>('/api/dashboard/stats');
export const getChildren = (params?: { q?: string; status?: string }) => {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return api<Child[]>(`/api/children${q ? `?${q}` : ''}`);
};
export const createChild = (payload: Record<string, unknown>) => api<Child>('/api/children', { method: 'POST', body: JSON.stringify(payload) });
export const updateChild = (id: number, payload: Record<string, unknown>) => api<Child>(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const getStaff = (params?: { q?: string; status?: string }) => {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return api<Staff[]>(`/api/staff${q ? `?${q}` : ''}`);
};
export const getStaffMember = (id: number) => api<Staff & { attendance: { id: number; attendDate: string; status: string }[] }>(`/api/staff/${id}`);
export const createStaff = (payload: Record<string, unknown>) => api<Staff>('/api/staff', { method: 'POST', body: JSON.stringify(payload) });
export const updateStaff = (id: number, payload: Record<string, unknown>) => api<Staff>(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const recordAttendance = (staffId: number, attendDate: string, status: string) =>
  api(`/api/staff/${staffId}/attendance`, { method: 'POST', body: JSON.stringify({ attendDate, status }) });
export const getDonors = (q?: string) => api<Donor[]>(`/api/donors${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const createDonor = (payload: Record<string, unknown>) => api<Donor>('/api/donors', { method: 'POST', body: JSON.stringify(payload) });
export const getDonations = (type?: string) => api<Donation[]>(`/api/donations${type ? `?type=${type}` : ''}`);
export const createDonation = (payload: Record<string, unknown>) => api<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(payload) });
export const getInventory = (params?: { category?: string; low?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.low) qs.set('low', '1');
  const q = qs.toString();
  return api<InventoryItem[]>(`/api/inventory${q ? `?${q}` : ''}`);
};
export const createInventoryItem = (payload: Record<string, unknown>) => api<InventoryItem>('/api/inventory', { method: 'POST', body: JSON.stringify(payload) });
export const updateInventoryItem = (id: number, payload: Record<string, unknown>) => api<InventoryItem>(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const stockMovement = (itemId: number, payload: Record<string, unknown>) =>
  api(`/api/inventory/${itemId}/movements`, { method: 'POST', body: JSON.stringify(payload) });
export const getReportSummary = () => api<ReportSummary>('/api/reports/summary');
export async function uploadChildPhoto(childId: number, file: File) {
  const token = getToken();
  const form = new FormData();
  form.append('photo', file);
  const res = await fetch(`${API_URL}/api/uploads/children/${childId}/photo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Upload failed');
  return data as { photoUrl: string };
}

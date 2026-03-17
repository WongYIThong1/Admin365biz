const BASE_URL = ''; // Use proxy

async function safeJson(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  const text = await response.text();
  console.error('API Error: Non-JSON response received:', text);
  return { error: 'Invalid server response', details: text };
}

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthSuccess {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  admin: AdminIdentity;
}

export interface TeamSummary {
  bookId: string;
  teamName: string;
  memberCount: number;
  expiresAt: string | null;
  forceInactive: boolean;
  status: 'active' | 'inactive';
}

export interface AccountBookListResponse {
  limit: number;
  offset: number;
  total: number;
  items: Record<string, unknown>[];
}

export interface InviteRecord {
  inviteId: number;
  bookId: string;
  role: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  revokedAt?: string | null;
  lastUsedAt?: string | null;
  createdAt?: string;
}

export interface SyncShard {
  shardCode: string;
  databaseUrl: string;
  status: string;
  isDefault: boolean;
  lastError: string | null;
  provisionedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRequest {
  requestId: number;
  bookId: string;
  content: string;
  status: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  bookconnect: string | null;
  teamName: string | null;
  mfaEnabled: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  limit: number;
  offset: number;
  total: number;
  items: UserRecord[];
}

export async function login(email: string, password: string, totpCode?: string) {
  try {
    const response = await fetch(`/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, totpCode }),
      credentials: 'include',
    });

    const data = await safeJson(response);
    if (!response.ok) {
      return { ok: false, error: data.error, mfaToken: data.mfaToken, status: response.status };
    }
    return { ok: true, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (Login): ${error.message}` };
  }
}

export async function verifyMFA(mfaToken: string, totpCode: string) {
  try {
    const response = await fetch(`/auth/admin/mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken, totpCode }),
      credentials: 'include',
    });

    const data = await safeJson(response);
    if (!response.ok) {
      return { ok: false, error: data.error, status: response.status };
    }
    return { ok: true, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (MFA): ${error.message}` };
  }
}

export async function verifyToken(accessToken: string) {
  try {
    const response = await fetch(`/auth/admin/verify`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (VerifyToken): ${error.message}` };
  }
}

export async function getTeams() {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/team`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as TeamSummary[], status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (GetTeams): ${error.message}` };
  }
}

export async function getUsers(limit = 50, offset = 0) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/user?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as UserListResponse, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (GetUsers): ${error.message}` };
  }
}

export async function getUserDetail(id: number) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/user/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as UserRecord, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (GetUserDetail): ${error.message}` };
  }
}

export async function resetUserMfa(id: number) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/user/${id}/reset-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (ResetUserMfa): ${error.message}` };
  }
}

export async function resetUserPassword(id: number, password: string) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/user/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (ResetUserPassword): ${error.message}` };
  }
}

export async function getAccountBooks(limit = 50, offset = 0) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/accountbook/?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as AccountBookListResponse, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (GetAccountBooks): ${error.message}` };
  }
}

export async function extendSubscription(bookId: string, days: number) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/team/extend/${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ days }),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (Extend): ${error.message}` };
  }
}

export async function toggleTeamStatus(bookId: string, force_inactive: boolean) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/team/${bookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ force_inactive }),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (ToggleStatus): ${error.message}` };
  }
}

export async function createInvite(bookId: string, options: any = {}) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/team/${bookId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(options),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (CreateInvite): ${error.message}` };
  }
}

export async function getInvites(bookId: string, active?: boolean) {
  try {
    const token = localStorage.getItem('accessToken');
    const query = active !== undefined ? `?active=${active}` : '';
    // Use clear relative path to bypass any URL constructor weirdness
    const targetUrl = `/admin/team/${bookId}/invites${query}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });

    const data = await safeJson(response);
    return { ok: response.ok, data: data as InviteRecord[], status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (GetInvites): ${error.message}` };
  }
}

export async function revokeInvite(inviteId: number) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/invites/${inviteId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (RevokeInvite): ${error.message}` };
  }
}

export async function copyInvite(inviteId: number, options: any = {}) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/invites/${inviteId}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(options),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (CopyInvite): ${error.message}` };
  }
}

export async function logoutApi() {
  try {
    const response = await fetch(`/auth/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return await safeJson(response);
  } catch (error: any) {
    return { error: `Network Error (Logout): ${error.message}` };
  }
}

export async function refreshToken() {
  try {
    const response = await fetch(`/auth/admin/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as AuthSuccess, status: response.status };
  } catch (error: any) {
    return { ok: false, error: `Network Error (Refresh): ${error.message}` };
  }
}

export async function createBookDatabaseSync(input: {
  shard_code: string;
  database_url: string;
  is_default: boolean;
}) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/book/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as SyncShard, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (CreateBookDatabaseSync): ${error.message}` };
  }
}

export async function requestBookResync(
  bookId: string,
  input: { content: string; reason: string }
) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/admin/book/resyncs/${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await safeJson(response);
    return { ok: response.ok, data: data as SyncRequest, status: response.status, error: data?.error || data?.detail || null };
  } catch (error: any) {
    return { ok: false, error: `Network Error (RequestBookResync): ${error.message}` };
  }
}

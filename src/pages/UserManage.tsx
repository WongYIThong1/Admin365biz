import { useEffect, useState } from 'react';
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, RefreshCw, Shield, KeyRound, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/error-utils';
import { getUserDetail, getUsers, resetUserMfa, resetUserPassword, type UserListResponse, type UserRecord } from '../lib/api';
import { cn } from '../lib/utils';

export function UserManage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isResettingMfa, setIsResettingMfa] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const limit = 50;

  const fetchUsers = async (currentOffset: number) => {
    setIsLoading(true);
    try {
      const res = await getUsers(limit, currentOffset);
      if (res.ok) {
        setData(res.data);
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page * limit);
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const users = (data?.items || []).filter((user) => {
    const target = `${user.username} ${user.email} ${user.teamName || ''}`.toLowerCase();
    return query.trim() ? target.includes(query.toLowerCase()) : true;
  });

  const openUserActions = async (id: number) => {
    try {
      const res = await getUserDetail(id);
      if (res.ok) {
        setSelectedUser(res.data);
        setPassword('');
        setShowActionModal(true);
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const handleResetMfa = async () => {
    if (!selectedUser) return;
    setIsResettingMfa(true);
    try {
      const res = await resetUserMfa(selectedUser.id);
      if (res.ok) {
        toast.success(`MFA reset for user #${selectedUser.id}`);
        setSelectedUser((current) => (current ? { ...current, mfaEnabled: false } : current));
        fetchUsers(page * limit);
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } finally {
      setIsResettingMfa(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !password.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    setIsResettingPassword(true);
    try {
      const res = await resetUserPassword(selectedUser.id, password);
      if (res.ok) {
        toast.success(`Password reset for user #${selectedUser.id}`);
        setPassword('');
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-4 py-6">
      <section>
        <div className="flex flex-col gap-4 border-b border-slate-200 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username, email, or team"
                className="h-10 w-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchUsers(page * limit)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">User</th>
                <th scope="col" className="px-4 py-4 font-medium">Team</th>
                <th scope="col" className="px-4 py-4 font-medium">MFA</th>
                <th scope="col" className="px-4 py-4 font-medium">Status</th>
                <th scope="col" className="px-4 py-4 font-medium">Updated</th>
                <th scope="col" className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70">
                  <td className="py-4 pr-5 font-medium text-slate-950">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-700">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">{user.username}</p>
                        <p className="truncate text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <span className="font-medium text-slate-900">{user.teamName || '-'}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                      user.status === 'active' ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{format(new Date(user.updatedAt), 'MMM dd, yyyy')}</td>
                  <td className="py-4 pl-5 text-right">
                    <button
                      type="button"
                      onClick={() => openUserActions(user.id)}
                      className="text-slate-400 transition-colors hover:text-slate-950"
                    >
                      <MoreHorizontal className="h-5 w-5 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center italic text-slate-400">
                    No users matched your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 py-4">
          <div className="text-xs tracking-tight text-slate-400">
            <span className="font-medium text-slate-950">{users.length}</span> users
            <span className="mx-2">/</span>
            Total <span className="font-medium text-slate-950">{data?.total || 0}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
              Page <span className="text-slate-950">{page + 1}</span> of {totalPages || 1}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0 || isLoading}
                className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-950 transition-all hover:border-slate-300 disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages - 1 || isLoading}
                className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-950 transition-all hover:border-slate-300 disabled:opacity-20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">{selectedUser.username}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedUser(null);
                  setPassword('');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-950">Reset MFA</h3>
                    <p className="mt-1 text-sm text-slate-500">Clear the user MFA configuration.</p>
                  </div>
                  <Shield className="h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={handleResetMfa}
                  disabled={isResettingMfa}
                  className="mt-4 flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isResettingMfa ? 'Resetting...' : 'Reset MFA'}
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-950">Reset Password</h3>
                    <p className="mt-1 text-sm text-slate-500">Set a new password for this user.</p>
                  </div>
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                />
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="mt-4 flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

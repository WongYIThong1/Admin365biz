import { Search, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const titles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Overview', description: 'Track platform health, usage, and operational highlights.' },
  '/users': { title: 'Users', description: 'Review access, roles, and recent account activity.' },
  '/account-books': { title: 'Account Books', description: 'Inspect ledgers, records, and system-wide book data.' },
  '/teams': { title: 'Teams', description: 'Manage subscriptions, invites, and team status.' },
  '/versions': { title: 'Version Control', description: 'Manage sync and operational workflows.' },
  '/database-monitor': { title: 'Database Monitor', description: 'Watch performance, latency, and query health in one place.' },
};

export function Topbar() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const meta = titles[location.pathname] ?? {
    title: 'Admin Panel',
    description: 'Manage your operations from a single workspace.',
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[rgba(245,247,251,0.82)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950">{meta.title}</h2>
          <p className="mt-1 hidden text-sm text-slate-500 md:block">{meta.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden w-full max-w-sm md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
              placeholder="Search users, books, teams..."
            />
          </div>
          <div className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm lg:block">
            <p className="text-xs font-medium text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900">{admin?.name || 'Admin User'}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

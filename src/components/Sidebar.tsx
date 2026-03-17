import {
  LayoutDashboard,
  Users,
  BookOpen,
  UsersRound,
  Database,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

export type PageType =
  | 'dashboard'
  | 'users'
  | 'account-books'
  | 'teams'
  | 'database-monitor';

const navigation = [
  { name: 'Dashboard', id: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'User Manage', id: 'users', path: '/users', icon: Users },
  { name: 'Account Book Manage', id: 'account-books', path: '/account-books', icon: BookOpen },
  { name: 'Team Manage', id: 'teams', path: '/teams', icon: UsersRound },
  { name: 'Database Monitor', id: 'database-monitor', path: '/database-monitor', icon: Database },
 ] as const;

export function Sidebar() {
  const { admin, logout } = useAuth();
  const displayName = admin?.name || 'Admin User';
  const displayEmail = admin?.email || 'admin@system.com';

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-slate-200/80 bg-white/70 backdrop-blur xl:flex xl:flex-col">
      <div className="border-b border-slate-200/80 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Panel</p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Ops Console</h1>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Navigation</p>
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950'
                  )
                }
              >
                <item.icon
                  className="h-4 w-4 flex-shrink-0 transition-colors"
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-200/80 p-5">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              className="h-11 w-11 flex-shrink-0 rounded-lg bg-slate-100 object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e2e8f0&color=0f172a&bold=true`}
              alt="Admin"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-sm font-semibold leading-none text-slate-900">{displayName}</span>
              <span className="mt-1 truncate text-xs text-slate-500">{displayEmail}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

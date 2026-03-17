import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Users, BookOpen, GitBranch, AlertCircle, ArrowUpRight, ShieldCheck, Clock3 } from 'lucide-react';

const data = [
  { name: 'Jan', users: 4000, transactions: 2400 },
  { name: 'Feb', users: 3000, transactions: 1398 },
  { name: 'Mar', users: 2000, transactions: 9800 },
  { name: 'Apr', users: 2780, transactions: 3908 },
  { name: 'May', users: 1890, transactions: 4800 },
  { name: 'Jun', users: 2390, transactions: 3800 },
  { name: 'Jul', users: 3490, transactions: 4300 },
];

const stats = [
  { name: 'Total Users', value: '71,897', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Active Books', value: '1,245', icon: BookOpen, change: '+5.4%', changeType: 'positive' },
  { name: 'Current Version', value: 'v2.4.1', icon: GitBranch, change: 'Stable', changeType: 'neutral' },
  { name: 'System Alerts', value: '3', icon: AlertCircle, change: '-2', changeType: 'positive' },
];

export function Dashboard() {
  return (
    <div className="space-y-6 py-6">
      <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Operational Summary</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">A cleaner view of platform activity.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Core metrics, release status, and transaction movement are arranged for quick scanning without the visual noise.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
              <div className="rounded-lg bg-slate-50 p-4">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                <p className="mt-6 text-2xl font-semibold text-slate-950">99.98%</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Uptime</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <Clock3 className="h-4 w-4 text-slate-500" />
                <p className="mt-6 text-2xl font-semibold text-slate-950">50ms</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Avg latency</p>
              </div>
              <div className="rounded-lg bg-slate-950 p-4 text-white">
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
                <p className="mt-6 text-2xl font-semibold">24.8k</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Daily events</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Today</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Review queue</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">12 items</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Attention needed</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Three alerts remain open. Database CPU and invite abuse checks should be reviewed first.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                <stat.icon className="h-5 w-5 text-slate-700" aria-hidden="true" />
              </div>
              <div
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  stat.changeType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700'
                    : stat.changeType === 'negative'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stat.change}
              </div>
            </div>
            <div className="mt-8">
              <div className="text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</div>
              <div className="mt-2 text-sm text-slate-500">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">User Growth</h3>
              <p className="mt-1 text-sm text-slate-500">Monthly registered users across the current period.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                />
                <Area type="monotone" dataKey="users" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Transactions Volume</h3>
              <p className="mt-1 text-sm text-slate-500">A simple view of activity throughput over time.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                />
                <Bar dataKey="transactions" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

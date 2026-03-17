import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Database, Activity, HardDrive, Cpu, Clock, AlertTriangle } from 'lucide-react';

const performanceData = [
  { time: '10:00', latency: 45, connections: 1200 },
  { time: '10:05', latency: 52, connections: 1250 },
  { time: '10:10', latency: 38, connections: 1180 },
  { time: '10:15', latency: 65, connections: 1300 },
  { time: '10:20', latency: 48, connections: 1220 },
  { time: '10:25', latency: 42, connections: 1190 },
  { time: '10:30', latency: 50, connections: 1210 },
];

const slowQueries = [
  { id: 1, query: 'SELECT * FROM users WHERE last_login < ? AND status = ?', time: '1.2s', calls: 450, status: 'Warning' },
  { id: 2, query: 'UPDATE account_books SET balance = ? WHERE id = ?', time: '0.8s', calls: 1200, status: 'Normal' },
  { id: 3, query: 'SELECT COUNT(*) FROM transactions GROUP BY date', time: '2.5s', calls: 85, status: 'Critical' },
  { id: 4, query: 'DELETE FROM session_logs WHERE created_at < ?', time: '1.5s', calls: 12, status: 'Warning' },
];

export function DatabaseMonitor() {
  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-end border-b border-slate-200 pb-4">
        <div className="sm:flex-none">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            <Activity className="h-4 w-4" />
            Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Database className="h-5 w-5 text-zinc-400" />
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Healthy
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-light tracking-tight text-black">1,210</div>
            <div className="mt-1 text-sm text-zinc-500">Active Connections</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">-12ms</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-light tracking-tight text-black">50ms</div>
            <div className="mt-1 text-sm text-zinc-500">Avg Query Latency</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Cpu className="h-5 w-5 text-zinc-400" />
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Elevated
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-light tracking-tight text-black">68%</div>
            <div className="mt-1 text-sm text-zinc-500">CPU Usage</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <HardDrive className="h-5 w-5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">84% Used</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-light tracking-tight text-black">4.2 TB</div>
            <div className="mt-1 text-sm text-zinc-500">Storage Capacity</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-base font-semibold text-slate-950">Query Latency (ms)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#0f172a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-base font-semibold text-slate-950">Active Connections</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                />
                <Area type="monotone" dataKey="connections" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorConnections)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-base font-semibold text-slate-950">Slow Queries Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Query Pattern</th>
                <th scope="col" className="px-6 py-4 font-medium">Avg Time</th>
                <th scope="col" className="px-6 py-4 font-medium">Calls/min</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-sm">
              {slowQueries.map((query) => (
                <tr key={query.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="max-w-md truncate px-6 py-4 text-slate-900" title={query.query}>
                    {query.query}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-950">{query.time}</td>
                  <td className="px-6 py-4 text-slate-500">{query.calls}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-sans font-medium ring-1 ring-inset ${
                      query.status === 'Critical' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' :
                      query.status === 'Warning' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                      'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    }`}>
                      {query.status === 'Critical' && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {query.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

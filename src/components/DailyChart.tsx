import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line,
} from 'recharts';
import { format } from 'date-fns';
import type { Session } from '../types';
import { sessionPnl } from '../utils/sessionPnl';

interface Props {
  sessions: Session[];
}

export function DailyChart({ sessions: allSessions }: Props) {
  const sessions = allSessions.filter(s => s.endTime);
  if (sessions.length === 0) return null;

  // Daily totals
  const dailyMap: Record<string, number> = {};
  for (const s of sessions) {
    dailyMap[s.date] = (dailyMap[s.date] ?? 0) + sessionPnl(s);
  }
  const sortedDates = Object.keys(dailyMap).sort();
  const dailyData = sortedDates.map(d => ({
    date: format(new Date(d), 'M/d'),
    pnl: dailyMap[d],
  }));

  // Running cumulative
  let cum = 0;
  const cumData = dailyData.map(d => {
    cum += d.pnl;
    return { ...d, cum };
  });

  // All-time stats
  const allPnl = sessions.map(s => sessionPnl(s));
  const totalPnl = allPnl.reduce((a, b) => a + b, 0);
  const wins = allPnl.filter(p => p > 0).length;
  const totalHours = sessions.reduce((acc, s) => {
    if (!s.endTime) return acc;
    return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3_600_000;
  }, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="総収支" value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString()}`} color={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <MiniStat label="勝率" value={`${sessions.length > 0 ? Math.round((wins / sessions.length) * 100) : 0}%`} color="text-slate-200" />
        <MiniStat label="時給" value={totalHours > 0 ? `$${Math.round(totalPnl / totalHours)}/h` : '-'} color="text-slate-200" />
      </div>

      {/* Daily bar chart */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-400 mb-3">日別収支</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              formatter={(v) => [`$${v}`, '収支']}
            />
            <ReferenceLine y={0} stroke="#475569" />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {dailyData.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#f87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative line */}
      {cumData.length > 1 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-3">累計収益カーブ</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={cumData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                formatter={(v) => [`$${v}`, '累計']}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Line type="monotone" dataKey="cum" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl px-3 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-base font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

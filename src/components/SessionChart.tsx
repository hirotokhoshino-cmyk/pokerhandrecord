import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import type { Session } from '../types';

interface Props {
  session: Session;
}

export function SessionChart({ session }: Props) {
  if (session.hands.length === 0) return null;

  // Cumulative P&L over time
  let running = 0;
  const cumData = [
    { time: format(new Date(session.startTime), 'HH:mm'), pnl: 0 },
    ...session.hands.map(h => {
      running += h.amount;
      return { time: format(new Date(h.timestamp), 'HH:mm'), pnl: running };
    }),
  ];

  // Hourly buckets
  const hourlyMap: Record<number, number> = {};
  for (const h of session.hands) {
    const startMs = new Date(session.startTime).getTime();
    const handMs = new Date(h.timestamp).getTime();
    const hr = Math.floor((handMs - startMs) / 3_600_000);
    hourlyMap[hr] = (hourlyMap[hr] ?? 0) + h.amount;
  }
  const maxHr = Math.max(...Object.keys(hourlyMap).map(Number));
  const hourlyData = Array.from({ length: maxHr + 1 }, (_, i) => ({
    hour: `${i + 1}h`,
    pnl: hourlyMap[i] ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="累計収支">
        <LineChart data={cumData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
            formatter={(v) => [`$${v}`, '収支']}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 2, fill: '#10b981' }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartCard>

      {hourlyData.length > 0 && (
        <ChartCard title="時間帯別収支">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              formatter={(v) => [`$${v}`, 'P&L']}
            />
            <ReferenceLine y={0} stroke="#475569" />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#818cf8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#818cf8' }}
            />
          </LineChart>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <p className="text-sm text-slate-400 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

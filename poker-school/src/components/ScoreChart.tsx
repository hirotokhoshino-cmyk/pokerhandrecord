import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { StudentScore } from '../types';

interface Props {
  scores: StudentScore[];
  studentName: string;
}

export function ScoreChart({ scores, studentName }: Props) {
  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
  const data = sorted.map(s => ({
    date: s.date.slice(5), // MM-DD
    ポイント: s.points,
    アウト数: s.bustOuts,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        成績データがありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-400 font-medium">{studentName} の成績推移</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2230" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 2" />
          <Line
            type="monotone"
            dataKey="ポイント"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="アウト数"
            stroke="#f87171"
            strokeWidth={2}
            dot={{ fill: '#f87171', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" />ポイント</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" />アウト数</span>
      </div>
    </div>
  );
}

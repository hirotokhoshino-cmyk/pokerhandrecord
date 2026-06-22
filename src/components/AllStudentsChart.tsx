import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { Student, StudentRecord } from '../types';

interface Props {
  students: Student[];
  records: StudentRecord[];
  onAddRecord: (studentId: string, date: string, amount: number) => void;
  onDeleteRecord: (id: string) => void;
}

const COLORS = [
  '#34d399', '#60a5fa', '#f472b6', '#fb923c',
  '#a78bfa', '#facc15', '#2dd4bf', '#f87171',
];

export function AllStudentsChart({ students, records, onAddRecord, onDeleteRecord }: Props) {
  const [studentId, setStudentId] = useState('');
  const [date,      setDate]      = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount,    setAmount]    = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showList,  setShowList]  = useState(false);

  const handleAdd = () => {
    if (!studentId || !date || amount === '') return;
    onAddRecord(studentId, date, parseFloat(amount));
    setAmount('');
  };

  // Build chart data: sorted dates, cumulative per student
  const allDates = [...new Set(records.map(r => r.date))].sort();

  // cumulative by student up to each date
  const chartData = allDates.map(d => {
    const point: Record<string, string | number> = { date: format(new Date(d), 'M/d') };
    students.forEach(s => {
      const cum = records
        .filter(r => r.studentId === s.id && r.date <= d)
        .reduce((acc, r) => acc + r.amount, 0);
      point[s.name] = cum;
    });
    return point;
  });

  const hasData = records.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-300">全生徒 成績グラフ</h2>
        <button onClick={() => setShowInput(s => !s)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
          + 成績入力
        </button>
      </div>

      {/* Quick input form */}
      {showInput && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 flex flex-col gap-3">
          <p className="text-sm text-slate-400 font-semibold">成績を入力</p>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">生徒</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm">
              <option value="">-- 選択 --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">日付</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm font-mono" />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">収支 ($)　勝ちはプラス、負けはマイナス</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="例: 150 または -80"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            />
          </div>

          <button onClick={handleAdd}
            disabled={!studentId || !date || amount === ''}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
            追加
          </button>
        </div>
      )}

      {/* Chart */}
      {!hasData ? (
        <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center gap-3 text-slate-500">
          <span className="text-3xl">📊</span>
          <p className="text-sm">「+ 成績入力」からデータを追加してください</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                formatter={(v, name) => [`$${v}`, name]}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              {students.filter(s => records.some(r => r.studentId === s.id)).map((s, i) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Records list */}
      {hasData && (
        <div>
          <button onClick={() => setShowList(s => !s)}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            {showList ? '▲ 入力履歴を隠す' : '▼ 入力履歴を見る'}
          </button>

          {showList && (
            <div className="mt-2 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              {[...records]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(r => {
                  const student = students.find(s => s.id === r.studentId);
                  return (
                    <div key={r.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 last:border-0">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500 font-mono text-xs">{format(new Date(r.date), 'M/d')}</span>
                        <span className="text-slate-300">{student?.name ?? '?'}</span>
                        <span className={`font-mono font-semibold ${r.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.amount >= 0 ? '+' : ''}${r.amount}
                        </span>
                      </div>
                      <button onClick={() => onDeleteRecord(r.id)}
                        className="text-slate-600 hover:text-red-400 text-xs transition-colors">✕</button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

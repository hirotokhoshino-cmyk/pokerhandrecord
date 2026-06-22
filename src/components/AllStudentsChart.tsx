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

export const COLORS = [
  '#34d399', '#60a5fa', '#f472b6', '#fb923c',
  '#a78bfa', '#facc15', '#2dd4bf', '#f87171',
];

// Build chart data where X = sequential entry index across all records (sorted by date)
export function buildChartData(students: Student[], records: StudentRecord[]) {
  const sorted = [...records].sort((a, b) =>
    a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
  );
  const cum: Record<string, number> = {};
  students.forEach(s => { cum[s.id] = 0; });

  return sorted.map((r, i) => {
    cum[r.studentId] = (cum[r.studentId] ?? 0) + r.amount;
    const point: Record<string, number | string> = { idx: i + 1 };
    students.forEach(s => { point[s.name] = cum[s.id]; });
    return point;
  });
}

export function AllStudentsChart({ students, records, onAddRecord, onDeleteRecord }: Props) {
  const [studentId, setStudentId] = useState('');
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [amount,    setAmount]    = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showList,  setShowList]  = useState(false);
  const [copied,    setCopied]    = useState<string | null>(null);
  const [title,     setTitle]     = useState('総合収支');
  const [editTitle, setEditTitle] = useState(false);

  const handleAdd = () => {
    if (!studentId || !date || amount === '') return;
    onAddRecord(studentId, date, parseFloat(amount));
    setAmount('');
  };

  const chartData = buildChartData(students, records);
  const activeStudents = students.filter(s => records.some(r => r.studentId === s.id));
  const hasData = records.length > 0;

  const generateStudentLink = (student: Student) => {
    const studentRecords = records
      .filter(r => r.studentId === student.id)
      .sort((a, b) => a.date.localeCompare(b.date));
    const payload = {
      name: student.name,
      records: studentRecords.map(r => ({ date: r.date, amount: r.amount })),
      title,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const base = window.location.origin + window.location.pathname;
    return `${base}?student=${encoded}`;
  };

  const copyLink = (student: Student) => {
    const link = generateStudentLink(student);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(student.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {editTitle ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setEditTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditTitle(false)}
            autoFocus
            className="flex-1 mr-3 px-2 py-1 bg-slate-700 border border-emerald-500 rounded text-white text-sm focus:outline-none"
          />
        ) : (
          <button onClick={() => setEditTitle(true)}
            className="text-base font-semibold text-slate-300 hover:text-white transition-colors text-left">
            {title} ✏️
          </button>
        )}
        <button onClick={() => setShowInput(s => !s)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
          + 成績入力
        </button>
      </div>

      {/* Quick input form */}
      {showInput && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 flex flex-col gap-3">
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
            <label className="text-xs text-slate-500 mb-1 block">収支 — 勝ちはプラス・負けはマイナス</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="例: 1500 または -800"
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
          <p className="text-center text-sm font-semibold text-slate-300 mb-3">{title}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="idx" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '回数', position: 'insideBottomRight', offset: -4, fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                formatter={(v, name) => [`${Number(v) >= 0 ? '+' : ''}${v}`, name]}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {activeStudents.map((s, i) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student share links */}
      {hasData && activeStudents.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <p className="px-4 py-2.5 text-xs text-slate-500 border-b border-slate-700">生徒・保護者用リンク（自分の成績のみ表示）</p>
          {activeStudents.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-slate-200">{s.name}</span>
              </div>
              <button
                onClick={() => copyLink(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  copied === s.id
                    ? 'bg-emerald-700 text-emerald-200'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {copied === s.id ? 'コピーしました ✓' : 'リンクをコピー'}
              </button>
            </div>
          ))}
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
                          {r.amount >= 0 ? '+' : ''}{r.amount}
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

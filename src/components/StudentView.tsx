import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface StudentData {
  name: string;
  title: string;
  records: { date: string; amount: number }[];
}

export function parseStudentParam(): StudentData | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('student');
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(atob(raw)));
  } catch {
    return null;
  }
}

export function StudentView({ data }: { data: StudentData }) {
  const sorted = [...data.records].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  const chartData = sorted.map((r, i) => {
    cum += r.amount;
    return { idx: i + 1, cum, amount: r.amount, date: r.date };
  });

  const totalPnl = sorted.reduce((acc, r) => acc + r.amount, 0);
  const wins = sorted.filter(r => r.amount > 0).length;
  const winRate = sorted.length > 0 ? Math.round((wins / sorted.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <header className="bg-[#0f1117]/90 border-b border-slate-800 px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">♠</span>
          <h1 className="text-base font-bold text-white">Poker Hand Record</h1>
        </div>
        <p className="text-xs text-slate-500">閲覧専用</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Title & name */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-1">{data.title}</p>
          <h2 className="text-2xl font-bold text-white">{data.name}</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="総収支" value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}`} color={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatBox label="勝率" value={`${winRate}%`} color="text-slate-200" />
          <StatBox label="セッション数" value={`${sorted.length}回`} color="text-slate-200" />
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-10 text-center text-slate-500">
            データがまだありません
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-3 text-center">累計収支</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="idx" tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{ value: '回数', position: 'insideBottomRight', offset: -4, fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                  formatter={(v) => [`${Number(v) >= 0 ? '+' : ''}${v}`, '累計']}
                  labelFormatter={(label) => `${label}回目`}
                />
                <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                <Line type="monotone" dataKey="cum" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Session list */}
        {sorted.length > 0 && (
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <p className="px-4 py-2.5 text-xs text-slate-500 border-b border-slate-700">成績履歴</p>
            {[...sorted].reverse().map((r, i) => {
              const idx = sorted.length - i;
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono w-12">{idx}回目</span>
                    <span className="text-xs text-slate-500">{r.date}</span>
                  </div>
                  <span className={`font-mono font-semibold text-sm ${r.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.amount >= 0 ? '+' : ''}{r.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl px-3 py-3 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-base font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

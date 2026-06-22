import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { Student, Session } from '../types';
import { sessionPnl } from '../utils/sessionPnl';

interface Props {
  students: Student[];
  sessions: Session[];
  onAddStudent: (name: string) => void;
  onDeleteStudent: (id: string) => void;
}

function bbSize(stake: string): number {
  const parts = stake.split('/');
  const bb = parseFloat(parts[parts.length - 1]);
  return isNaN(bb) || bb <= 0 ? 1 : bb;
}

function studentStats(student: Student, sessions: Session[]) {
  const studentSessions = sessions.filter(s => s.studentId === student.id && s.endTime);
  if (studentSessions.length === 0) return null;

  const totalPnl = studentSessions.reduce((acc, s) => acc + sessionPnl(s), 0);
  const totalHours = studentSessions.reduce((acc, s) => {
    return acc + (new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 3_600_000;
  }, 0);
  const totalHands = studentSessions.reduce((acc, s) => acc + s.hands.length, 0);

  // BB/100 win rate
  const totalBBWon = studentSessions.reduce((acc, s) => {
    const bb = bbSize(s.stake);
    return acc + sessionPnl(s) / bb;
  }, 0);
  const bb100 = totalHands > 0 ? (totalBBWon / totalHands) * 100 : 0;

  const winSessions = studentSessions.filter(s => sessionPnl(s) > 0).length;

  // Cumulative curve
  const sorted = [...studentSessions].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  const cumData = sorted.map(s => {
    cum += sessionPnl(s);
    return { date: format(new Date(s.date), 'M/d'), cum };
  });

  return { totalPnl, totalHours, totalHands, bb100, winSessions, sessionCount: studentSessions.length, cumData };
}

function StudentCard({ student, sessions, onDelete }: { student: Student; sessions: Session[]; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const stats = studentStats(student, sessions);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
            {student.name[0]}
          </div>
          <span className="font-semibold text-white">{student.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <span className={`text-sm font-mono font-semibold ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString()}
            </span>
          )}
          {!stats && <span className="text-xs text-slate-500">データなし</span>}
          <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700 px-4 py-4 flex flex-col gap-4">
          {!stats ? (
            <p className="text-slate-500 text-sm text-center py-4">完了済みセッションがありません</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="総収支" value={`${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toLocaleString()}`} color={stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <StatBox label="$/時間" value={stats.totalHours > 0 ? `${stats.totalPnl / stats.totalHours >= 0 ? '+' : ''}$${Math.round(stats.totalPnl / stats.totalHours)}/h` : '-'} color="text-slate-200" />
                <StatBox label="BB/100" value={`${stats.bb100 >= 0 ? '+' : ''}${stats.bb100.toFixed(1)}`} color={stats.bb100 >= 0 ? 'text-indigo-400' : 'text-red-400'} />
                <StatBox label="勝率" value={`${stats.sessionCount > 0 ? Math.round((stats.winSessions / stats.sessionCount) * 100) : 0}%`} color="text-slate-200" />
                <StatBox label="セッション数" value={`${stats.sessionCount}回`} color="text-slate-200" />
                <StatBox label="総ハンド数" value={`${stats.totalHands}手`} color="text-slate-200" />
              </div>

              {stats.cumData.length > 1 && (
                <div className="bg-slate-900 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-2">累計収益カーブ</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={stats.cumData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                        formatter={(v) => [`$${v}`, '累計']}
                      />
                      <ReferenceLine y={0} stroke="#475569" />
                      <Line type="monotone" dataKey="cum" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          <button onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-300 text-right mt-1">
            生徒を削除
          </button>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-900 rounded-lg px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

export function StudentsTab({ students, sessions, onAddStudent, onDeleteStudent }: Props) {
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddStudent(name);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-300">生徒一覧</h2>
        <button onClick={() => setShowAdd(s => !s)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
          + 生徒追加
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-800 rounded-xl p-4 flex gap-2 border border-slate-600">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="生徒の名前"
            autoFocus
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <button onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
            追加
          </button>
        </div>
      )}

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <span className="text-4xl">👤</span>
          <p className="text-sm">生徒を追加してください</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map(s => (
            <StudentCard key={s.id} student={s} sessions={sessions} onDelete={() => onDeleteStudent(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

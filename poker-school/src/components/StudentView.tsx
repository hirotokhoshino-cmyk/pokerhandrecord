import { useMemo } from 'react';
import { ScoreChart } from './ScoreChart';
import type { SchoolUser, StudentScore } from '../types';

interface Props {
  user: SchoolUser;
  scores: StudentScore[];
}

export function StudentView({ user, scores }: Props) {
  const myScores = useMemo(() => scores.filter(s => s.studentId === user.id), [scores, user.id]);
  const sorted = [...myScores].sort((a, b) => b.date.localeCompare(a.date));

  const totalPoints = myScores.reduce((s, x) => s + x.points, 0);
  const totalBustOuts = myScores.reduce((s, x) => s + x.bustOuts, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1d27] rounded-xl p-3 border border-slate-800 text-center">
          <p className="text-xs text-slate-500">セッション数</p>
          <p className="text-2xl font-bold text-white mt-1">{myScores.length}</p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl p-3 border border-slate-800 text-center">
          <p className="text-xs text-slate-500">合計ポイント</p>
          <p className={`text-2xl font-bold mt-1 ${totalPoints >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPoints > 0 ? '+' : ''}{totalPoints}
          </p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl p-3 border border-slate-800 text-center">
          <p className="text-xs text-slate-500">総アウト数</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{totalBustOuts}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1a1d27] rounded-xl p-4 border border-slate-800">
        <ScoreChart scores={myScores} studentName={user.name} />
      </div>

      {/* Score history */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-300">成績履歴</h2>
        {sorted.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">成績が記録されていません</p>
        ) : (
          sorted.map(s => (
            <div key={s.id} className="bg-[#1a1d27] rounded-xl p-3 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{s.date}</p>
                {s.notes && <p className="text-xs text-slate-500 mt-0.5">{s.notes}</p>}
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-xs text-slate-500">アウト数</p>
                  <p className="text-sm font-semibold text-red-400">{s.bustOuts}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ポイント</p>
                  <p className={`text-sm font-semibold ${s.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.points > 0 ? '+' : ''}{s.points}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

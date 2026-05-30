import { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import type { Session } from '../types';
import { SessionChart } from './SessionChart';
import { HandHistoryView } from './HandHistoryView';

interface Props {
  sessions: Session[];
  onDelete: (id: string) => void;
}

function fmt(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${n.toLocaleString()}`;
}

export function SessionHistory({ sessions, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const completed = sessions.filter(s => s.endTime).sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  if (completed.length === 0) {
    return <p className="text-slate-500 text-center py-8">まだ完了したセッションはありません</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {completed.map(s => {
        const pnl = s.hands.reduce((acc, h) => acc + h.amount, 0);
        const mins = differenceInMinutes(new Date(s.endTime!), new Date(s.startTime));
        const hours = Math.floor(mins / 60);
        const m = mins % 60;
        const duration = hours > 0 ? `${hours}h ${m}m` : `${m}m`;
        const hourly = mins > 0 ? Math.round((pnl / mins) * 60) : 0;
        const isExpanded = expanded === s.id;

        return (
          <div key={s.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <button
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-750 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : s.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs text-slate-500 shrink-0">
                  {format(new Date(s.startTime), 'M/d')}
                </span>
                <span className="font-mono text-emerald-400 text-sm font-semibold shrink-0">{s.stake}</span>
                {s.location && <span className="text-xs text-slate-400 truncate">{s.location}</span>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-mono">{duration}</span>
                <span className={`font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(pnl)}
                </span>
                <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-slate-700">
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <MiniStat label="バイイン" value={`$${s.buyIn.toLocaleString()}`} />
                  <MiniStat label="時給" value={`${fmt(hourly)}/h`} color={hourly >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                  <MiniStat label="ハンド数" value={`${s.hands.length}手`} />
                </div>

                <SessionChart session={s} />

                {s.hands.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                    <p className="text-xs text-slate-500 mb-1">ハンド一覧</p>
                    {[...s.hands].reverse().map(h => (
                      <div key={h.id} className="border-b border-slate-700 last:border-0 pb-2">
                        <div className="flex gap-3 text-xs py-1">
                          <span className="text-slate-500 font-mono shrink-0">{format(new Date(h.timestamp), 'HH:mm')}</span>
                          <span className={`font-mono font-semibold ${h.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(h.amount)}</span>
                          {h.history?.heroPosition && (
                            <span className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-emerald-400">{h.history.heroPosition}</span>
                          )}
                          {h.note && <span className="text-slate-400 truncate">{h.note}</span>}
                        </div>
                        {h.history && <HandHistoryView history={h.history} />}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { onDelete(s.id); setExpanded(null); }}
                  className="text-xs text-slate-600 hover:text-red-400 self-end transition-colors"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value, color = 'text-slate-200' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-700/50 rounded-lg px-2.5 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

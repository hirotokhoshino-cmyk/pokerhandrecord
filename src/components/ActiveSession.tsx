import { useState, useEffect } from 'react';
import { format, differenceInMinutes, parse } from 'date-fns';
import type { Session, HandHistory } from '../types';
import { HandInput } from './HandInput';
import { HandHistoryView } from './HandHistoryView';

interface Props {
  session: Session;
  onAddHand: (amount: number, note?: string, history?: HandHistory) => void;
  onDeleteHand: (handId: string) => void;
  onEnd: () => void;
  onUpdateStartTime: (iso: string) => void;
}

function fmt(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${n.toLocaleString()}`;
}

function fmtColor(n: number) {
  return n >= 0 ? 'text-emerald-400' : 'text-red-400';
}

export function ActiveSession({ session, onAddHand, onDeleteHand, onEnd, onUpdateStartTime }: Props) {
  const [now, setNow] = useState(new Date());
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(format(new Date(session.startTime), 'HH:mm'));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = differenceInMinutes(now, new Date(session.startTime));
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;
  const elapsedLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const total = session.hands.reduce((s, h) => s + h.amount, 0);
  const stack = session.buyIn + total;
  const hourlyRate = elapsed > 0 ? (total / elapsed) * 60 : 0;

  const saveStartTime = () => {
    try {
      const base = format(new Date(session.startTime), 'yyyy-MM-dd');
      const parsed = parse(`${base} ${timeInput}`, 'yyyy-MM-dd HH:mm', new Date());
      if (!isNaN(parsed.getTime())) {
        onUpdateStartTime(parsed.toISOString());
      }
    } catch {}
    setEditingTime(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="収支" value={fmt(total)} color={fmtColor(total)} />
        <StatCard label="スタック" value={`$${stack.toLocaleString()}`} color="text-white" />
        <StatCard label="経過時間" value={elapsedLabel} color="text-slate-300" />
        <StatCard label="時給" value={fmt(Math.round(hourlyRate)) + '/h'} color={fmtColor(hourlyRate)} />
      </div>

      {/* Session info */}
      <div className="bg-slate-800 rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center text-sm text-slate-400">
        <span className="font-mono text-emerald-400 font-semibold">{session.stake}</span>
        {session.location && <span>{session.location}</span>}
        <span>バイイン: ${session.buyIn.toLocaleString()}</span>

        {/* Editable start time */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-500">開始:</span>
          {editingTime ? (
            <>
              <input
                type="time"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                className="bg-slate-700 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none"
                autoFocus
              />
              <button onClick={saveStartTime} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">保存</button>
              <button onClick={() => setEditingTime(false)} className="text-xs text-slate-500 hover:text-slate-300">✕</button>
            </>
          ) : (
            <button
              onClick={() => { setTimeInput(format(new Date(session.startTime), 'HH:mm')); setEditingTime(true); }}
              className="font-mono text-slate-300 hover:text-emerald-400 underline decoration-dotted transition-colors text-xs"
            >
              {format(new Date(session.startTime), 'HH:mm')}
            </button>
          )}
        </div>
      </div>

      {/* Hand input */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-400 mb-3">ハンド結果を入力</p>
        <HandInput onAdd={onAddHand} />
      </div>

      {/* Hand list */}
      {session.hands.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-3">ハンド履歴 ({session.hands.length}件)</p>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {[...session.hands].reverse().map(hand => (
              <div key={hand.id} className="border-b border-slate-700 last:border-0 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    <span className="text-xs text-slate-500 font-mono shrink-0">
                      {format(new Date(hand.timestamp), 'HH:mm')}
                    </span>
                    <span className={`font-mono font-semibold text-sm ${fmtColor(hand.amount)}`}>
                      {fmt(hand.amount)}
                    </span>
                    {hand.history?.heroPosition && (
                      <span className="text-xs font-mono bg-slate-700 px-1.5 py-0.5 rounded text-emerald-400">
                        {hand.history.heroPosition}
                      </span>
                    )}
                    {hand.note && (
                      <span className="text-xs text-slate-400 truncate">{hand.note}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteHand(hand.id)}
                    className="text-slate-600 hover:text-red-400 text-xs ml-2 shrink-0 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {hand.history && <HandHistoryView history={hand.history} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End session */}
      <button
        onClick={onEnd}
        className="w-full py-3 bg-slate-700 hover:bg-red-900 border border-slate-600 hover:border-red-700 text-slate-300 hover:text-red-300 font-semibold rounded-xl transition-colors"
      >
        セッション終了
      </button>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

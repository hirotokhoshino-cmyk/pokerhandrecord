import { useState, useEffect } from 'react';
import { format, differenceInMinutes, parse } from 'date-fns';
import type { Session, HandHistory } from '../types';
import { HandInput } from './HandInput';
import { HandHistoryView } from './HandHistoryView';

interface Props {
  session: Session;
  onAddHand: (amount: number, note?: string, history?: HandHistory) => void;
  onDeleteHand: (handId: string) => void;
  onEnd: (finalStack?: number) => void;
  onUpdateStartTime: (iso: string) => void;
}

function fmt(n: number) { return `${n >= 0 ? '+' : ''}$${n.toLocaleString()}`; }
function fmtColor(n: number) { return n >= 0 ? 'text-emerald-400' : 'text-red-400'; }

// parse stake string to extract BB size (e.g. "2/5" → 5, "1/2" → 2)
function bbFromStake(stake: string): number {
  const parts = stake.split('/');
  const last = parseFloat(parts[parts.length - 1]);
  return isNaN(last) ? 5 : last;
}

export function ActiveSession({ session, onAddHand, onDeleteHand, onEnd, onUpdateStartTime }: Props) {
  const [now,           setNow]           = useState(new Date());
  const [editingTime,   setEditingTime]   = useState(false);
  const [timeInput,     setTimeInput]     = useState(format(new Date(session.startTime), 'HH:mm'));
  const [showEndModal,  setShowEndModal]  = useState(false);
  const [finalStackStr, setFinalStackStr] = useState(String(session.currentStack));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.max(0, differenceInMinutes(now, new Date(session.startTime)));
  const hours   = Math.floor(elapsed / 60);
  const mins    = elapsed % 60;
  const elapsedLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const total      = session.hands.reduce((s, h) => s + h.amount, 0);
  const hourlyRate = elapsed > 0 ? (total / elapsed) * 60 : 0;
  const defaultBB  = bbFromStake(session.stake);

  const saveStartTime = () => {
    try {
      const base   = format(new Date(session.startTime), 'yyyy-MM-dd');
      const parsed = parse(`${base} ${timeInput}`, 'yyyy-MM-dd HH:mm', new Date());
      if (!isNaN(parsed.getTime())) onUpdateStartTime(parsed.toISOString());
    } catch {}
    setEditingTime(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="収支"   value={fmt(total)}                   color={fmtColor(total)} />
        <StatCard label="スタック" value={`$${session.currentStack.toLocaleString()}`} color="text-white" />
        <StatCard label="経過時間" value={elapsedLabel}               color="text-slate-300" />
        <StatCard label="時給"   value={`${fmt(Math.round(hourlyRate))}/h`} color={fmtColor(hourlyRate)} />
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
              <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)}
                className="bg-slate-700 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none"
                autoFocus />
              <button onClick={saveStartTime} className="text-xs text-emerald-400 font-semibold">保存</button>
              <button onClick={() => setEditingTime(false)} className="text-xs text-slate-500">✕</button>
            </>
          ) : (
            <button onClick={() => { setTimeInput(format(new Date(session.startTime), 'HH:mm')); setEditingTime(true); }}
              className="font-mono text-slate-300 hover:text-emerald-400 underline decoration-dotted text-xs transition-colors">
              {format(new Date(session.startTime), 'HH:mm')}
            </button>
          )}
        </div>
      </div>

      {/* Hand input */}
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-400 mb-3">ハンド結果を入力</p>
        <HandInput
          onAdd={onAddHand}
          currentStack={session.currentStack}
          defaultBbSize={defaultBB}
        />
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
                    {hand.history?.heroCards && (
                      <span className="text-xs font-mono text-slate-300">{hand.history.heroCards}</span>
                    )}
                    {hand.note && <span className="text-xs text-slate-400 truncate">{hand.note}</span>}
                  </div>
                  <button onClick={() => onDeleteHand(hand.id)}
                    className="text-slate-600 hover:text-red-400 text-xs ml-2 shrink-0 transition-colors">✕</button>
                </div>
                {hand.history && <HandHistoryView history={hand.history} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End */}
      <button onClick={() => { setFinalStackStr(String(session.currentStack)); setShowEndModal(true); }}
        className="w-full py-3 bg-slate-700 hover:bg-red-900 border border-slate-600 hover:border-red-700 text-slate-300 hover:text-red-300 font-semibold rounded-xl transition-colors">
        セッション終了
      </button>

      {/* End session modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-600 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1">セッション終了</h2>
            <p className="text-sm text-slate-400 mb-5">残りスタックを入力すると成績が自動計算されます</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">残りスタック ($)</label>
                <input
                  type="number"
                  value={finalStackStr}
                  onChange={e => setFinalStackStr(e.target.value)}
                  min={0}
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono text-lg"
                />
                {(() => {
                  const fs = parseFloat(finalStackStr);
                  if (!isNaN(fs)) {
                    const pnl = fs - session.buyIn;
                    return (
                      <p className={`text-sm font-mono mt-1.5 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        収支: {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold transition-colors">
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    const fs = parseFloat(finalStackStr);
                    onEnd(isNaN(fs) ? undefined : fs);
                    setShowEndModal(false);
                  }}
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
                  終了する
                </button>
              </div>

              <button onClick={() => { onEnd(undefined); setShowEndModal(false); }}
                className="text-xs text-slate-500 hover:text-slate-400 text-center transition-colors">
                スタック入力なしで終了
              </button>
            </div>
          </div>
        </div>
      )}
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

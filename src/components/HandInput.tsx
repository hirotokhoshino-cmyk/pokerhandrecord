import { useState } from 'react';
import type { HandHistory } from '../types';
import { HandHistoryForm } from './HandHistoryForm';

interface Props {
  onAdd: (amount: number, note?: string, history?: HandHistory) => void;
}

export function HandInput({ onAdd }: Props) {
  const [raw, setRaw] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'amount' | 'history'>('amount');
  const [pendingAmount, setPendingAmount] = useState(0);

  const submitAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(raw);
    if (isNaN(val) || raw.trim() === '') {
      setError('数値を入力してください');
      return;
    }
    setPendingAmount(val);
    setError('');
    setStep('history');
  };

  const saveWithHistory = (history: HandHistory) => {
    onAdd(pendingAmount, note.trim() || undefined, history);
    reset();
  };

  const saveWithoutHistory = () => {
    onAdd(pendingAmount, note.trim() || undefined);
    reset();
  };

  const reset = () => {
    setRaw('');
    setNote('');
    setPendingAmount(0);
    setStep('amount');
  };

  if (step === 'history') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold font-mono ${pendingAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pendingAmount >= 0 ? '+' : ''}${pendingAmount.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            ← 戻る
          </button>
        </div>
        <HandHistoryForm onSave={saveWithHistory} onCancel={saveWithoutHistory} />
      </div>
    );
  }

  return (
    <form onSubmit={submitAmount} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
          <input
            type="number"
            step="any"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder="0  (負=損失)"
            className="w-full pl-7 pr-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
        >
          次へ
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="一言メモ（任意）"
        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  );
}

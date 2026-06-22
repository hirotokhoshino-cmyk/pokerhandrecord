import { useState } from 'react';
import type { StudentScore } from '../types';

interface Props {
  studentId: string;
  editTarget?: StudentScore;
  onSave: (date: string, bustOuts: number, points: number, notes?: string) => void;
  onCancel: () => void;
}

export function ScoreForm({ editTarget, onSave, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(editTarget?.date ?? today);
  const [bustOuts, setBustOuts] = useState(String(editTarget?.bustOuts ?? 0));
  const [points, setPoints] = useState(String(editTarget?.points ?? 0));
  const [notes, setNotes] = useState(editTarget?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(date, Number(bustOuts), Number(points), notes || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-[#1a1d27] rounded-xl p-4 border border-slate-700">
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-28">
          <label className="text-xs text-slate-400">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1 w-20">
          <label className="text-xs text-slate-400">アウト数</label>
          <input
            type="number"
            min={0}
            value={bustOuts}
            onChange={e => setBustOuts(e.target.value)}
            className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs text-slate-400">ポイント</label>
          <input
            type="number"
            value={points}
            onChange={e => setPoints(e.target.value)}
            className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">メモ（任意）</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="コメントを入力"
          className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          キャンセル
        </button>
        <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
          保存
        </button>
      </div>
    </form>
  );
}

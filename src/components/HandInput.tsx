import { useState } from 'react';

interface Props {
  onAdd: (amount: number, note?: string) => void;
}

export function HandInput({ onAdd }: Props) {
  const [raw, setRaw] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(raw);
    if (isNaN(val) || raw.trim() === '') {
      setError('数値を入力してください');
      return;
    }
    onAdd(val, note.trim() || undefined);
    setRaw('');
    setNote('');
    setError('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
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
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
        >
          記録
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="メモ（任意）: ブラフ成功、etc."
        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  );
}

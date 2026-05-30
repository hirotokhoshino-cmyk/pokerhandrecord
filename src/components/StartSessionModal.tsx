import { useState } from 'react';

interface Props {
  onStart: (stake: string, buyIn: number, location?: string) => void;
}

const COMMON_STAKES = ['1/2', '1/3', '2/5', '5/10', '10/20', '25/50'];

export function StartSessionModal({ onStart }: Props) {
  const [stake, setStake] = useState('1/2');
  const [customStake, setCustomStake] = useState('');
  const [buyIn, setBuyIn] = useState('200');
  const [location, setLocation] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const effectiveStake = useCustom ? customStake : stake;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bi = parseFloat(buyIn);
    if (!effectiveStake || isNaN(bi) || bi <= 0) return;
    onStart(effectiveStake, bi, location.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-600 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-5">セッション開始</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">ステーク</label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {COMMON_STAKES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setStake(s); setUseCustom(false); }}
                  className={`py-1.5 rounded-md text-sm font-mono transition-colors ${
                    !useCustom && stake === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`text-xs px-2 py-1 rounded ${useCustom ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                カスタム
              </button>
              {useCustom && (
                <input
                  type="text"
                  value={customStake}
                  onChange={e => setCustomStake(e.target.value)}
                  placeholder="例: 1/2/5"
                  className="flex-1 px-2 py-1 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  autoFocus
                />
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">バイイン ($)</label>
            <input
              type="number"
              value={buyIn}
              onChange={e => setBuyIn(e.target.value)}
              min={1}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">カジノ・場所（任意）</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="例: Bellagio, Commerce Casino"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors mt-1"
          >
            ゲーム開始
          </button>
        </form>
      </div>
    </div>
  );
}

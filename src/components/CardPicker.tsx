import { useState } from 'react';

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const SUITS = [
  { sym: 's', label: '♠', color: 'text-slate-100',   bg: 'bg-slate-600',     ring: 'ring-slate-300' },
  { sym: 'h', label: '♥', color: 'text-red-400',     bg: 'bg-red-900/60',    ring: 'ring-red-400' },
  { sym: 'd', label: '♦', color: 'text-blue-300',    bg: 'bg-blue-900/60',   ring: 'ring-blue-400' },
  { sym: 'c', label: '♣', color: 'text-emerald-400', bg: 'bg-emerald-900/60',ring: 'ring-emerald-400' },
];

const SUIT_COLOR: Record<string, string> = { s:'text-slate-100', h:'text-red-400', d:'text-blue-300', c:'text-emerald-400' };
const SUIT_SYM:   Record<string, string> = { s:'♠', h:'♥', d:'♦', c:'♣' };
const SUIT_BG:    Record<string, string> = { s:'bg-slate-600', h:'bg-red-900/60', d:'bg-blue-900/60', c:'bg-emerald-900/60' };

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  unavailable?: string[];
}

export function CardPicker({ value, onChange, label = '?', unavailable = [] }: Props) {
  const [open, setOpen] = useState(false);

  const select = (code: string) => {
    onChange(value === code ? '' : code);
    setOpen(false);
  };

  const r = value.slice(0, -1);
  const s = value.slice(-1);

  return (
    <>
      {/* Card button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-11 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all active:scale-95 ${
          value
            ? `border-transparent ${SUIT_BG[s] ?? 'bg-slate-700'} ${SUIT_COLOR[s] ?? 'text-white'} shadow-md`
            : 'border-dashed border-slate-600 text-slate-500 bg-slate-800 hover:border-emerald-500'
        }`}
      >
        {value ? (
          <>
            <span className="text-lg leading-none">{r}</span>
            <span className="text-sm leading-none mt-0.5">{SUIT_SYM[s] ?? s}</span>
          </>
        ) : (
          <span className="text-xs">{label}</span>
        )}
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full bg-slate-900 rounded-t-2xl px-4 pt-4 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <p className="text-center text-sm text-slate-400 mb-4 font-semibold">カードを選択</p>

            {/* 4 suit rows */}
            <div className="flex flex-col gap-2">
              {SUITS.map(suit => (
                <div key={suit.sym} className="flex items-center gap-1.5">
                  {/* Suit label */}
                  <span className={`text-lg font-bold w-6 text-center shrink-0 ${suit.color}`}>
                    {suit.label}
                  </span>
                  {/* Rank buttons */}
                  <div className="flex gap-1 flex-1">
                    {RANKS.map(rank => {
                      const code = rank + suit.sym;
                      const isSelected  = value === code;
                      const isUnavail   = unavailable.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          disabled={isUnavail}
                          onClick={() => select(code)}
                          className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-all ${
                            isSelected
                              ? `${suit.bg} ${suit.color} ring-2 ${suit.ring} scale-105`
                              : isUnavail
                              ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
                              : `${suit.bg} ${suit.color} hover:brightness-125 active:scale-95`
                          }`}
                        >
                          {rank}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full mt-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-semibold"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Re-export helpers for other components
export { SUIT_COLOR, SUIT_SYM };

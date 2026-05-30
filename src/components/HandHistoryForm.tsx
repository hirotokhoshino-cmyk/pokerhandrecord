import { useState } from 'react';
import type { HandHistory } from '../types';

interface Props {
  onSave: (h: HandHistory) => void;
  onCancel: () => void;
  initial?: HandHistory;
}

const POSITIONS = ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS: { label: string; sym: string; color: string }[] = [
  { label: '♠', sym: 's', color: 'text-slate-200' },
  { label: '♥', sym: 'h', color: 'text-red-400' },
  { label: '♦', sym: 'd', color: 'text-blue-400' },
  { label: '♣', sym: 'c', color: 'text-emerald-400' },
];

function CardPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const rank = value.slice(0, -1) || '';
  const suit = value.slice(-1) || '';

  const set = (r: string, s: string) => {
    if (r && s) onChange(r + s);
    else onChange('');
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {RANKS.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => set(r, suit)}
            className={`w-7 h-7 rounded text-xs font-bold font-mono transition-colors ${
              rank === r ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        {SUITS.map(s => (
          <button
            key={s.sym}
            type="button"
            onClick={() => set(rank, s.sym)}
            className={`px-2.5 py-1 rounded text-sm font-bold transition-colors ${
              suit === s.sym ? 'bg-slate-500 ring-1 ring-white' : 'bg-slate-700 hover:bg-slate-600'
            } ${s.color}`}
          >
            {s.label}
          </button>
        ))}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-2 py-1 rounded text-xs text-slate-500 hover:text-red-400 bg-slate-700 ml-1"
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        <span className="text-xs font-mono text-emerald-400">{value}</span>
      )}
    </div>
  );
}

function MultiCardInput({
  label,
  count,
  value,
  onChange,
}: {
  label: string;
  count: number;
  value: string[];
  onChange: (cards: string[]) => void;
}) {
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };

  return (
    <div className="bg-slate-700/40 rounded-lg p-3 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className={`grid gap-4 ${count === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {Array.from({ length: count }, (_, i) => (
          <CardPicker
            key={i}
            label={`${i + 1}枚目`}
            value={value[i] ?? ''}
            onChange={v => update(i, v)}
          />
        ))}
      </div>
    </div>
  );
}

export function HandHistoryForm({ onSave, onCancel, initial }: Props) {
  const [pos, setPos] = useState(initial?.heroPosition ?? '');
  const heroRaw = initial?.heroCards?.split(' ') ?? [];
  const [heroCards, setHeroCards] = useState<string[]>([heroRaw[0] ?? '', heroRaw[1] ?? '']);
  const [preflop, setPreflop] = useState(initial?.preflopAction ?? '');

  const flopRaw = initial?.flopCards?.split(' ') ?? [];
  const [flopCards, setFlopCards] = useState<string[]>([flopRaw[0] ?? '', flopRaw[1] ?? '', flopRaw[2] ?? '']);
  const [flopAction, setFlopAction] = useState(initial?.flopAction ?? '');

  const [turnCard, setTurnCard] = useState<string[]>([initial?.turnCard ?? '']);
  const [turnAction, setTurnAction] = useState(initial?.turnAction ?? '');

  const [riverCard, setRiverCard] = useState<string[]>([initial?.riverCard ?? '']);
  const [riverAction, setRiverAction] = useState(initial?.riverAction ?? '');

  const [potSize, setPotSize] = useState(initial?.potSize?.toString() ?? '');
  const [villains, setVillains] = useState(initial?.villains ?? '');
  const [result, setResult] = useState(initial?.result ?? '');

  const [showFlop, setShowFlop] = useState(!!initial?.flopCards);
  const [showTurn, setShowTurn] = useState(!!initial?.turnCard);
  const [showRiver, setShowRiver] = useState(!!initial?.riverCard);

  const handleSave = () => {
    if (!pos || !heroCards[0] || !heroCards[1]) return;
    const h: HandHistory = {
      heroPosition: pos,
      heroCards: heroCards.filter(Boolean).join(' '),
      preflopAction: preflop,
      ...(showFlop && flopCards.some(Boolean) && {
        flopCards: flopCards.filter(Boolean).join(' '),
        flopAction,
      }),
      ...(showTurn && turnCard[0] && {
        turnCard: turnCard[0],
        turnAction,
      }),
      ...(showRiver && riverCard[0] && {
        riverCard: riverCard[0],
        riverAction,
      }),
      ...(potSize && { potSize: parseFloat(potSize) }),
      ...(villains && { villains }),
      ...(result && { result }),
    };
    onSave(h);
  };

  const canSave = pos && heroCards[0] && heroCards[1];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ハンド詳細</p>

      {/* Position */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">ヒーローのポジション</p>
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPos(p)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                pos === p ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Villain info */}
      <div>
        <p className="text-xs text-slate-500 mb-1">相手の情報（任意）</p>
        <input
          type="text"
          value={villains}
          onChange={e => setVillains(e.target.value)}
          placeholder="例: Reg、6max、タイト"
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Hero cards */}
      <div className="bg-slate-700/40 rounded-lg p-3 flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ホールカード</p>
        <div className="grid grid-cols-2 gap-4">
          <CardPicker label="1枚目" value={heroCards[0]} onChange={v => setHeroCards([v, heroCards[1]])} />
          <CardPicker label="2枚目" value={heroCards[1]} onChange={v => setHeroCards([heroCards[0], v])} />
        </div>
      </div>

      {/* Pot size */}
      <div>
        <p className="text-xs text-slate-500 mb-1">スタックサイズ / 有効スタック ($)</p>
        <input
          type="number"
          value={potSize}
          onChange={e => setPotSize(e.target.value)}
          placeholder="例: 300"
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Preflop */}
      <div className="bg-slate-700/40 rounded-lg p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">プリフロップ</p>
        <textarea
          value={preflop}
          onChange={e => setPreflop(e.target.value)}
          placeholder="例: UTGから3xオープン、BTNコール、BB 3bet 12bb、UTGコール"
          rows={2}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Flop */}
      {!showFlop ? (
        <button
          type="button"
          onClick={() => setShowFlop(true)}
          className="text-xs text-emerald-500 hover:text-emerald-400 self-start"
        >
          + フロップを追加
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <MultiCardInput label="フロップ" count={3} value={flopCards} onChange={setFlopCards} />
          <textarea
            value={flopAction}
            onChange={e => setFlopAction(e.target.value)}
            placeholder="フロップのアクション"
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      )}

      {/* Turn */}
      {showFlop && (!showTurn ? (
        <button
          type="button"
          onClick={() => setShowTurn(true)}
          className="text-xs text-emerald-500 hover:text-emerald-400 self-start"
        >
          + ターンを追加
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <MultiCardInput label="ターン" count={1} value={turnCard} onChange={setTurnCard} />
          <textarea
            value={turnAction}
            onChange={e => setTurnAction(e.target.value)}
            placeholder="ターンのアクション"
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      ))}

      {/* River */}
      {showTurn && (!showRiver ? (
        <button
          type="button"
          onClick={() => setShowRiver(true)}
          className="text-xs text-emerald-500 hover:text-emerald-400 self-start"
        >
          + リバーを追加
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <MultiCardInput label="リバー" count={1} value={riverCard} onChange={setRiverCard} />
          <textarea
            value={riverAction}
            onChange={e => setRiverAction(e.target.value)}
            placeholder="リバーのアクション"
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      ))}

      {/* Result note */}
      <div>
        <p className="text-xs text-slate-500 mb-1">結果メモ（任意）</p>
        <input
          type="text"
          value={result}
          onChange={e => setResult(e.target.value)}
          placeholder="例: ショーダウン勝ち、ブラフ成功、ペイオフ"
          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors"
        >
          スキップ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}

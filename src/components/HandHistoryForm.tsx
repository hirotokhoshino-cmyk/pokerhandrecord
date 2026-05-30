import { useState } from 'react';
import type { HandHistory, StreetAction, ActionType } from '../types';
import { CardPicker } from './CardPicker';

// ── constants ─────────────────────────────────────────────────────────────────

const POSITIONS_6MAX = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

const POS_LAYOUT: Record<string, { top: string; left: string }> = {
  UTG: { top: '50%',  left: '5%'  },
  HJ:  { top: '12%',  left: '28%' },
  CO:  { top: '12%',  left: '62%' },
  BTN: { top: '50%',  left: '82%' },
  SB:  { top: '82%',  left: '62%' },
  BB:  { top: '82%',  left: '28%' },
};

const POSTFLOP_SIZES = [
  { label: '25%',  pct: 0.25 },
  { label: '33%',  pct: 0.33 },
  { label: '50%',  pct: 0.50 },
  { label: '67%',  pct: 0.67 },
  { label: '75%',  pct: 0.75 },
  { label: '100%', pct: 1.00 },
  { label: '125%', pct: 1.25 },
  { label: '150%', pct: 1.50 },
  { label: '200%', pct: 2.00 },
];
const PREFLOP_OPEN = [2, 2.5, 3, 3.5, 4, 5, 6];
const PREFLOP_3BET = [9, 10, 11, 12, 14, 16];
const PREFLOP_4BET = [22, 25, 28, 32];

const ACTION_COLOR: Record<ActionType, string> = {
  fold: 'text-slate-400', check: 'text-blue-400', call: 'text-yellow-400',
  bet: 'text-emerald-400', raise: 'text-orange-400', allin: 'text-red-400',
};
const ACTION_SHORT: Record<ActionType, string> = {
  fold: 'F', check: 'x', call: 'c', bet: 'bet', raise: 'raise', allin: 'AI',
};

// ── StreetRecorder ────────────────────────────────────────────────────────────

function StreetRecorder({ actions, onAdd, onUndo, pot, isPreflop }: {
  actions: StreetAction[];
  onAdd: (a: StreetAction) => void;
  onUndo: () => void;
  pot: number;
  isPreflop: boolean;
}) {
  const [pos, setPos] = useState('');
  const [act, setAct] = useState<ActionType | ''>('');
  const [betMode, setBetMode] = useState<'open'|'3bet'|'4bet'>('open');
  const [custom, setCustom] = useState('');

  const hasFolded = (p: string) => actions.some(a => a.position === p && a.action === 'fold');
  const needsAmt  = act === 'bet' || act === 'raise';

  const commit = (amtBB?: number) => {
    if (!pos || !act) return;
    onAdd({ position: pos, action: act as ActionType, amountBB: amtBB });
    setPos(''); setAct(''); setCustom('');
  };

  const sizeButtons = isPreflop
    ? (betMode === 'open' ? PREFLOP_OPEN : betMode === '3bet' ? PREFLOP_3BET : PREFLOP_4BET)
        .map(n => ({ label: `${n}bb`, bb: n }))
    : POSTFLOP_SIZES.map(s => ({ label: s.label, bb: +(pot * s.pct).toFixed(1) }));

  return (
    <div className="flex flex-col gap-3">
      {/* Action log */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 bg-slate-900/50 rounded-lg px-2.5 py-2 items-center">
          {actions.map((a, i) => (
            <span key={i} className="text-xs font-mono">
              <span className="text-slate-400">{a.position}</span>
              <span className={`ml-0.5 font-bold ${ACTION_COLOR[a.action]}`}>{ACTION_SHORT[a.action]}</span>
              {a.amountBB != null && <span className="text-slate-400">{a.amountBB}bb</span>}
              {i < actions.length - 1 && <span className="text-slate-600 ml-1">·</span>}
            </span>
          ))}
          <button type="button" onClick={onUndo} className="ml-auto text-slate-600 hover:text-red-400 text-xs">↩</button>
        </div>
      )}

      {/* Position */}
      <div className="flex flex-wrap gap-1.5">
        {POSITIONS_6MAX.map(p => (
          <button key={p} type="button" onClick={() => setPos(p === pos ? '' : p)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
              p === pos ? 'bg-emerald-600 text-white' :
              hasFolded(p) ? 'bg-slate-800 text-slate-600 line-through' :
              'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>
            {p}
          </button>
        ))}
      </div>

      {/* Action types */}
      {pos && (
        <div className="flex flex-wrap gap-1.5">
          {(['fold','check','call','bet','raise','allin'] as ActionType[]).map(a => (
            <button key={a} type="button"
              onClick={() => {
                setAct(a);
                if (a !== 'bet' && a !== 'raise') { commit(); setAct(''); }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                act === a ? 'ring-2 ring-white/50 ' : ''
              }${
                a === 'fold'  ? 'bg-slate-700 border-slate-600 text-slate-300' :
                a === 'check' ? 'bg-blue-950 border-blue-800 text-blue-300' :
                a === 'call'  ? 'bg-yellow-950 border-yellow-800 text-yellow-300' :
                a === 'bet'   ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                a === 'raise' ? 'bg-orange-950 border-orange-800 text-orange-300' :
                                'bg-red-950 border-red-800 text-red-300'
              }`}>
              {a === 'fold' ? 'F' : a === 'check' ? 'チェック' : a === 'call' ? 'コール'
               : a === 'bet' ? 'ベット' : a === 'raise' ? 'レイズ' : 'オールイン'}
            </button>
          ))}
        </div>
      )}

      {/* Bet sizes */}
      {pos && needsAmt && (
        <div className="bg-slate-700/30 rounded-xl p-3 flex flex-col gap-2">
          {isPreflop && (
            <div className="flex gap-1.5 mb-1">
              {(['open','3bet','4bet'] as const).map(m => (
                <button key={m} type="button" onClick={() => setBetMode(m)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${betMode === m ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {m === 'open' ? 'オープン' : m === '3bet' ? '3bet' : '4bet'}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {sizeButtons.map(({ label, bb }) => (
              <button key={label} type="button" onClick={() => commit(bb)}
                className="px-2.5 py-2 bg-slate-700 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-lg transition-colors flex flex-col items-center leading-none gap-0.5">
                <span>{label}</span>
                {!isPreflop && <span className="text-slate-400 text-[10px]">{bb}bb</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" step="0.5" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="カスタム (bb)"
              className="flex-1 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
            <button type="button" onClick={() => { const n = parseFloat(custom); if (!isNaN(n)) commit(n); }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg">確定</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CardRow ───────────────────────────────────────────────────────────────────

function CardRow({ cards, onChange, count, allPicked }: {
  cards: string[];
  onChange: (i: number, v: string) => void;
  count: number;
  allPicked: string[];
}) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }, (_, i) => (
        <CardPicker key={i} value={cards[i] ?? ''} onChange={v => onChange(i, v)}
          unavailable={allPicked.filter(c => c !== (cards[i] ?? ''))} />
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  onSave: (h: HandHistory) => void;
  onCancel: () => void;
  initialStackDollars?: number; // current stack in $
  defaultBbSize?: number;
}

type Street = 'preflop' | 'flop' | 'turn' | 'river';
const STREET_LABEL: Record<Street, string> = { preflop:'プリフロップ', flop:'フロップ', turn:'ターン', river:'リバー' };

export function HandHistoryForm({ onSave, onCancel, initialStackDollars, defaultBbSize = 5 }: Props) {
  const [heroPos,  setHeroPos]  = useState('');
  const [heroC1,   setHeroC1]   = useState('');
  const [heroC2,   setHeroC2]   = useState('');
  const [bbSize,   setBbSize]   = useState(String(defaultBbSize));
  const [stackBB,  setStackBB]  = useState(() => {
    if (initialStackDollars && defaultBbSize) return String(Math.round(initialStackDollars / defaultBbSize));
    return '100';
  });
  const [street,   setStreet]   = useState<Street>('preflop');
  const [result,   setResult]   = useState('');

  const [preflopActs, setPreflopActs] = useState<StreetAction[]>([]);
  const [flopBoard,   setFlopBoard]   = useState(['','','']);
  const [flopActs,    setFlopActs]    = useState<StreetAction[]>([]);
  const [turnCard,    setTurnCard]    = useState('');
  const [turnActs,    setTurnActs]    = useState<StreetAction[]>([]);
  const [riverCard,   setRiverCard]   = useState('');
  const [riverActs,   setRiverActs]   = useState<StreetAction[]>([]);

  const bbSizeN = parseFloat(bbSize) || 5;

  // running pot (rough)
  const preflopPot = preflopActs.reduce((s, a) => s + (a.amountBB ?? 0), 0) + 1.5;
  const flopPot    = preflopPot + flopActs.reduce((s, a) => s + (a.amountBB ?? 0), 0);
  const turnPot    = flopPot   + turnActs.reduce((s, a) => s + (a.amountBB ?? 0), 0);
  const potFor     = (s: Street) => s === 'preflop' ? 1.5 : s === 'flop' ? preflopPot : s === 'turn' ? flopPot : turnPot;

  const actsFor    = (s: Street) => s === 'preflop' ? preflopActs : s === 'flop' ? flopActs : s === 'turn' ? turnActs : riverActs;
  const setActs    = (s: Street, fn: (p: StreetAction[]) => StreetAction[]) => {
    if (s === 'preflop') setPreflopActs(fn);
    else if (s === 'flop') setFlopActs(fn);
    else if (s === 'turn') setTurnActs(fn);
    else setRiverActs(fn);
  };

  // all picked cards (to gray out in pickers)
  const allPicked = [heroC1, heroC2, ...flopBoard, turnCard, riverCard].filter(Boolean);

  const updateFlopCard = (i: number, v: string) => setFlopBoard(b => { const n=[...b]; n[i]=v; return n; });

  const canSave = heroPos && heroC1 && heroC2;

  const save = () => {
    if (!canSave) return;
    onSave({
      heroPosition: heroPos,
      heroCards: `${heroC1} ${heroC2}`,
      bbSize: bbSizeN,
      effectiveStack: parseFloat(stackBB) || 100,
      preflopActions: preflopActs,
      ...(flopBoard.some(Boolean) && { flopCards: flopBoard.filter(Boolean).join(' '), flopActions: flopActs }),
      ...(turnCard  && { turnCard,  turnActions: turnActs }),
      ...(riverCard && { riverCard, riverActions: riverActs }),
      ...(result    && { result }),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ハンド詳細</p>

      {/* ── Visual table ── */}
      <div className="relative bg-emerald-900/30 border border-emerald-800/40 rounded-2xl" style={{ paddingTop: '50%' }}>
        <div className="absolute inset-4 bg-emerald-800/40 rounded-[50%] border border-emerald-700/30 flex items-center justify-center">
          {heroC1 && heroC2 ? (
            <div className="flex gap-1.5">
              <CardPicker value={heroC1} onChange={setHeroC1} unavailable={allPicked.filter(c => c !== heroC1)} />
              <CardPicker value={heroC2} onChange={setHeroC2} unavailable={allPicked.filter(c => c !== heroC2)} />
            </div>
          ) : (
            <span className="text-xs text-emerald-700">ポジションを選択</span>
          )}
        </div>
        {POSITIONS_6MAX.map(p => {
          const c = POS_LAYOUT[p];
          const isHero = p === heroPos;
          return (
            <button key={p} type="button" onClick={() => setHeroPos(p === heroPos ? '' : p)}
              style={{ top: c.top, left: c.left, transform: 'translate(-50%,-50%)' }}
              className={`absolute w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold font-mono border-2 transition-all ${
                isHero
                  ? 'bg-emerald-600 border-emerald-300 text-white scale-110 shadow-lg shadow-emerald-900'
                  : 'bg-slate-700 border-slate-500 text-slate-300 hover:border-emerald-500'
              }`}>
              {p}
              {isHero && <span className="text-[8px] text-emerald-200 leading-none">HERO</span>}
            </button>
          );
        })}
      </div>

      {/* ── Hero cards (if not yet set) ── */}
      {!heroC1 || !heroC2 ? (
        <div>
          <p className="text-xs text-slate-500 mb-2">ホールカード</p>
          <div className="flex gap-3 items-center">
            <CardPicker value={heroC1} onChange={setHeroC1} label="1枚目" unavailable={allPicked.filter(c => c !== heroC1)} />
            <CardPicker value={heroC2} onChange={setHeroC2} label="2枚目" unavailable={allPicked.filter(c => c !== heroC2)} />
          </div>
        </div>
      ) : null}

      {/* ── Setup ── */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-slate-500 mb-1">BB ($)</p>
          <input type="number" value={bbSize} onChange={e => setBbSize(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">有効スタック (BB)</p>
          <input type="number" value={stackBB} onChange={e => setStackBB(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      {/* ── Street tabs ── */}
      <div>
        <div className="flex gap-0.5 mb-3">
          {(['preflop','flop','turn','river'] as Street[]).map(s => (
            <button key={s} type="button" onClick={() => setStreet(s)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                street === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {STREET_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-3 flex flex-col gap-3">
          {/* Board cards */}
          {street === 'flop' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">ボード (3枚)</p>
              <CardRow cards={flopBoard} onChange={updateFlopCard} count={3} allPicked={allPicked} />
            </div>
          )}
          {street === 'turn' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">ターンカード</p>
              <CardRow cards={[turnCard]} onChange={(_, v) => setTurnCard(v)} count={1} allPicked={allPicked} />
            </div>
          )}
          {street === 'river' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">リバーカード</p>
              <CardRow cards={[riverCard]} onChange={(_, v) => setRiverCard(v)} count={1} allPicked={allPicked} />
            </div>
          )}

          {/* Pot */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">ポット:</span>
            <span className="font-mono text-yellow-400">{potFor(street).toFixed(1)}bb</span>
            <span className="text-slate-600">${(potFor(street) * bbSizeN).toFixed(0)}</span>
          </div>

          {/* Actions */}
          <StreetRecorder
            actions={actsFor(street)}
            onAdd={a => setActs(street, p => [...p, a])}
            onUndo={() => setActs(street, p => p.slice(0, -1))}
            pot={potFor(street)}
            isPreflop={street === 'preflop'}
          />
        </div>
      </div>

      {/* Result */}
      <div>
        <p className="text-xs text-slate-500 mb-1">結果メモ（任意）</p>
        <input type="text" value={result} onChange={e => setResult(e.target.value)}
          placeholder="例: ショーダウン勝ち、ブラフ成功"
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-xl transition-colors">
          スキップ
        </button>
        <button type="button" onClick={save} disabled={!canSave}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
          保存
        </button>
      </div>
    </div>
  );
}

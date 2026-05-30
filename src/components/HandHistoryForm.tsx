import { useState } from 'react';
import type { HandHistory, StreetAction, ActionType } from '../types';

// ── constants ───────────────────────────────────────────────────────────────

const POSITIONS_6MAX = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// absolute positions on oval (% from container top-left)
const POS_LAYOUT: Record<string, { top: string; left: string }> = {
  UTG: { top: '50%', left: '5%' },
  HJ:  { top: '12%', left: '28%' },
  CO:  { top: '12%', left: '62%' },
  BTN: { top: '50%', left: '82%' },
  SB:  { top: '82%', left: '62%' },
  BB:  { top: '82%', left: '28%' },
};

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const SUITS = [
  { sym: 's', label: '♠', color: 'text-slate-200' },
  { sym: 'h', label: '♥', color: 'text-red-400' },
  { sym: 'd', label: '♦', color: 'text-blue-400' },
  { sym: 'c', label: '♣', color: 'text-emerald-400' },
];
const SUIT_COLOR: Record<string, string> = { s:'text-slate-200', h:'text-red-400', d:'text-blue-400', c:'text-emerald-400' };
const SUIT_SYM: Record<string, string>   = { s:'♠', h:'♥', d:'♦', c:'♣' };

// GTO Wizard postflop sizes
const POSTFLOP_SIZES = [
  { label: '25%', pct: 0.25 },
  { label: '33%', pct: 0.33 },
  { label: '50%', pct: 0.50 },
  { label: '67%', pct: 0.67 },
  { label: '75%', pct: 0.75 },
  { label: '100%', pct: 1.00 },
  { label: '125%', pct: 1.25 },
  { label: '150%', pct: 1.50 },
  { label: '200%', pct: 2.00 },
];

// GTO Wizard preflop open sizes (BB)
const PREFLOP_OPEN_BB = [2, 2.5, 3, 3.5, 4, 5, 6];
const PREFLOP_3BET_BB = [9, 10, 11, 12, 14, 16];
const PREFLOP_4BET_BB = [22, 25, 28, 32];

// ── tiny helpers ─────────────────────────────────────────────────────────────

function CardBadge({ code }: { code: string }) {
  if (code.length < 2) return <span className="w-8 h-11 rounded border border-slate-600 bg-slate-800 inline-block" />;
  const r = code.slice(0, -1), s = code.slice(-1);
  return (
    <span className={`inline-flex flex-col items-center justify-center w-8 h-11 rounded border border-slate-500 bg-slate-700 font-bold text-sm leading-none ${SUIT_COLOR[s] ?? 'text-white'}`}>
      <span>{r}</span>
      <span className="text-xs">{SUIT_SYM[s] ?? s}</span>
    </span>
  );
}

function InlineCardPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [rank, setRank] = useState(value.slice(0, -1) || '');
  const [suit, setSuit] = useState(value.slice(-1) || '');

  const select = (r: string, s: string) => {
    if (r && s) { onChange(r + s); setOpen(false); }
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className="focus:outline-none">
        {value ? <CardBadge code={value} /> : (
          <span className="w-8 h-11 rounded border-2 border-dashed border-slate-600 text-slate-500 text-xs flex items-center justify-center">{label}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl min-w-max top-12 left-0">
          <div className="flex flex-wrap gap-1 mb-2 max-w-[200px]">
            {RANKS.map(r => (
              <button key={r} type="button" onClick={() => { setRank(r); select(r, suit); }}
                className={`w-7 h-7 rounded text-xs font-bold font-mono ${rank === r ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {SUITS.map(s => (
              <button key={s.sym} type="button" onClick={() => { setSuit(s.sym); select(rank, s.sym); }}
                className={`px-2 py-1 rounded text-sm font-bold ${suit === s.sym ? 'bg-slate-500 ring-1 ring-white' : 'bg-slate-700 hover:bg-slate-600'} ${s.color}`}>
                {s.label}
              </button>
            ))}
          </div>
          {value && <button type="button" onClick={() => { onChange(''); setRank(''); setSuit(''); setOpen(false); }}
            className="mt-2 text-xs text-red-400 hover:text-red-300 w-full text-center">クリア</button>}
        </div>
      )}
    </div>
  );
}

// ── action label ──────────────────────────────────────────────────────────────

const ACTION_COLOR: Record<ActionType, string> = {
  fold: 'text-slate-400',
  check: 'text-blue-400',
  call: 'text-yellow-400',
  bet: 'text-emerald-400',
  raise: 'text-orange-400',
  allin: 'text-red-400',
};
const ACTION_LABEL: Record<ActionType, string> = {
  fold:'F', check:'x', call:'c', bet:'bet', raise:'raise', allin:'all-in',
};

// ── street recorder ───────────────────────────────────────────────────────────

function StreetRecorder({
  actions, onAdd, onUndo, pot, isPreflop,
}: {
  streetName?: string;
  boardCount?: number;
  actions: StreetAction[];
  board: string[];
  onAdd: (a: StreetAction) => void;
  onUndo: () => void;
  pot: number;
  isPreflop: boolean;
}) {
  const [pos, setPos] = useState('');
  const [actionType, setActionType] = useState<ActionType | ''>('');
  const [customBB, setCustomBB] = useState('');
  const [betMode, setBetMode] = useState<'preflop_open' | 'preflop_3bet' | 'preflop_4bet' | 'postflop' | 'custom'>('postflop');

  const needsAmount = actionType === 'bet' || actionType === 'raise';

  const addAction = (amountBB?: number) => {
    if (!pos || !actionType) return;
    onAdd({ position: pos, action: actionType as ActionType, amountBB });
    setPos('');
    setActionType('');
    setCustomBB('');
  };

  const addCustom = () => {
    const n = parseFloat(customBB);
    if (isNaN(n)) return;
    addAction(n);
  };

  const activePosColor = (p: string) => actions.find(a => a.position === p && a.action === 'fold')
    ? 'bg-slate-800 text-slate-600 line-through'
    : p === pos ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600';

  const sizeButtons = isPreflop
    ? betMode === 'preflop_open' ? PREFLOP_OPEN_BB.map(n => ({ label: `${n}bb`, bb: n }))
    : betMode === 'preflop_3bet' ? PREFLOP_3BET_BB.map(n => ({ label: `${n}bb`, bb: n }))
    : PREFLOP_4BET_BB.map(n => ({ label: `${n}bb`, bb: n }))
    : POSTFLOP_SIZES.map(s => ({ label: s.label, bb: Math.round(pot * s.pct * 10) / 10 }));

  return (
    <div className="flex flex-col gap-3">
      {/* Action log */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 bg-slate-900/50 rounded-lg p-2">
          {actions.map((a, i) => (
            <span key={i} className="text-xs font-mono">
              <span className="text-slate-400">{a.position}</span>
              <span className={` ml-0.5 font-bold ${ACTION_COLOR[a.action]}`}>{ACTION_LABEL[a.action]}</span>
              {a.amountBB != null && <span className="text-slate-400">{a.amountBB}bb</span>}
              {i < actions.length - 1 && <span className="text-slate-600 ml-1">·</span>}
            </span>
          ))}
          <button type="button" onClick={onUndo} className="text-xs text-slate-600 hover:text-red-400 ml-1">↩</button>
        </div>
      )}

      {/* Position selector */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">アクターのポジション</p>
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS_6MAX.map(p => (
            <button key={p} type="button" onClick={() => setPos(p)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${activePosColor(p)}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Action type */}
      {pos && (
        <div className="flex flex-wrap gap-1.5">
          {(['fold','check','call','bet','raise','allin'] as ActionType[]).map(a => (
            <button key={a} type="button"
              onClick={() => {
                setActionType(a);
                if (a !== 'bet' && a !== 'raise') addAction(undefined);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                actionType === a ? 'ring-2 ring-white ' : ''
              }${
                a === 'fold' ? 'bg-slate-700 text-slate-300' :
                a === 'check' ? 'bg-blue-900 text-blue-300' :
                a === 'call' ? 'bg-yellow-900 text-yellow-300' :
                a === 'bet' ? 'bg-emerald-900 text-emerald-300' :
                a === 'raise' ? 'bg-orange-900 text-orange-300' :
                'bg-red-900 text-red-300'
              }`}>
              {a === 'fold' ? 'フォールド' : a === 'check' ? 'チェック' : a === 'call' ? 'コール' :
               a === 'bet' ? 'ベット' : a === 'raise' ? 'レイズ' : 'オールイン'}
            </button>
          ))}
        </div>
      )}

      {/* Bet/Raise size */}
      {pos && needsAmount && (
        <div className="flex flex-col gap-2 bg-slate-700/30 rounded-lg p-3">
          {isPreflop && (
            <div className="flex gap-1.5 mb-1">
              {(['preflop_open','preflop_3bet','preflop_4bet'] as const).map(m => (
                <button key={m} type="button" onClick={() => setBetMode(m)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${betMode === m ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                  {m === 'preflop_open' ? 'オープン' : m === 'preflop_3bet' ? '3bet' : '4bet'}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {sizeButtons.map(({ label, bb }) => (
              <button key={label} type="button" onClick={() => addAction(bb)}
                className="px-2.5 py-1.5 bg-slate-700 hover:bg-emerald-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition-colors">
                {label}
                {!isPreflop && <span className="text-slate-400 ml-1 text-[10px]">{bb}bb</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <input type="number" step="0.5" value={customBB} onChange={e => setCustomBB(e.target.value)}
              placeholder="カスタム (bb)"
              className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
            <button type="button" onClick={addCustom}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg">確定</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main form ─────────────────────────────────────────────────────────────────

interface Props {
  onSave: (h: HandHistory) => void;
  onCancel: () => void;
}

type Street = 'preflop' | 'flop' | 'turn' | 'river';

export function HandHistoryForm({ onSave, onCancel }: Props) {
  const [heroPos, setHeroPos] = useState('');
  const [card1, setCard1] = useState('');
  const [card2, setCard2] = useState('');
  const [bbSize, setBbSize] = useState('5');
  const [stackBB, setStackBB] = useState('100');
  const [street, setStreet] = useState<Street>('preflop');
  const [result, setResult] = useState('');

  const [preflopActions, setPreflopActions] = useState<StreetAction[]>([]);
  const [flopBoard, setFlopBoard] = useState(['', '', '']);
  const [flopActions, setFlopActions] = useState<StreetAction[]>([]);
  const [turnCard, setTurnCard] = useState('');
  const [turnActions, setTurnActions] = useState<StreetAction[]>([]);
  const [riverCard, setRiverCard] = useState('');
  const [riverActions, setRiverActions] = useState<StreetAction[]>([]);

  // pot tracking (rough)
  const bbSizeN = parseFloat(bbSize) || 5;
  const preflopPot = preflopActions.reduce((s, a) => s + (a.amountBB ?? 0), 0) + 1.5; // SB+BB
  const flopPot = preflopPot + flopActions.reduce((s, a) => s + (a.amountBB ?? 0), 0);
  const turnPot = flopPot + turnActions.reduce((s, a) => s + (a.amountBB ?? 0), 0);

  const potFor = (s: Street) =>
    s === 'preflop' ? 1.5 : s === 'flop' ? preflopPot : s === 'turn' ? flopPot : turnPot;

  const addAction = (s: Street, a: StreetAction) => {
    if (s === 'preflop') setPreflopActions(p => [...p, a]);
    else if (s === 'flop') setFlopActions(p => [...p, a]);
    else if (s === 'turn') setTurnActions(p => [...p, a]);
    else setRiverActions(p => [...p, a]);
  };
  const undoAction = (s: Street) => {
    if (s === 'preflop') setPreflopActions(p => p.slice(0, -1));
    else if (s === 'flop') setFlopActions(p => p.slice(0, -1));
    else if (s === 'turn') setTurnActions(p => p.slice(0, -1));
    else setRiverActions(p => p.slice(0, -1));
  };

  const canSave = heroPos && card1 && card2;

  const save = () => {
    if (!canSave) return;
    const h: HandHistory = {
      heroPosition: heroPos,
      heroCards: `${card1} ${card2}`,
      bbSize: bbSizeN,
      effectiveStack: parseFloat(stackBB) || 100,
      preflopActions,
      ...(flopBoard.some(Boolean) && {
        flopCards: flopBoard.filter(Boolean).join(' '),
        flopActions,
      }),
      ...(turnCard && { turnCard, turnActions }),
      ...(riverCard && { riverCard, riverActions }),
      ...(result && { result }),
    };
    onSave(h);
  };

  const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];
  const streetLabel: Record<Street, string> = { preflop:'プリフロップ', flop:'フロップ', turn:'ターン', river:'リバー' };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ハンド詳細</p>

      {/* ── Visual table ── */}
      <div className="relative bg-emerald-900/40 border border-emerald-800/50 rounded-2xl" style={{ paddingTop: '52%' }}>
        {/* oval felt */}
        <div className="absolute inset-4 bg-emerald-800/50 rounded-[50%] border border-emerald-700/40 flex items-center justify-center">
          {card1 && card2 && (
            <div className="flex gap-1">
              <CardBadge code={card1} />
              <CardBadge code={card2} />
            </div>
          )}
        </div>
        {/* positions */}
        {POSITIONS_6MAX.map(p => {
          const coord = POS_LAYOUT[p];
          const isHero = p === heroPos;
          const hasFolded = preflopActions.find(a => a.position === p && a.action === 'fold');
          return (
            <button
              key={p}
              type="button"
              onClick={() => setHeroPos(p)}
              style={{ top: coord.top, left: coord.left, transform: 'translate(-50%, -50%)' }}
              className={`absolute flex flex-col items-center justify-center w-12 h-12 rounded-full text-xs font-bold font-mono border-2 transition-all ${
                isHero ? 'bg-emerald-600 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-900' :
                hasFolded ? 'bg-slate-800 border-slate-700 text-slate-600' :
                'bg-slate-700 border-slate-500 text-slate-200 hover:border-emerald-500'
              }`}
            >
              <span>{p}</span>
              {isHero && <span className="text-[9px] text-emerald-300">HERO</span>}
            </button>
          );
        })}
      </div>

      {/* ── Setup row ── */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-slate-500 mb-1">BB ($)</p>
          <input type="number" value={bbSize} onChange={e => setBbSize(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">有効スタック (BB)</p>
          <input type="number" value={stackBB} onChange={e => setStackBB(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      {/* ── Hero cards ── */}
      <div>
        <p className="text-xs text-slate-500 mb-2">ホールカード</p>
        <div className="flex gap-3 items-center">
          <InlineCardPicker value={card1} onChange={setCard1} label="1枚" />
          <InlineCardPicker value={card2} onChange={setCard2} label="2枚" />
          {card1 && card2 && (
            <span className="text-sm font-mono text-emerald-400">{card1} {card2}</span>
          )}
        </div>
      </div>

      {/* ── Street tabs ── */}
      <div>
        <div className="flex gap-0.5 mb-3">
          {streets.map(s => (
            <button key={s} type="button" onClick={() => setStreet(s)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                street === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {streetLabel[s]}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-3 flex flex-col gap-3">
          {/* Board cards */}
          {street === 'flop' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">フロップ (3枚)</p>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <InlineCardPicker key={i} value={flopBoard[i]} label={`${i+1}`}
                    onChange={v => setFlopBoard(b => { const n=[...b]; n[i]=v; return n; })} />
                ))}
              </div>
            </div>
          )}
          {street === 'turn' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">ターン</p>
              <InlineCardPicker value={turnCard} onChange={setTurnCard} label="T" />
            </div>
          )}
          {street === 'river' && (
            <div>
              <p className="text-xs text-slate-500 mb-2">リバー</p>
              <InlineCardPicker value={riverCard} onChange={setRiverCard} label="R" />
            </div>
          )}

          {/* Pot display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ポット:</span>
            <span className="text-sm font-mono text-yellow-400">{potFor(street).toFixed(1)}bb</span>
            <span className="text-xs text-slate-500">(${(potFor(street) * bbSizeN).toFixed(0)})</span>
          </div>

          {/* Action recorder */}
          <StreetRecorder
            streetName={streetLabel[street]}
            boardCount={street === 'flop' ? 3 : street === 'preflop' ? 0 : 1}
            actions={
              street === 'preflop' ? preflopActions :
              street === 'flop' ? flopActions :
              street === 'turn' ? turnActions : riverActions
            }
            board={street === 'flop' ? flopBoard : []}
            onAdd={a => addAction(street, a)}
            onUndo={() => undoAction(street)}
            pot={potFor(street)}
            isPreflop={street === 'preflop'}
          />
        </div>
      </div>

      {/* Result memo */}
      <div>
        <p className="text-xs text-slate-500 mb-1">結果メモ（任意）</p>
        <input type="text" value={result} onChange={e => setResult(e.target.value)}
          placeholder="例: ショーダウン勝ち、ブラフ成功"
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-lg transition-colors">
          スキップ
        </button>
        <button type="button" onClick={save} disabled={!canSave}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
          保存
        </button>
      </div>
    </div>
  );
}

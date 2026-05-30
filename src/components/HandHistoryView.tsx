import type { HandHistory } from '../types';

const SUIT_COLOR: Record<string, string> = {
  s: 'text-slate-200',
  h: 'text-red-400',
  d: 'text-blue-400',
  c: 'text-emerald-400',
};
const SUIT_SYM: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

function Card({ code }: { code: string }) {
  if (!code || code.length < 2) return null;
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  return (
    <span className={`inline-flex items-center font-bold font-mono text-sm bg-slate-700 rounded px-1.5 py-0.5 ${SUIT_COLOR[suit] ?? 'text-white'}`}>
      {rank}{SUIT_SYM[suit] ?? suit}
    </span>
  );
}

function Cards({ raw }: { raw?: string }) {
  if (!raw) return null;
  return (
    <span className="flex gap-1 flex-wrap">
      {raw.split(' ').map((c, i) => <Card key={i} code={c} />)}
    </span>
  );
}

interface Props {
  history: HandHistory;
}

export function HandHistoryView({ history }: Props) {
  return (
    <div className="flex flex-col gap-2 text-sm bg-slate-900/60 rounded-lg p-3 mt-1">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-mono font-bold text-emerald-400">
          {history.heroPosition}
        </span>
        <Cards raw={history.heroCards} />
        {history.potSize && (
          <span className="text-xs text-slate-400 font-mono ml-auto">
            ${history.potSize.toLocaleString()}
          </span>
        )}
      </div>
      {history.villains && (
        <p className="text-xs text-slate-500">相手: {history.villains}</p>
      )}

      {/* Streets */}
      <Street label="プリフロップ" action={history.preflopAction} />

      {history.flopCards && (
        <Street
          label="フロップ"
          cards={history.flopCards}
          action={history.flopAction}
        />
      )}
      {history.turnCard && (
        <Street
          label="ターン"
          cards={history.turnCard}
          action={history.turnAction}
        />
      )}
      {history.riverCard && (
        <Street
          label="リバー"
          cards={history.riverCard}
          action={history.riverAction}
        />
      )}

      {history.result && (
        <p className="text-xs text-slate-400 border-t border-slate-700 pt-2 mt-1">
          結果: {history.result}
        </p>
      )}
    </div>
  );
}

function Street({ label, cards, action }: { label: string; cards?: string; action?: string }) {
  if (!action && !cards) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold w-20 shrink-0">{label}</span>
        {cards && <Cards raw={cards} />}
      </div>
      {action && <p className="text-xs text-slate-300 pl-20">{action}</p>}
    </div>
  );
}

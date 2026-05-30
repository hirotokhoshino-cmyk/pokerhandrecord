import type { HandHistory, ActionType } from '../types';

const SUIT_COLOR: Record<string, string> = { s:'text-slate-200', h:'text-red-400', d:'text-blue-400', c:'text-emerald-400' };
const SUIT_SYM: Record<string, string>   = { s:'♠', h:'♥', d:'♦', c:'♣' };
const ACTION_COLOR: Record<ActionType, string> = {
  fold:'text-slate-400', check:'text-blue-400', call:'text-yellow-400',
  bet:'text-emerald-400', raise:'text-orange-400', allin:'text-red-400',
};
const ACTION_LABEL: Record<ActionType, string> = {
  fold:'F', check:'x', call:'c', bet:'bet', raise:'raise', allin:'all-in',
};

function Card({ code }: { code: string }) {
  if (!code || code.length < 2) return null;
  const r = code.slice(0, -1), s = code.slice(-1);
  return (
    <span className={`inline-flex flex-col items-center justify-center w-7 h-9 rounded border border-slate-500 bg-slate-700 font-bold text-xs leading-none ${SUIT_COLOR[s] ?? 'text-white'}`}>
      <span>{r}</span><span className="text-[10px]">{SUIT_SYM[s] ?? s}</span>
    </span>
  );
}

function Cards({ raw }: { raw?: string }) {
  if (!raw) return null;
  return <span className="flex gap-1 flex-wrap">{raw.split(' ').map((c, i) => <Card key={i} code={c} />)}</span>;
}

function ActionLine({ actions }: { actions?: { position: string; action: ActionType; amountBB?: number }[] }) {
  if (!actions?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((a, i) => (
        <span key={i} className="text-xs font-mono">
          <span className="text-slate-400">{a.position}</span>
          <span className={`ml-0.5 font-bold ${ACTION_COLOR[a.action]}`}>{ACTION_LABEL[a.action]}</span>
          {a.amountBB != null && <span className="text-slate-400">{a.amountBB}bb</span>}
        </span>
      ))}
    </div>
  );
}

export function HandHistoryView({ history }: { history: HandHistory }) {
  const bbStr = history.bbSize ? `$${history.bbSize}/bb` : '';

  return (
    <div className="flex flex-col gap-2 text-sm bg-slate-900/60 rounded-lg p-3 mt-1">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-mono font-bold text-emerald-400">
          {history.heroPosition}
        </span>
        <Cards raw={history.heroCards} />
        <span className="text-xs text-slate-500 ml-auto font-mono">
          {history.effectiveStack}bb {bbStr && `· ${bbStr}`}
        </span>
      </div>

      {/* Streets */}
      <StreetRow label="プリフロップ" actions={history.preflopActions} />

      {history.flopCards && (
        <StreetRow label="フロップ" board={history.flopCards} actions={history.flopActions} />
      )}
      {history.turnCard && (
        <StreetRow label="ターン" board={history.turnCard} actions={history.turnActions} />
      )}
      {history.riverCard && (
        <StreetRow label="リバー" board={history.riverCard} actions={history.riverActions} />
      )}

      {history.result && (
        <p className="text-xs text-slate-400 border-t border-slate-700 pt-2 mt-1">
          {history.result}
        </p>
      )}
    </div>
  );
}

function StreetRow({ label, board, actions }: {
  label: string;
  board?: string;
  actions?: { position: string; action: ActionType; amountBB?: number }[];
}) {
  if (!board && !actions?.length) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold w-20 shrink-0">{label}</span>
        {board && <Cards raw={board} />}
      </div>
      {actions?.length ? <div className="pl-20"><ActionLine actions={actions} /></div> : null}
    </div>
  );
}

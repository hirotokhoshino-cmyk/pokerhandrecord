import { useState } from 'react';
import { useSessions } from './hooks/useSessions';
import { StartSessionModal } from './components/StartSessionModal';
import { ActiveSession } from './components/ActiveSession';
import { DailyChart } from './components/DailyChart';
import { SessionHistory } from './components/SessionHistory';

type Tab = 'play' | 'stats' | 'history';

export default function App() {
  const { sessions, activeSession, startSession, endSession, addHand, deleteHand, deleteSession } = useSessions();
  const [showStart, setShowStart] = useState(false);
  const [tab, setTab] = useState<Tab>('play');

  const handleStart = (stake: string, buyIn: number, location?: string) => {
    startSession(stake, buyIn, location);
    setShowStart(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f1117]/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">♠</span>
          <h1 className="text-base font-bold text-white">Poker Hand Record</h1>
        </div>
        {!activeSession && (
          <button
            onClick={() => setShowStart(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + セッション開始
          </button>
        )}
        {activeSession && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            プレイ中
          </span>
        )}
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-slate-800 px-4">
        {(['play', 'stats', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'play' ? 'プレイ' : t === 'stats' ? '統計' : '履歴'}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-8">
        {tab === 'play' && (
          <>
            {activeSession ? (
              <ActiveSession
                session={activeSession}
                onAddHand={(amount, note) => addHand(activeSession.id, amount, note)}
                onDeleteHand={handId => deleteHand(activeSession.id, handId)}
                onEnd={() => endSession(activeSession.id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-6xl">♠</span>
                <p className="text-slate-400">セッションを開始してハンド履歴を記録しましょう</p>
                <button
                  onClick={() => setShowStart(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                >
                  セッション開始
                </button>
              </div>
            )}
          </>
        )}

        {tab === 'stats' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-300">全体統計</h2>
            <DailyChart sessions={sessions} />
            {sessions.filter(s => s.endTime).length === 0 && (
              <p className="text-slate-500 text-center py-8">完了したセッションがありません</p>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-300">セッション履歴</h2>
            <SessionHistory sessions={sessions} onDelete={deleteSession} />
          </div>
        )}
      </main>

      {showStart && <StartSessionModal onStart={handleStart} />}
    </div>
  );
}

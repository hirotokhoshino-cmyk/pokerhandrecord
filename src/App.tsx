import { useState } from 'react';
import { useSessions } from './hooks/useSessions';
import { useStudents } from './hooks/useStudents';
import { StartSessionModal } from './components/StartSessionModal';
import { ActiveSession } from './components/ActiveSession';
import { DailyChart } from './components/DailyChart';
import { SessionHistory } from './components/SessionHistory';
import { StudentsTab } from './components/StudentsTab';
import { StudentsPasswordGate } from './components/StudentsPasswordGate';

type Tab = 'play' | 'stats' | 'history' | 'students';

const TAB_LABELS: Record<Tab, string> = {
  play: 'プレイ',
  stats: '統計',
  history: '履歴',
  students: '生徒',
};

export default function App() {
  const { sessions, activeSession, startSession, endSession, addHand, deleteHand, deleteSession, updateStartTime } = useSessions();
  const { students, addStudent, deleteStudent } = useStudents();
  const [showStart, setShowStart] = useState(false);
  const [tab, setTab] = useState<Tab>('play');
  const [studentsUnlocked, setStudentsUnlocked] = useState(false);

  const handleStart = (stake: string, buyIn: number, location?: string, startTime?: string, studentId?: string) => {
    startSession(stake, buyIn, location, startTime, studentId);
    setShowStart(false);
  };

  const handleTabChange = (t: Tab) => {
    if (t !== 'students') setStudentsUnlocked(false);
    setTab(t);
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
        {(['play', 'stats', 'history', 'students'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {TAB_LABELS[t]}
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
                onAddHand={(amount, note, history) => addHand(activeSession.id, amount, note, history)}
                onDeleteHand={handId => deleteHand(activeSession.id, handId)}
                onEnd={(finalStack) => endSession(activeSession.id, finalStack)}
                onUpdateStartTime={t => updateStartTime(activeSession.id, t)}
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

        {tab === 'students' && (
          studentsUnlocked
            ? <StudentsTab
                students={students}
                sessions={sessions}
                onAddStudent={addStudent}
                onDeleteStudent={deleteStudent}
              />
            : <StudentsPasswordGate onUnlocked={() => setStudentsUnlocked(true)} />
        )}
      </main>

      {showStart && <StartSessionModal onStart={handleStart} students={students} />}
    </div>
  );
}

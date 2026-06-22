import { useState } from 'react';

interface Props {
  onClearSessions: () => void;
  onClearStudents: () => void;
  onClearAll: () => void;
}

export function SettingsTab({ onClearSessions, onClearStudents, onClearAll }: Props) {
  const [confirm, setConfirm] = useState<'sessions' | 'students' | 'all' | null>(null);

  const LABELS = {
    sessions: 'セッション・ハンド履歴',
    students: '生徒データ',
    all: '全データ',
  };

  const ACTIONS = {
    sessions: onClearSessions,
    students: onClearStudents,
    all: onClearAll,
  };

  const handleConfirm = () => {
    if (!confirm) return;
    ACTIONS[confirm]();
    setConfirm(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-slate-300">設定</h2>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <p className="px-4 py-3 text-xs text-slate-500 border-b border-slate-700">データ管理</p>

        <button onClick={() => setConfirm('sessions')}
          className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-slate-700/50 transition-colors border-b border-slate-700">
          <span className="text-sm text-slate-200">セッション・ハンド履歴を削除</span>
          <span className="text-xs text-red-400">削除</span>
        </button>

        <button onClick={() => setConfirm('students')}
          className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-slate-700/50 transition-colors border-b border-slate-700">
          <span className="text-sm text-slate-200">生徒データを削除</span>
          <span className="text-xs text-red-400">削除</span>
        </button>

        <button onClick={() => setConfirm('all')}
          className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
          <span className="text-sm text-red-400 font-semibold">全データを削除</span>
          <span className="text-xs text-red-400">削除</span>
        </button>
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-600 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">本当に削除しますか？</h3>
            <p className="text-sm text-slate-400 mb-6">
              <span className="text-red-400 font-semibold">「{LABELS[confirm]}」</span>を削除します。
              この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold transition-colors">
                キャンセル
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

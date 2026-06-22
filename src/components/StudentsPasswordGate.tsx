import { useState } from 'react';
import { loadStudentPassword, saveStudentPassword, clearStudentPassword } from '../store/storage';

interface Props {
  onUnlocked: () => void;
}

export function StudentsPasswordGate({ onUnlocked }: Props) {
  const storedPw = loadStudentPassword();
  const hasPassword = storedPw !== null;

  const [input,      setInput]      = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [error,      setError]      = useState('');
  const [showChange, setShowChange] = useState(false);

  const handleUnlock = () => {
    if (input === storedPw) {
      setError('');
      onUnlocked();
    } else {
      setError('パスワードが違います');
      setInput('');
    }
  };

  const handleSetPassword = () => {
    if (!newPw) { setError('パスワードを入力してください'); return; }
    if (newPw !== confirmPw) { setError('パスワードが一致しません'); return; }
    saveStudentPassword(newPw);
    onUnlocked();
  };

  const handleRemovePassword = () => {
    if (input !== storedPw) { setError('現在のパスワードが違います'); return; }
    clearStudentPassword();
    onUnlocked();
  };

  // No password set yet — prompt to set one or skip
  if (!hasPassword) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 max-w-xs mx-auto">
        <div className="text-4xl">🔒</div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">生徒情報を保護する</p>
          <p className="text-sm text-slate-400">パスワードを設定するとこの画面に鍵がかかります</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="新しいパスワード"
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            autoFocus
          />
          <input
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
            placeholder="パスワードを確認"
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button onClick={handleSetPassword}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">
            パスワードを設定してアクセス
          </button>
          <button onClick={onUnlocked}
            className="text-xs text-slate-500 hover:text-slate-400 text-center transition-colors">
            パスワードなしでアクセス
          </button>
        </div>
      </div>
    );
  }

  // Has password — show unlock form
  if (showChange) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 max-w-xs mx-auto">
        <div className="text-4xl">🔑</div>
        <p className="text-white font-semibold">パスワードを削除</p>
        <div className="w-full flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRemovePassword()}
            placeholder="現在のパスワード"
            autoFocus
            className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button onClick={handleRemovePassword}
            className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors">
            パスワードを削除
          </button>
          <button onClick={() => { setShowChange(false); setError(''); setInput(''); }}
            className="text-xs text-slate-500 hover:text-slate-400 text-center transition-colors">
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 max-w-xs mx-auto">
      <div className="text-4xl">🔒</div>
      <div className="text-center">
        <p className="text-white font-semibold mb-1">生徒情報</p>
        <p className="text-sm text-slate-400">パスワードを入力してください</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          placeholder="パスワード"
          autoFocus
          className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button onClick={handleUnlock}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">
          ロック解除
        </button>
        <button onClick={() => { setShowChange(true); setError(''); setInput(''); }}
          className="text-xs text-slate-500 hover:text-slate-400 text-center transition-colors">
          パスワードを削除する
        </button>
      </div>
    </div>
  );
}

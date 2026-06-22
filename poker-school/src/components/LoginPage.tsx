import { useState } from 'react';
import { login } from '../store';
import type { SchoolUser } from '../types';

interface Props {
  onLogin: (user: SchoolUser) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(name, password);
    if (user) {
      onLogin(user);
    } else {
      setError('名前またはパスワードが正しくありません');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">♠</span>
          <h1 className="text-2xl font-bold text-white mt-3">ポーカースクール</h1>
          <p className="text-slate-400 text-sm mt-1">成績管理システム</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] rounded-2xl p-6 flex flex-col gap-4 border border-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="名前を入力"
              className="bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            ログイン
          </button>
        </form>

        <p className="text-slate-600 text-xs text-center mt-4">
          デモ：先生 / teacher123 ｜ 田中 太郎 / student123
        </p>
      </div>
    </div>
  );
}

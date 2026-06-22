import { useState, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import {
  getSessionUser, clearSession, getUsers, getScores,
  addScore, updateScore, deleteScore, addStudent, deleteStudent,
} from './store';
import type { SchoolUser, StudentScore } from './types';
import './index.css';

function useSchoolData() {
  const [user, setUser] = useState<SchoolUser | null>(getSessionUser);
  const [users, setUsers] = useState(() => getUsers());
  const [scores, setScores] = useState<StudentScore[]>(getScores);

  const refresh = useCallback(() => {
    setUsers(getUsers());
    setScores(getScores());
  }, []);

  return {
    user, setUser, users, scores,
    handleAddScore: useCallback((studentId: string, date: string, bustOuts: number, points: number, notes?: string) => {
      addScore(studentId, date, bustOuts, points, notes); refresh();
    }, [refresh]),
    handleUpdateScore: useCallback((id: string, date: string, bustOuts: number, points: number, notes?: string) => {
      updateScore(id, date, bustOuts, points, notes); refresh();
    }, [refresh]),
    handleDeleteScore: useCallback((id: string) => { deleteScore(id); refresh(); }, [refresh]),
    handleAddStudent: useCallback((name: string, password: string) => { addStudent(name, password); refresh(); }, [refresh]),
    handleDeleteStudent: useCallback((id: string) => { deleteStudent(id); refresh(); }, [refresh]),
  };
}

export default function App() {
  const {
    user, setUser, users, scores,
    handleAddScore, handleUpdateScore, handleDeleteScore, handleAddStudent, handleDeleteStudent,
  } = useSchoolData();

  const students = users.filter(u => u.role === 'student');

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <header className="sticky top-0 z-40 bg-[#0f1117]/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">♠</span>
          <h1 className="text-base font-bold text-white">ポーカースクール</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {user.name}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${user.role === 'teacher' ? 'bg-amber-900/60 text-amber-400' : 'bg-blue-900/60 text-blue-400'}`}>
              {user.role === 'teacher' ? '先生' : '生徒'}
            </span>
          </span>
          <button
            onClick={() => { clearSession(); setUser(null); }}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {user.role === 'teacher' ? (
          <TeacherView
            students={students}
            scores={scores}
            onAddScore={handleAddScore}
            onUpdateScore={handleUpdateScore}
            onDeleteScore={handleDeleteScore}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        ) : (
          <StudentView user={user} scores={scores} />
        )}
      </main>
    </div>
  );
}

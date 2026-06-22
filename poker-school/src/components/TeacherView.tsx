import { useState, useMemo } from 'react';
import { ScoreChart } from './ScoreChart';
import { ScoreForm } from './ScoreForm';
import type { SchoolUser, StudentScore } from '../types';

interface Props {
  students: SchoolUser[];
  scores: StudentScore[];
  onAddScore: (studentId: string, date: string, bustOuts: number, points: number, notes?: string) => void;
  onUpdateScore: (id: string, date: string, bustOuts: number, points: number, notes?: string) => void;
  onDeleteScore: (id: string) => void;
  onAddStudent: (name: string, password: string) => void;
  onDeleteStudent: (id: string) => void;
}

export function TeacherView({ students, scores, onAddScore, onUpdateScore, onDeleteScore, onAddStudent, onDeleteStudent }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(students[0]?.id ?? null);
  const [showAddScore, setShowAddScore] = useState(false);
  const [editScore, setEditScore] = useState<StudentScore | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentScores = useMemo(
    () => (selectedStudentId ? scores.filter(s => s.studentId === selectedStudentId) : []),
    [scores, selectedStudentId]
  );
  const sortedScores = [...studentScores].sort((a, b) => b.date.localeCompare(a.date));

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && newStudentPass.trim()) {
      onAddStudent(newStudentName.trim(), newStudentPass.trim());
      setNewStudentName('');
      setNewStudentPass('');
      setShowAddStudent(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Student selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">生徒一覧</h2>
          <button
            onClick={() => setShowAddStudent(v => !v)}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            + 生徒追加
          </button>
        </div>

        {showAddStudent && (
          <form onSubmit={handleAddStudent} className="bg-[#1a1d27] rounded-xl p-3 border border-slate-700 flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="名前"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm flex-1 min-w-28 focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="text"
              placeholder="パスワード"
              value={newStudentPass}
              onChange={e => setNewStudentPass(e.target.value)}
              className="bg-[#0f1117] border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm flex-1 min-w-28 focus:outline-none focus:border-emerald-500"
              required
            />
            <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">追加</button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {students.map(s => {
            const sScores = scores.filter(x => x.studentId === s.id);
            const total = sScores.reduce((acc, x) => acc + x.points, 0);
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedStudentId(s.id); setShowAddScore(false); setEditScore(null); }}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedStudentId === s.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#1a1d27] text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {s.name}
                <span className={`text-xs ${total >= 0 ? 'text-emerald-300' : 'text-red-300'} ${selectedStudentId === s.id ? '' : ''}`}>
                  {total > 0 ? '+' : ''}{total}pt
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Chart */}
          <div className="bg-[#1a1d27] rounded-xl p-4 border border-slate-800">
            <ScoreChart scores={studentScores} studentName={selectedStudent.name} />
          </div>

          {/* Score list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300">{selectedStudent.name} の成績</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddScore(v => !v); setEditScore(null); }}
                  className="text-xs px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  + 成績追加
                </button>
                <button
                  onClick={() => { if (confirm(`${selectedStudent.name} を削除しますか？`)) onDeleteStudent(selectedStudent.id); }}
                  className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded-lg transition-colors"
                >
                  生徒削除
                </button>
              </div>
            </div>

            {showAddScore && (
              <ScoreForm
                studentId={selectedStudent.id}
                onSave={(date, bustOuts, points, notes) => {
                  onAddScore(selectedStudent.id, date, bustOuts, points, notes);
                  setShowAddScore(false);
                }}
                onCancel={() => setShowAddScore(false)}
              />
            )}

            {sortedScores.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">成績が記録されていません</p>
            ) : (
              sortedScores.map(s => (
                editScore?.id === s.id ? (
                  <ScoreForm
                    key={s.id}
                    studentId={selectedStudent.id}
                    editTarget={s}
                    onSave={(date, bustOuts, points, notes) => {
                      onUpdateScore(s.id, date, bustOuts, points, notes);
                      setEditScore(null);
                    }}
                    onCancel={() => setEditScore(null)}
                  />
                ) : (
                  <div key={s.id} className="bg-[#1a1d27] rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{s.date}</p>
                      {s.notes && <p className="text-xs text-slate-500 mt-0.5">{s.notes}</p>}
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">アウト数</p>
                        <p className="text-sm font-semibold text-red-400">{s.bustOuts}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">ポイント</p>
                        <p className={`text-sm font-semibold ${s.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {s.points > 0 ? '+' : ''}{s.points}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditScore(s)} className="text-slate-500 hover:text-white text-xs px-1.5 py-1 rounded transition-colors">編集</button>
                        <button onClick={() => onDeleteScore(s.id)} className="text-slate-500 hover:text-red-400 text-xs px-1.5 py-1 rounded transition-colors">削除</button>
                      </div>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </>
      )}

      {students.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">生徒が登録されていません</p>
      )}
    </div>
  );
}

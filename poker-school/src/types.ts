export type Role = 'teacher' | 'student';

export interface SchoolUser {
  id: string;
  name: string;
  role: Role;
  password: string;
}

export interface StudentScore {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  bustOuts: number; // アウト数
  points: number; // 獲得ポイント
  balance: number; // 収支（円）
  notes?: string;
}

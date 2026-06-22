import type { Session, Student } from '../types';

const KEY = 'poker_sessions';
const STUDENTS_KEY = 'poker_students';

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    return sessions.map((s: Session) => ({
      ...s,
      currentStack: s.currentStack ?? s.buyIn + s.hands.reduce((acc: number, h: { amount: number }) => acc + h.amount, 0),
    }));
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

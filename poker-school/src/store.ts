import { v4 as uuidv4 } from 'uuid';
import type { SchoolUser, StudentScore } from './types';

const USERS_KEY = 'school_users';
const SCORES_KEY = 'school_scores';
const SESSION_KEY = 'school_session';

const DEFAULT_USERS: SchoolUser[] = [
  { id: 'teacher-1', name: '先生', role: 'teacher', password: 'teacher123' },
  { id: 'student-1', name: '田中 太郎', role: 'student', password: 'student123' },
  { id: 'student-2', name: '佐藤 花子', role: 'student', password: 'student123' },
  { id: 'student-3', name: '鈴木 一郎', role: 'student', password: 'student123' },
];

export function getUsers(): SchoolUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(raw);
}

export function saveUsers(users: SchoolUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addStudent(name: string, password: string): SchoolUser {
  const users = getUsers();
  const newUser: SchoolUser = { id: uuidv4(), name, role: 'student', password };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function deleteStudent(id: string): void {
  saveUsers(getUsers().filter(u => u.id !== id));
  saveScores(getScores().filter(s => s.studentId !== id));
}

export function getScores(): StudentScore[] {
  const raw = localStorage.getItem(SCORES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveScores(scores: StudentScore[]): void {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function addScore(studentId: string, date: string, bustOuts: number, points: number, balance: number, notes?: string): StudentScore {
  const scores = getScores();
  const entry: StudentScore = { id: uuidv4(), studentId, date, bustOuts, points, balance, notes };
  scores.push(entry);
  saveScores(scores);
  return entry;
}

export function updateScore(id: string, date: string, bustOuts: number, points: number, balance: number, notes?: string): void {
  saveScores(getScores().map(s => s.id === id ? { ...s, date, bustOuts, points, balance, notes } : s));
}

export function deleteScore(id: string): void {
  saveScores(getScores().filter(s => s.id !== id));
}

export function getSessionUser(): SchoolUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSessionUser(user: SchoolUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function login(name: string, password: string): SchoolUser | null {
  const user = getUsers().find(u => u.name === name && u.password === password);
  if (user) { setSessionUser(user); return user; }
  return null;
}

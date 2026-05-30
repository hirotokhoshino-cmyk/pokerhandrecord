import type { Session } from '../types';

const KEY = 'poker_sessions';

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

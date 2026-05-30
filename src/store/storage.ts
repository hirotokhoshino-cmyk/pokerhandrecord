import type { Session } from '../types';

const KEY = 'poker_sessions';

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    // migrate: add currentStack if missing
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

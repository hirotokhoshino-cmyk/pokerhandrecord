import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { loadSessions, saveSessions } from '../store/storage';
import type { Session, HandEntry } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  const persist = useCallback((updated: Session[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const startSession = useCallback((stake: string, buyIn: number, location?: string) => {
    const now = new Date().toISOString();
    const session: Session = {
      id: uuid(),
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: now,
      stake,
      location,
      buyIn,
      hands: [],
    };
    persist([...sessions, session]);
    return session.id;
  }, [sessions, persist]);

  const endSession = useCallback((sessionId: string) => {
    persist(sessions.map(s =>
      s.id === sessionId ? { ...s, endTime: new Date().toISOString() } : s
    ));
  }, [sessions, persist]);

  const addHand = useCallback((sessionId: string, amount: number, note?: string) => {
    const hand: HandEntry = {
      id: uuid(),
      sessionId,
      timestamp: new Date().toISOString(),
      amount,
      note,
    };
    persist(sessions.map(s =>
      s.id === sessionId ? { ...s, hands: [...s.hands, hand] } : s
    ));
  }, [sessions, persist]);

  const deleteHand = useCallback((sessionId: string, handId: string) => {
    persist(sessions.map(s =>
      s.id === sessionId
        ? { ...s, hands: s.hands.filter(h => h.id !== handId) }
        : s
    ));
  }, [sessions, persist]);

  const deleteSession = useCallback((sessionId: string) => {
    persist(sessions.filter(s => s.id !== sessionId));
  }, [sessions, persist]);

  const activeSession = sessions.find(s => !s.endTime) ?? null;

  return {
    sessions,
    activeSession,
    startSession,
    endSession,
    addHand,
    deleteHand,
    deleteSession,
  };
}

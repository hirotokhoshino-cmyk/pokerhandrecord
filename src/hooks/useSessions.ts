import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { loadSessions, saveSessions } from '../store/storage';
import type { Session, HandEntry, HandHistory } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  const persist = useCallback((updated: Session[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const startSession = useCallback((stake: string, buyIn: number, location?: string, startTime?: string, studentId?: string) => {
    const now = startTime ?? new Date().toISOString();
    const session: Session = {
      id: uuid(),
      date: format(new Date(now), 'yyyy-MM-dd'),
      startTime: now,
      stake,
      location,
      buyIn,
      currentStack: buyIn,
      hands: [],
      studentId,
    };
    persist([...sessions, session]);
    return session.id;
  }, [sessions, persist]);

  const endSession = useCallback((sessionId: string, finalStack?: number) => {
    persist(sessions.map(s =>
      s.id === sessionId
        ? { ...s, endTime: new Date().toISOString(), ...(finalStack !== undefined ? { finalStack } : {}) }
        : s
    ));
  }, [sessions, persist]);

  const addHand = useCallback((sessionId: string, amount: number, note?: string, history?: HandHistory) => {
    const hand: HandEntry = {
      id: uuid(),
      sessionId,
      timestamp: new Date().toISOString(),
      amount,
      note,
      history,
    };
    persist(sessions.map(s =>
      s.id === sessionId
        ? { ...s, hands: [...s.hands, hand], currentStack: s.currentStack + amount }
        : s
    ));
  }, [sessions, persist]);

  const deleteHand = useCallback((sessionId: string, handId: string) => {
    persist(sessions.map(s => {
      if (s.id !== sessionId) return s;
      const hand = s.hands.find(h => h.id === handId);
      const delta = hand ? hand.amount : 0;
      return {
        ...s,
        hands: s.hands.filter(h => h.id !== handId),
        currentStack: s.currentStack - delta,
      };
    }));
  }, [sessions, persist]);

  const deleteSession = useCallback((sessionId: string) => {
    persist(sessions.filter(s => s.id !== sessionId));
  }, [sessions, persist]);

  const updateStartTime = useCallback((sessionId: string, newStartTime: string) => {
    persist(sessions.map(s =>
      s.id === sessionId ? { ...s, startTime: newStartTime } : s
    ));
  }, [sessions, persist]);

  const activeSession = sessions.find(s => !s.endTime) ?? null;

  return {
    sessions,
    setSessions,
    activeSession,
    startSession,
    endSession,
    addHand,
    deleteHand,
    deleteSession,
    updateStartTime,
  };
}

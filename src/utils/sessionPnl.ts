import type { Session } from '../types';

export function sessionPnl(session: Session): number {
  if (session.finalStack !== undefined) return session.finalStack - session.buyIn;
  return session.hands.reduce((acc, h) => acc + h.amount, 0);
}

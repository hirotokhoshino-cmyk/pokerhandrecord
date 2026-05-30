export interface HandEntry {
  id: string;
  sessionId: string;
  timestamp: string; // ISO
  amount: number;    // positive = win, negative = loss
  note?: string;
}

export interface Session {
  id: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // ISO
  endTime?: string;      // ISO
  stake: string;         // e.g. "1/2", "2/5"
  location?: string;
  buyIn: number;
  hands: HandEntry[];
}

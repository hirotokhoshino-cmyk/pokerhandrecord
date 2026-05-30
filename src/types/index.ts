export interface StreetAction {
  action: string; // free text per street
}

export interface HandHistory {
  heroPosition: string;
  heroCards: string;        // e.g. "Ah Ks"
  preflopAction: string;
  flopCards?: string;       // e.g. "As 7h 2c"
  flopAction?: string;
  turnCard?: string;
  turnAction?: string;
  riverCard?: string;
  riverAction?: string;
  potSize?: number;
  villains?: string;        // brief villain description
  result?: string;          // e.g. "showdown win", "bluff success"
}

export interface HandEntry {
  id: string;
  sessionId: string;
  timestamp: string; // ISO
  amount: number;    // positive = win, negative = loss
  note?: string;
  history?: HandHistory;
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

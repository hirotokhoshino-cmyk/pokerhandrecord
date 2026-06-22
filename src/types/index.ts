export interface Student {
  id: string;
  name: string;
  createdAt: string;
}

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface StreetAction {
  position: string;
  action: ActionType;
  amountBB?: number;
}

export interface HandHistory {
  heroPosition: string;
  heroCards: string;
  bbSize: number;
  effectiveStack: number; // BB
  preflopActions: StreetAction[];
  flopCards?: string;
  flopActions?: StreetAction[];
  turnCard?: string;
  turnActions?: StreetAction[];
  riverCard?: string;
  riverActions?: StreetAction[];
  result?: string;
}

export interface HandEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  amount: number;
  note?: string;
  history?: HandHistory;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  stake: string;
  location?: string;
  buyIn: number;
  currentStack: number; // tracks running stack in $
  hands: HandEntry[];
  studentId?: string;
}


export type CommitLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  level: CommitLevel;
  weekIndex: number;
  dayIndex: number;
}

export interface GridState {
  [date: string]: CommitLevel;
}

// Added AIPatternResponse interface to support Gemini pattern generation
export interface AIPatternResponse {
  patternName: string;
  points: {
    x: number;
    y: number;
    level: number;
  }[];
}

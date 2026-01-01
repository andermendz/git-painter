
import { CommitLevel } from './types';

export const LEVEL_COLORS: Record<CommitLevel, string> = {
  0: 'bg-[var(--grid-empty)]',
  1: 'bg-[var(--grid-lvl1)]',
  2: 'bg-[var(--grid-lvl2)]',
  3: 'bg-[var(--grid-lvl3)]',
  4: 'bg-[var(--grid-lvl4)]',
};

export const LEVEL_HOVER_COLORS: Record<CommitLevel, string> = {
  0: 'hover:opacity-80',
  1: 'hover:opacity-80',
  2: 'hover:opacity-80',
  3: 'hover:opacity-80',
  4: 'hover:opacity-80',
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const GRID_DAYS = 7;

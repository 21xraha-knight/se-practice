import { canBook } from './booking';
import type { Interval } from './booking';

export type EvaluateInput = {
  now: string; // "HH:MM" from <input type="time">
  start: string;
  end: string; // ignored when endOfDay is true
  endOfDay: boolean; // "Ends at 24:00"
  blocked: boolean;
  bookings: Interval[];
};

// error: message to show ('' = none). result: true = Available, false = Unavailable, null = no decision.
export type EvaluateOutput = { error: string; result: boolean | null };

export const toMinutes = (value: string): number => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export function evaluateRequest({ now, start, end, endOfDay, blocked, bookings }: EvaluateInput): EvaluateOutput {
  if (!start || !now || (!end && !endOfDay)) {
    return { error: 'Fill in the current time, the start and the end.', result: null };
  }
  const s = toMinutes(start);
  const e = endOfDay ? 1440 : toMinutes(end);
  const n = toMinutes(now);
  const error = s < e ? '' : 'The end time must be after the start time.';
  return { error, result: canBook({ start: s, end: e, now: n, blocked, bookings }) };
}

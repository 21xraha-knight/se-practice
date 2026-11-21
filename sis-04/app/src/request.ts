import { checkRoom } from './booking';
import type { Room } from './rooms';
import { toMinutes } from './time';

export type TimeInputs = { now: string; start: string; end: string; endOfDay: boolean };

// error: the message to show ('' = none). result: true = Available, false = Unavailable, null = no decision.
export type Outcome = { error: string; result: boolean | null };

// Pure: turns the form values into minutes, builds the validation message and asks checkRoom.
export function evaluateRequest(rooms: Room[], roomId: string, input: TimeInputs): Outcome {
  if (!rooms.some(r => r.id === roomId)) return { error: 'Select a room first.', result: null };
  if (!input.start || !input.now || (!input.end && !input.endOfDay)) {
    return { error: 'Fill in the current time, the start and the end.', result: null };
  }
  const start = toMinutes(input.start);
  const end = input.endOfDay ? 1440 : toMinutes(input.end);
  const now = toMinutes(input.now);
  if (!(start < end)) return { error: 'The end time must be after the start time.', result: null };
  return { error: '', result: checkRoom(rooms, roomId, { start, end, now }) };
}

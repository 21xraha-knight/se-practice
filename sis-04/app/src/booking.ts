import type { Room } from './rooms';

export type Interval = { start: number; end: number };

export type BookingRequest = {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Interval[];
};

// Minutes after midnight on one day: 600 = 10:00, 1440 = 24:00.
// true = Available, false = Unavailable.
export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start < b.end && end > b.start) return false;
  }
  return true;
}

// F3 and F5: the answer for the chosen room uses THAT room's own blocked flag and bookings.
// An unknown id is not available. Nothing is changed.
export function checkRoom(
  rooms: Room[],
  roomId: string,
  request: { start: number; end: number; now: number },
): boolean {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return false;
  return canBook({
    start: request.start,
    end: request.end,
    now: request.now,
    blocked: room.blocked,
    bookings: room.bookings,
  });
}

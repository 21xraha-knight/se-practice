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
export function canBook({ start, end, now, blocked, bookings }: BookingRequest): boolean {
  let ok = true;
  if (!(0 <= start && start < end && end <= 1440)) ok = false;
  else if (!(start > now)) ok = false;
  else if (end - start > 120) ok = false;
  else if (blocked) ok = false;
  else {
    for (const b of bookings) {
      if (start < b.end && end > b.start) {
        ok = false;
        break;
      }
    }
  }
  return ok;
}

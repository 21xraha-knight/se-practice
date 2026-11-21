import { describe, it, expect } from 'vitest';
import { canBook, type BookingRequest, type Interval } from './booking';

// "Fixed time": canBook takes `now` as an input and never reads the clock,
// so the fixed time is the fixture value now = 540 (09:00). No fake timers needed.

// Fresh fixture on every call; nothing is shared between tests.
function makeRequest(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    start: 0,
    end: 0,
    now: 540,
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
    ...overrides,
  };
}

type Row = {
  id: string;
  ac: string;
  desc: string;
  start: number;
  end: number;
  expected: boolean;
  overrides?: Partial<BookingRequest>;
};

const rows: Row[] = [
  { id: 'T01', ac: 'AC4', desc: 'touching after', start: 660, end: 720, expected: true },
  { id: 'T02', ac: 'AC1', desc: 'starts now', start: 540, end: 570, expected: false },
  { id: 'T03', ac: 'AC1', desc: 'zero duration', start: 720, end: 720, expected: false },
  { id: 'T04', ac: 'AC1', desc: 'reversed', start: 750, end: 720, expected: false },
  { id: 'T05', ac: 'AC1', desc: 'past day end', start: 1380, end: 1441, expected: false },
  { id: 'T06', ac: 'AC2', desc: '120 minutes', start: 720, end: 840, expected: true },
  { id: 'T07', ac: 'AC2', desc: '121 minutes', start: 720, end: 841, expected: false },
  { id: 'T08', ac: 'AC4', desc: 'touching before', start: 570, end: 600, expected: true },
  { id: 'T09', ac: 'AC4', desc: 'partial overlap', start: 630, end: 690, expected: false },
  { id: 'T10', ac: 'AC4', desc: 'contains booking', start: 570, end: 690, expected: false },
  { id: 'T11', ac: 'AC4', desc: 'inside booking', start: 615, end: 645, expected: false },
  { id: 'T12', ac: 'AC4', desc: 'identical interval', start: 600, end: 660, expected: false },
  { id: 'T13', ac: 'AC3', desc: 'blocked room', start: 660, end: 720, expected: false, overrides: { blocked: true } },
  { id: 'T14', ac: 'AC4', desc: 'no bookings, would overlap default', start: 630, end: 690, expected: true, overrides: { bookings: [] } },
  { id: 'X1', ac: 'AC1', desc: 'ends exactly at 24:00 (120 min)', start: 1320, end: 1440, expected: true },
  {
    id: 'X2',
    ac: 'AC4',
    desc: 'touches two bookings',
    start: 660,
    end: 720,
    expected: true,
    overrides: {
      bookings: [
        { start: 600, end: 660 },
        { start: 720, end: 780 },
      ],
    },
  },
];

describe('canBook: reviewed case table', () => {
  it.each(rows)('$id [$ac] $desc -> $expected', ({ start, end, expected, overrides }) => {
    const req = makeRequest({ start, end, ...overrides });
    const before: Interval[] = structuredClone(req.bookings);
    const bookingsRef = req.bookings;
    const itemRefs = [...req.bookings];

    const result = canBook(req);

    // exact decision (strict boolean, not truthy/falsy)
    expect(result).toBe(expected);

    // booking data untouched: same array, same objects, same values, same length
    expect(req.bookings).toBe(bookingsRef);
    expect(req.bookings).toEqual(before);
    req.bookings.forEach((b, i) => expect(b).toBe(itemRefs[i]));
  });
});

describe('AC5: decision without changing booking data', () => {
  it('AC5: Available request 720-780 returns true and leaves bookings equal to before', () => {
    const req = makeRequest({ start: 720, end: 780 });
    const before = structuredClone(req.bookings);

    const result = canBook(req);

    expect(result).toBe(true);
    expect(req.bookings).toEqual(before);
    expect(req.bookings).toHaveLength(1);
    expect(req.bookings[0]).toEqual({ start: 600, end: 660 });
  });

  it('AC5: calling twice with the same input gives the same decision (no hidden state)', () => {
    const req = makeRequest({ start: 720, end: 780 });
    expect(canBook(req)).toBe(true);
    expect(canBook(req)).toBe(true);
    expect(req.bookings).toEqual([{ start: 600, end: 660 }]);
  });

  it('AC5: an Unavailable decision also leaves bookings unchanged', () => {
    const req = makeRequest({ start: 630, end: 690 });
    const before = structuredClone(req.bookings);

    expect(canBook(req)).toBe(false);
    expect(req.bookings).toEqual(before);
  });
});

describe('fixture hygiene', () => {
  it('makeRequest returns independent data each call', () => {
    const a = makeRequest();
    const b = makeRequest();
    a.bookings.push({ start: 0, end: 1 });
    expect(b.bookings).toEqual([{ start: 600, end: 660 }]);
    expect(makeRequest().bookings).toEqual([{ start: 600, end: 660 }]);
  });
});

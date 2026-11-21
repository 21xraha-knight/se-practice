import { describe, test, expect } from 'vitest';
import { canBook } from './booking';

// Fixed time: `now` is the number 540 (09:00) in every test; nothing here reads a clock.
// Default fixture: now 540, not blocked, one booking 10:00-11:00. A fresh copy per call.
function fixture(overrides: { now?: number; blocked?: boolean; bookings?: { start: number; end: number }[] } = {}) {
  return {
    now: 540,
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
    ...overrides,
  };
}

function ask(start: number, end: number, overrides: Parameters<typeof fixture>[0] = {}) {
  return canBook({ start, end, ...fixture(overrides) });
}

describe('AC1 valid time', () => {
  test('T02 AC1: a request that starts exactly now (540-570) is Unavailable', () => {
    expect(ask(540, 570)).toBe(false);
  });
  test('T03 AC1: zero duration (720-720) is Unavailable', () => {
    expect(ask(720, 720)).toBe(false);
  });
  test('T04 AC1: reversed interval (750-720) is Unavailable', () => {
    expect(ask(750, 720)).toBe(false);
  });
  test('T05 AC1: an end past the day (1380-1441) is Unavailable', () => {
    expect(ask(1380, 1441)).toBe(false);
  });
  test('R01 AC1: a request that starts one minute after now (now 719, 720-780) is Available', () => {
    expect(canBook({ start: 720, end: 780, ...fixture({ now: 719 }) })).toBe(true);
  });
  test('R02 AC1: the same request is Unavailable when now is 720 (the supplied now decides, not a fixed 540)', () => {
    expect(canBook({ start: 720, end: 780, ...fixture({ now: 720 }) })).toBe(false);
  });
  test('X1 AC1: ending exactly at 24:00 (1320-1440, 120 minutes) is Available', () => {
    expect(ask(1320, 1440)).toBe(true);
  });
});

describe('AC2 maximum duration', () => {
  test('T06 AC2: exactly 120 minutes (720-840) is Available', () => {
    expect(ask(720, 840)).toBe(true);
  });
  test('T07 AC2: 121 minutes (720-841) is Unavailable', () => {
    expect(ask(720, 841)).toBe(false);
  });
});

describe('AC3 blocked room', () => {
  test('T13 AC3: a blocked room is Unavailable even for a touching request (660-720)', () => {
    expect(ask(660, 720, { blocked: true })).toBe(false);
  });
});

describe('AC4 overlaps and touching', () => {
  test('T01 AC4: touching after the booking (660-720) is Available', () => {
    expect(ask(660, 720)).toBe(true);
  });
  test('T08 AC4: touching before the booking (570-600) is Available', () => {
    expect(ask(570, 600)).toBe(true);
  });
  test('T09 AC4: a partial overlap (630-690) is Unavailable', () => {
    expect(ask(630, 690)).toBe(false);
  });
  test('T10 AC4: a request that contains the booking (570-690) is Unavailable', () => {
    expect(ask(570, 690)).toBe(false);
  });
  test('T11 AC4: a request inside the booking (615-645) is Unavailable', () => {
    expect(ask(615, 645)).toBe(false);
  });
  test('T12 AC4: an identical interval (600-660) is Unavailable', () => {
    expect(ask(600, 660)).toBe(false);
  });
  test('T14 AC4: the same 630-690 request is Available when there are no bookings', () => {
    expect(ask(630, 690, { bookings: [] })).toBe(true);
  });
  test('R03 AC4: overlapping the booking by one minute at the back (659-720) is Unavailable', () => {
    expect(ask(659, 720)).toBe(false);
  });
  test('R04 AC4: with two bookings, overlapping only the second one (750-770) is Unavailable', () => {
    expect(ask(750, 770, { bookings: [{ start: 600, end: 660 }, { start: 720, end: 780 }] })).toBe(false);
  });
  test('X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available', () => {
    expect(ask(660, 720, { bookings: [{ start: 600, end: 660 }, { start: 720, end: 780 }] })).toBe(true);
  });
});

describe('AC5 data is not changed', () => {
  test('AC5: an Available request (720-780) leaves the bookings equal to a copy taken before', () => {
    const data = fixture();
    const before = JSON.stringify(data.bookings);
    const decision = canBook({ start: 720, end: 780, ...data });
    expect(decision).toBe(true);
    expect(JSON.stringify(data.bookings)).toBe(before);
    expect(data.bookings).toHaveLength(1);
  });

  test('R05 AC5: unsorted bookings are not reordered by the call', () => {
    const data = fixture({ bookings: [{ start: 720, end: 780 }, { start: 600, end: 660 }] });
    const before = JSON.stringify(data.bookings);
    expect(canBook({ start: 660, end: 720, ...data })).toBe(true);
    expect(JSON.stringify(data.bookings)).toBe(before);
  });
});

describe('Practice 08 regression tests', () => {
  test('BUG-A AC4: a request touching bookings on both sides (600-660 between 540-600 and 660-720) is Available', () => {
    expect(ask(600, 660, { bookings: [{ start: 540, end: 600 }, { start: 660, end: 720 }] })).toBe(true);
  });
  test('BUG-B AC5: an Available request that touches nothing (720-780) leaves the bookings equal to a copy', () => {
    const data = fixture();
    const before = JSON.stringify(data.bookings);
    expect(canBook({ start: 720, end: 780, ...data })).toBe(true);
    expect(JSON.stringify(data.bookings)).toBe(before);
  });
});

// R3 (Practice 10): the page's decision wiring - HH:MM parsing, the validation message and the call
// to canBook - lives inside check() in App.tsx, so no test can reach it. These tests describe the
// pure module that should hold it (src/availability.ts, evaluateRequest) and keep today's UI behaviour.
describe('R3 the page logic is testable', () => {
  const load = async () => (await import('./availability')).evaluateRequest;
  const bookings = () => [{ start: 600, end: 660 }];

  test('R3 AC1: reversed times (12:00 to 11:00) keep the validation message and Unavailable', async () => {
    const evaluateRequest = await load();
    expect(evaluateRequest({ now: '09:00', start: '12:00', end: '11:00', endOfDay: false, blocked: false, bookings: bookings() }))
      .toEqual({ error: 'The end time must be after the start time.', result: false });
  });
  test('R3 AC6: an empty start gives the fill-in message and no result', async () => {
    const evaluateRequest = await load();
    expect(evaluateRequest({ now: '09:00', start: '', end: '12:00', endOfDay: false, blocked: false, bookings: bookings() }))
      .toEqual({ error: 'Fill in the current time, the start and the end.', result: null });
  });
  test('R3 AC1: "Ends at 24:00" makes the end 1440 (23:00 to 24:00 is Available)', async () => {
    const evaluateRequest = await load();
    expect(evaluateRequest({ now: '09:00', start: '23:00', end: '', endOfDay: true, blocked: false, bookings: bookings() }))
      .toEqual({ error: '', result: true });
  });
  test('R3 AC5: a valid request is Available and the bookings are not changed', async () => {
    const evaluateRequest = await load();
    const data = bookings();
    const before = JSON.stringify(data);
    expect(evaluateRequest({ now: '09:00', start: '11:00', end: '12:00', endOfDay: false, blocked: false, bookings: data }))
      .toEqual({ error: '', result: true });
    expect(JSON.stringify(data)).toBe(before);
  });
});

import { describe, test, expect } from 'vitest';
import { canBook } from './booking';

// Fixed time: `now` is the number 540 (09:00) in every test; nothing here reads a clock.
// Default fixture: now 540, not blocked, one booking 10:00-11:00. A fresh copy per call.
function fixture(overrides: { blocked?: boolean; bookings?: { start: number; end: number }[] } = {}) {
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
});

import { describe, test, expect } from 'vitest';
import { checkRoom } from './booking';
import { filterRooms } from './filter';
import type { Room } from './rooms';

// Fixed catalog inside the test file. Times are minutes after midnight (600 = 10:00).
const catalog: Room[] = [
  { id: 'A', name: 'Alpha', capacity: 4, equipment: ['projector'], blocked: false, bookings: [{ start: 540, end: 600 }] },
  { id: 'B', name: 'Beta', capacity: 8, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'C', name: 'Gamma', capacity: 12, equipment: ['whiteboard'], blocked: true, bookings: [] },
  { id: 'D', name: 'Delta', capacity: 20, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [{ start: 660, end: 720 }] },
];
const req = { start: 540, end: 600, now: 480 };

describe('F3 blocked rooms', () => {
  test('F3 AC3: a blocked room is never Available, even with no bookings (room C)', () => {
    expect(checkRoom(catalog, 'C', req)).toBe(false);
  });
});

describe('F5 the chosen room decides', () => {
  test('F5: the same times give different results in two rooms because of their own bookings (A booked 540-600, B free)', () => {
    expect(checkRoom(catalog, 'A', req)).toBe(false);
    expect(checkRoom(catalog, 'B', req)).toBe(true);
  });
  test('F5: room D is free at 540-600 and A is booked then, so D\'s answer does not use A\'s booking', () => {
    expect(checkRoom(catalog, 'D', req)).toBe(true);
  });
  test('F5: a request that overlaps room D\'s own booking (660-720) is Unavailable in D but Available in B', () => {
    const own = { start: 660, end: 720, now: 480 };
    expect(checkRoom(catalog, 'D', own)).toBe(false);
    expect(checkRoom(catalog, 'B', own)).toBe(true);
  });
  test('F5: an unknown room id is not available', () => {
    expect(checkRoom(catalog, 'Z', req)).toBe(false);
  });
});

describe('AC5 checkRoom changes nothing', () => {
  test('AC5: an Available check leaves the catalog unchanged', () => {
    const before = JSON.stringify(catalog);
    expect(checkRoom(catalog, 'B', req)).toBe(true);
    expect(JSON.stringify(catalog)).toBe(before);
  });
});

describe('INT filter then check', () => {
  test('INT F1 F2 F3 F5: every room returned by filterRooms can be checked, and the blocked one stays Unavailable', () => {
    const shown = filterRooms(catalog, { attendees: 8, equipment: ['whiteboard'] });
    const results = shown.map(r => [r.id, checkRoom(catalog, r.id, req)]);
    expect(results).toEqual([['B', true], ['C', false], ['D', true]]);
  });
});

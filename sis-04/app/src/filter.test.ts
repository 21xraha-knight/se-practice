import { describe, test, expect } from 'vitest';
import { filterRooms } from './filter';
import type { Room } from './rooms';

// Fixed catalog inside the test file: a change to the demo data cannot change a result.
const catalog: Room[] = [
  { id: 'A', name: 'Alpha', capacity: 4, equipment: ['projector'], blocked: false, bookings: [] },
  { id: 'B', name: 'Beta', capacity: 8, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'C', name: 'Gamma', capacity: 12, equipment: ['whiteboard'], blocked: false, bookings: [] },
  { id: 'D', name: 'Delta', capacity: 20, equipment: ['projector', 'whiteboard', 'microphone'], blocked: true, bookings: [] },
];
const ids = (rooms: Room[]) => rooms.map(r => r.id);

describe('F1 capacity filter', () => {
  test('F1: only rooms with capacity >= attendees are returned (10 attendees -> C and D)', () => {
    expect(ids(filterRooms(catalog, { attendees: 10, equipment: [] }))).toEqual(['C', 'D']);
  });
  test('B5 F1: a room whose capacity is exactly equal to the attendees is included (8 -> B is in)', () => {
    expect(ids(filterRooms(catalog, { attendees: 8, equipment: [] }))).toContain('B');
  });
  test('B6 F1: a room one seat below the attendees is excluded (9 -> B is out)', () => {
    expect(ids(filterRooms(catalog, { attendees: 9, equipment: [] }))).not.toContain('B');
  });
});

describe('F2 equipment filter', () => {
  test('F2: a room must have ALL selected items (projector + whiteboard -> B and D, not A or C)', () => {
    expect(ids(filterRooms(catalog, { attendees: 1, equipment: ['projector', 'whiteboard'] }))).toEqual(['B', 'D']);
  });
  test('F2: a room with only a projector does not match projector + whiteboard', () => {
    expect(ids(filterRooms(catalog, { attendees: 1, equipment: ['projector', 'whiteboard'] }))).not.toContain('A');
  });
  test('F2: no selected equipment means no equipment constraint', () => {
    expect(ids(filterRooms(catalog, { attendees: 1, equipment: [] }))).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('F4 empty result', () => {
  test('F4: when no room matches, filterRooms returns an empty array (50 attendees)', () => {
    expect(filterRooms(catalog, { attendees: 50, equipment: [] })).toEqual([]);
  });
  test('F4: more attendees than the largest room (21 seats needed) leaves nothing', () => {
    expect(filterRooms(catalog, { attendees: 21, equipment: ['projector'] })).toEqual([]);
  });
});

describe('AC5 the catalog is not changed by filtering', () => {
  test('AC5: filterRooms does not mutate its input', () => {
    const before = JSON.stringify(catalog);
    filterRooms(catalog, { attendees: 8, equipment: ['projector'] });
    expect(JSON.stringify(catalog)).toBe(before);
  });
});

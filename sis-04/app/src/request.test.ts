import { describe, test, expect } from 'vitest';
import { evaluateRequest } from './request';
import type { Room } from './rooms';

// Fixed catalog inside the test file (minutes after midnight, 600 = 10:00).
const catalog: Room[] = [
  { id: 'A', name: 'Alpha', capacity: 10, equipment: ['projector'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'B', name: 'Beta', capacity: 10, equipment: ['whiteboard'], blocked: false, bookings: [] },
];
const base = { now: '09:00', start: '11:00', end: '12:00', endOfDay: false };

describe('AC6 feedback for invalid input', () => {
  test('AC1 AC6: reversed times (12:00 to 11:00) give only the validation message and no availability result', () => {
    expect(evaluateRequest(catalog, 'A', { ...base, start: '12:00', end: '11:00' }))
      .toEqual({ error: 'The end time must be after the start time.', result: null });
  });
  test('AC6: an empty start gives the fill-in message and no result', () => {
    expect(evaluateRequest(catalog, 'A', { ...base, start: '' }))
      .toEqual({ error: 'Fill in the current time, the start and the end.', result: null });
  });
  test('AC6 F5: no selected room gives "Select a room first." and no result', () => {
    expect(evaluateRequest(catalog, '', base)).toEqual({ error: 'Select a room first.', result: null });
  });
});

describe('request to decision', () => {
  test('AC1 B1: "Ends at 24:00" makes the end 1440, so 22:00 to 24:00 (120 minutes) is Available', () => {
    expect(evaluateRequest(catalog, 'A', { ...base, start: '22:00', end: '', endOfDay: true }))
      .toEqual({ error: '', result: true });
  });
  test('F5 INT: the same times are Available in room B and Unavailable in room A, which is booked 10:00-11:00 (10:30 to 11:30)', () => {
    const times = { ...base, start: '10:30', end: '11:30' };
    expect(evaluateRequest(catalog, 'A', times).result).toBe(false);
    expect(evaluateRequest(catalog, 'B', times).result).toBe(true);
  });
  test('B3 AC4 AC5: touching the booking (11:00 to 12:00 after 10:00-11:00) is Available and the bookings are unchanged', () => {
    const before = JSON.stringify(catalog);
    expect(evaluateRequest(catalog, 'A', base)).toEqual({ error: '', result: true });
    expect(JSON.stringify(catalog)).toBe(before);
  });
});

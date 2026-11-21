import type { Interval } from './booking';

// Data only. Fictional rooms. Times are minutes after midnight (600 = 10:00).
export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Interval[];
};

export const EQUIPMENT = ['projector', 'whiteboard', 'computers', 'microphone'];

export const ROOMS: Room[] = [
  { id: 'a101', name: 'A-101 Lecture Hall', capacity: 60, equipment: ['projector', 'whiteboard', 'microphone'], blocked: false, bookings: [{ start: 600, end: 660 }, { start: 780, end: 840 }] },
  { id: 'b204', name: 'B-204 Seminar Room', capacity: 24, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'c310', name: 'C-310 Computer Lab', capacity: 30, equipment: ['computers', 'projector'], blocked: false, bookings: [{ start: 660, end: 780 }] },
  { id: 'd012', name: 'D-012 Meeting Room', capacity: 8, equipment: ['whiteboard'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'e005', name: 'E-005 Workshop', capacity: 16, equipment: ['whiteboard', 'computers'], blocked: true, bookings: [] },
];

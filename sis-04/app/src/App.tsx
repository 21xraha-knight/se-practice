import { useState } from 'react';
import RoomFilter from './components/RoomFilter';
import RoomList from './components/RoomList';
import TimeForm from './components/TimeForm';
import ResultPanel from './components/ResultPanel';
import { filterRooms } from './filter';
import { evaluateRequest } from './request';
import type { Outcome, TimeInputs } from './request';
import { EQUIPMENT, ROOMS } from './rooms';

// The page only holds state and wires the parts together: no room data and no booking rule here.
export default function App() {
  const [attendees, setAttendees] = useState('1');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [roomId, setRoomId] = useState('');
  const [time, setTime] = useState<TimeInputs>({ now: '09:00', start: '11:00', end: '12:00', endOfDay: false });
  const [outcome, setOutcome] = useState<Outcome>({ error: '', result: null });

  const criteria = { attendees: Number(attendees) || 0, equipment };
  const shown = filterRooms(ROOMS, criteria);
  const room = shown.find(r => r.id === roomId);
  const emptyText = `No rooms match ${criteria.attendees} attendees with ${equipment.length ? equipment.join(' + ') : 'any equipment'}. Lower the number of attendees or untick some equipment.`;

  // F5: any change of the room, the filters or the times clears the old answer.
  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setOutcome({ error: '', result: null });
  };

  return (
    <main className="page">
      <h1>Smart Campus Room Availability</h1>
      <h2>1. Find a room</h2>
      <RoomFilter
        attendees={attendees}
        equipmentOptions={EQUIPMENT}
        selected={equipment}
        onAttendees={withReset(setAttendees)}
        onToggle={item => withReset(setEquipment)(equipment.includes(item) ? equipment.filter(i => i !== item) : [...equipment, item])}
      />
      <RoomList rooms={shown} selectedId={room ? room.id : ''} emptyText={emptyText} onSelect={withReset(setRoomId)} />
      <h2>2. Check a time</h2>
      <TimeForm value={time} onChange={withReset(setTime)} onCheck={() => setOutcome(evaluateRequest(ROOMS, room ? room.id : '', time))} />
      <ResultPanel room={room} error={outcome.error} result={outcome.result} />
    </main>
  );
}

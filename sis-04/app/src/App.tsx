import { useState } from 'react';
import { checkRoom } from './booking';
import { filterRooms } from './filter';
import { EQUIPMENT, ROOMS } from './rooms';

type Interval = { start: number; end: number };

const toMinutes = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export default function App() {
  const [attendees, setAttendees] = useState('1');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [roomId, setRoomId] = useState('');
  const [now, setNow] = useState('09:00');
  const [start, setStart] = useState('11:00');
  const [end, setEnd] = useState('12:00');
  const [endOfDay, setEndOfDay] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const shown = filterRooms(ROOMS, { attendees: Number(attendees) || 0, equipment });
  const room = shown.find(r => r.id === roomId);

  function resetResult() {
    setResult(null);
    setError('');
  }
  function changeAttendees(value: string) {
    setAttendees(value);
    resetResult();
  }
  function toggleEquipment(item: string) {
    setEquipment(equipment.includes(item) ? equipment.filter(i => i !== item) : [...equipment, item]);
    resetResult();
  }
  function selectRoom(id: string) {
    setRoomId(id);
    resetResult();
  }

  function check() {
    resetResult();
    if (!room) {
      setError('Select a room first.');
      return;
    }
    if (!start || !now || (!end && !endOfDay)) {
      setError('Fill in the current time, the start and the end.');
      return;
    }
    const s = toMinutes(start);
    const e = endOfDay ? 1440 : toMinutes(end);
    const n = toMinutes(now);
    if (!(s < e)) {
      setError('The end time must be after the start time.');
    }
    setResult(checkRoom(ROOMS, room.id, { start: s, end: e, now: n }));
  }

  return (
    <main className="page">
      <h1>Smart Campus Room Availability</h1>
      <h2>1. Find a room</h2>
      <div className="row">
        <label>Attendees
          <input type="number" min={1} value={attendees} onChange={e => changeAttendees(e.target.value)} />
        </label>
        <fieldset className="equipment">
          <legend>Required equipment</legend>
          {EQUIPMENT.map(item => (
            <label key={item} className="inline">
              <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggleEquipment(item)} /> {item}
            </label>
          ))}
        </fieldset>
      </div>
      {shown.length === 0 ? (
        <p className="empty">No rooms match {Number(attendees) || 0} attendees with {equipment.length ? equipment.join(' + ') : 'any equipment'}. Lower the number of attendees or untick some equipment.</p>
      ) : (
        <ul className="rooms">
          {shown.map(r => (
            <li key={r.id} className={r.id === roomId ? 'room selected' : 'room'}>
              <label>
                <input type="radio" name="room" checked={r.id === roomId} onChange={() => selectRoom(r.id)} />
                <strong>{r.name}</strong> · {r.capacity} seats · {r.equipment.join(', ')}
                {r.blocked && <span className="badge">blocked</span>}
              </label>
            </li>
          ))}
        </ul>
      )}
      <h2>2. Check a time</h2>
      <div className="row">
        <label>Current time<input type="time" value={now} onChange={e => { setNow(e.target.value); resetResult(); }} /></label>
        <label>Start<input type="time" value={start} onChange={e => { setStart(e.target.value); resetResult(); }} /></label>
        <label>End<input type="time" value={end} disabled={endOfDay} onChange={e => { setEnd(e.target.value); resetResult(); }} /></label>
        <label className="inline"><input type="checkbox" checked={endOfDay} onChange={e => { setEndOfDay(e.target.checked); resetResult(); }} /> Ends at 24:00</label>
      </div>
      <button onClick={check}>Check availability</button>
      {error && <p className="error">{error}</p>}
      {result !== null && room && (
        <p className={`result ${result ? 'available' : 'unavailable'}`}>{room.name}: {result ? 'Available' : 'Unavailable'}</p>
      )}
      {room && (
        <>
          <h2>Existing bookings of {room.name}</h2>
          <ul>{room.bookings.length ? room.bookings.map((b: Interval, i: number) => <li key={i}>{fmt(b.start)}–{fmt(b.end)}</li>) : <li>none</li>}</ul>
        </>
      )}
    </main>
  );
}

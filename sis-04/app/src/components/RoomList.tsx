import type { Room } from '../rooms';

type Props = { rooms: Room[]; selectedId: string; emptyText: string; onSelect: (id: string) => void };

export default function RoomList({ rooms, selectedId, emptyText, onSelect }: Props) {
  if (rooms.length === 0) return <p className="empty">{emptyText}</p>;
  return (
    <ul className="rooms">
      {rooms.map(r => (
        <li key={r.id} className={r.id === selectedId ? 'room selected' : 'room'}>
          <label>
            <input type="radio" name="room" checked={r.id === selectedId} onChange={() => onSelect(r.id)} />
            <strong>{r.name}</strong> · {r.capacity} seats · {r.equipment.join(', ')}
            {r.blocked && <span className="badge">blocked</span>}
          </label>
        </li>
      ))}
    </ul>
  );
}

import type { Room } from '../rooms';
import { fmt } from '../time';

type Props = { room: Room | undefined; error: string; result: boolean | null };

export default function ResultPanel({ room, error, result }: Props) {
  return (
    <>
      {error && <p className="error">{error}</p>}
      {result !== null && room && (
        <p className={`result ${result ? 'available' : 'unavailable'}`}>{room.name}: {result ? 'Available' : 'Unavailable'}</p>
      )}
      {room && (
        <>
          <h2>Existing bookings of {room.name}</h2>
          <ul>{room.bookings.length ? room.bookings.map((b, i) => <li key={i}>{fmt(b.start)}–{fmt(b.end)}</li>) : <li>none</li>}</ul>
        </>
      )}
    </>
  );
}

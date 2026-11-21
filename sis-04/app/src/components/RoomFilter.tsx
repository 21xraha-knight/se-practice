type Props = {
  attendees: string;
  equipmentOptions: string[];
  selected: string[];
  onAttendees: (value: string) => void;
  onToggle: (item: string) => void;
};

export default function RoomFilter({ attendees, equipmentOptions, selected, onAttendees, onToggle }: Props) {
  return (
    <div className="row">
      <label>Attendees
        <input type="number" min={1} value={attendees} onChange={e => onAttendees(e.target.value)} />
      </label>
      <fieldset className="equipment">
        <legend>Required equipment</legend>
        {equipmentOptions.map(item => (
          <label key={item} className="inline">
            <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} /> {item}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

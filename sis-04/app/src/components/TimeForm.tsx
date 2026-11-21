import type { TimeInputs } from '../request';

type Props = { value: TimeInputs; onChange: (next: TimeInputs) => void; onCheck: () => void };

export default function TimeForm({ value, onChange, onCheck }: Props) {
  const set = (patch: Partial<TimeInputs>) => onChange({ ...value, ...patch });
  return (
    <>
      <div className="row">
        <label>Current time<input type="time" value={value.now} onChange={e => set({ now: e.target.value })} /></label>
        <label>Start<input type="time" value={value.start} onChange={e => set({ start: e.target.value })} /></label>
        <label>End<input type="time" value={value.end} disabled={value.endOfDay} onChange={e => set({ end: e.target.value })} /></label>
        <label className="inline"><input type="checkbox" checked={value.endOfDay} onChange={e => set({ endOfDay: e.target.checked })} /> Ends at 24:00</label>
      </div>
      <button onClick={onCheck}>Check availability</button>
    </>
  );
}

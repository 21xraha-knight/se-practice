# Smart Campus Room Availability Checker (SIS #04)

A React + TypeScript (Vite) page that filters a fictional catalog of rooms by capacity and
equipment and tells whether the chosen room is free for a time. No login, database or live API.

## Commands

```text
npm install        # once
npm run dev        # start the page (http://localhost:5173)
npx vitest run     # run all tests (also: npm test)
npm run build      # type-check and build
```

## Modules (src/)

| File | What it does |
| --- | --- |
| `rooms.ts` | `Room` type, the fictional `ROOMS` catalog (5 rooms) and `EQUIPMENT` list. Data only. |
| `booking.ts` | `canBook` (AC1-AC5) and `checkRoom` (finds the room by id, calls `canBook` with that room's own data). |
| `filter.ts` | `filterRooms`: capacity >= attendees and ALL selected equipment (F1, F2). |
| `request.ts` | `evaluateRequest`: form values (HH:MM) to minutes, the validation message and the decision. |
| `time.ts` | `toMinutes` and `fmt`. |
| `App.tsx`, `components/` | The page. State and rendering only. |
| `*.test.ts` | Vitest tests with fixed catalogs inside the test files. |

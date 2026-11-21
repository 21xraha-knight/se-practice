# SIS #04 — Report: Evolving the Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 10.), every
     ### sub-heading and every **Label:** word — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and starting point

<!-- Model: the exact model with its version, as the tool shows it ("ChatGPT" is a tool, not a
     model). If the tool does not show it, write: not displayed
     Starting point: week-08 | week-07 | sis-03 | starter   (README section 3)
     Baseline commit: the commit that brings your starting point into sis-04/app/ UNCHANGED —
     git rev-parse --short HEAD right after that commit. It is your "initial version". -->

| Item | Value |
| --- | --- |
| Assistant (tool) | Claude (Claude Code session; analysis, plan and generation chats were fresh sub-agent chats with no tools) |
| Assistant model | claude-sonnet-5-5 (Claude Sonnet 5.5) |
| Starting point | week-08 |
| Baseline commit | e59697a |
| Language (ts or js) | ts |
| Vitest version | 3.2.4 |
| Where I ran the tests | my computer (Windows 11, Node 24.13.1) |

### 1.1 Baseline run

<!-- Before you change anything: run the tests of your starting point inside app/ and paste the
     REAL output. No tests yet (starter, sis-03)? Paste the run anyway: Vitest prints
     "No test files found". That is your honest "original" number, 0/0. -->

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/sis-04/sis-04/app

 ✓ src/booking.test.ts (24 tests) 7ms

 Test Files  1 passed (1)
      Tests  24 passed (24)
   Start at  16:45:33
   Duration  1.11s (transform 54ms, setup 0ms, collect 103ms, tests 7ms, environment 0ms, prepare 639ms)

(the starting point is my Practice #08 project after both fixes, brought in unchanged: commit e59697a)
```

## 2. Context for the assistant

### 2.1 Repository map

<!-- The concise map you gave the assistant: the files that matter and one line each on what
     they do. A tree is fine:  src/App.tsx — the page, holds the rooms and the form … -->

```text
sis-04/app/
  package.json          Vite + React 18 + TypeScript; scripts: dev, build, test (vitest run)
  index.html            page shell
  src/main.tsx          mounts <App />
  src/index.css         page styles (single column, .row, .error, .result)
  src/App.tsx           the page: holds ROOMS (2 rooms, no capacity/equipment), the form state
                        (room, now, start, end, endOfDay, blocked checkbox), check() which parses
                        HH:MM, validates end > start and calls canBook, renders the result and the
                        room's bookings
  src/booking.ts        canBook({ start, end, now, blocked, bookings }): boolean  (AC1-AC5, repaired in Practice 08)
  src/booking.test.ts   24 Vitest tests for canBook (T01-T14, X1, X2, R01-R05, AC5, BUG-A, BUG-B)
```

### 2.2 The context message as sent

<!-- The whole first message of your analysis chat: the map, AC1–AC6, F1–F5 and the constraints
     (no login, payments, live APIs or database; fictional data only). Unedited. -->

```text
I have a small React + TypeScript (Vite) app, the Smart Campus Room Availability Checker. I want to extend it, so first I want an analysis. Please do NOT write code and do NOT propose a full rewrite: give me maintainability risks with file/function references and a plan of small steps, smallest safe step first.

REPOSITORY MAP
sis-04/app/
  package.json          Vite + React 18 + TypeScript; scripts: dev, build, test (vitest run)
  index.html            page shell
  src/main.tsx          mounts <App />
  src/index.css         page styles (single column, .row, .error, .result)
  src/App.tsx           the page: holds ROOMS (2 rooms, no capacity/equipment), the form state
                        (room, now, start, end, endOfDay, blocked checkbox), check() which parses
                        HH:MM, validates end > start and calls canBook, renders the result and the
                        room's bookings
  src/booking.ts        canBook({ start, end, now, blocked, bookings }): boolean  (AC1-AC5, repaired in Practice 08)
  src/booking.test.ts   24 Vitest tests for canBook (T01-T14, X1, X2, R01-R05, AC5, BUG-A, BUG-B)

ACCEPTANCE CRITERIA (must stay true)
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

NEW REQUIREMENTS
Extend the prototype from one room to a catalog of at least four fictional rooms. Each room has id, name, capacity, equipment list, blocked status and its own bookings. Show only rooms that satisfy the user's selected requirements. The availability check must use the chosen room's bookings, not another room's data.
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result appropriately.

TARGET LAYOUT (fixed names)
src/rooms.ts  - type Room = { id, name, capacity, equipment, blocked, bookings } and const ROOMS: Room[] (data only)
src/filter.ts - filterRooms(rooms, { attendees, equipment }): Room[]
src/booking.ts - canBook(...) unchanged, plus checkRoom(rooms, roomId, { start, end, now }): boolean which calls canBook
src/App.tsx and components - import these; no room data and no rules of their own

CONSTRAINTS
No login, payments, live APIs or database. Fictional data only. No new dependencies. Do not change AC1-AC6 behaviour.

TASK
List the maintainability risks of the CURRENT code against these requirements (file/function for each) and propose a numbered plan of small steps. Ask for a plan, not a rewrite, and no code yet.
```

## 3. Codebase analysis (Task 1)

### 3.1 Maintainability risks

<!-- At least three, found in YOUR starting code. "Where" names a file or a function(),
     e.g. src/App.tsx, check(). Evidence is what you saw, not what the assistant said.
     Priority: High / Medium / Low. -->

| # | Risk | Where (file / function) | Evidence | Priority |
| --- | --- | --- | --- | --- |
| 1 | The room data and the `Room` type live inside the page, with two rooms and no capacity or equipment, so F1 and F2 cannot be built without changing the page | `src/App.tsx`: `type Room`, `const ROOMS` (lines 9-14) | `ROOMS` has 2 rooms with only id, name, blocked, bookings (read in the file). | High |
| 2 | "Blocked" is a form checkbox, not a property of the room, so F3 cannot be true per room | `src/App.tsx`: `useState(false)` for `blocked`, passed to `canBook` in `check()` | `room.blocked` is never read (`grep blocked src/App.tsx` shows only the checkbox state). In the browser I ticked "Room blocked" once and it applied to whichever room was selected. | High |
| 3 | A result stays on screen after the room is changed (F5), so the page can show another room's answer | `src/App.tsx`: the `<select>` `onChange` only calls `setRoomId` | In the browser: A-101 at 10:30-11:30 showed "Unavailable"; I switched to B-204 without pressing Check and "Unavailable" stayed; after pressing Check it said "Available". | High |
| 4 | The page repeats an AC1 rule of `canBook` and shows an error together with a result | `src/App.tsx`: `check()`, the `!(s < e)` test and `setResult(ok)` | In the browser: start 12:00, end 11:00 gave "The end time must be after the start time." and "Unavailable" at the same time. | Medium |
| 5 | A duplicate type and an unused type: the page declares its own `Interval`, and `booking.ts` has a `BookingRequest` type that nothing uses | `src/App.tsx` line 8; `src/booking.ts` `Interval`, `BookingRequest` | `grep BookingRequest src` shows only the declaration; `Interval` is defined in both files. | Low |
| 6 | No test reaches the page logic or a room catalog: all 24 tests call `canBook` only | `src/booking.test.ts` | The baseline run (1.1) is 24 tests, all on `canBook`; no file imports `App.tsx`. | Medium |

### 3.2 Improvement plan — before editing

<!-- Numbered, in the order you will do it, smallest safe step first. Written BEFORE you change
     code: the commit that adds this section comes before the commit that changes app/src. -->

1. Add `src/rooms.ts` with the `Room` type and 5 fictional rooms (data only, nothing imports it yet).
2. Write the `filterRooms` tests first (F1, F2, F4, B5, B6, input not mutated), see them fail, then add `src/filter.ts`.
3. Write the `checkRoom` tests first (F3, F5: the chosen room's own bookings, unknown id, no mutation), see them fail, then add `checkRoom` to `src/booking.ts`, calling `canBook`.
4. Make the page read `ROOMS` from `rooms.ts`, take `blocked` from the room (remove the checkbox) and call `checkRoom` by room id. Run all tests after.
5. Add the filter controls (attendees, equipment) and show only `filterRooms` results, with the empty state (F4).
6. Handle F5: clear the result whenever the room or a filter changes; if the selected room drops out of the list, select none.
7. Refactor: move HH:MM parsing and the request validation out of `App.tsx` into a pure module, split the page into components, remove the duplicate `Interval` and the unused type; write `diagrams/before.puml` and `after.puml`.
8. Add INT and boundary tests B1-B6, take the five screenshots, run the checker, fill the quality table.

### 3.3 One AI suggestion I rejected or modified

| Suggestion (as the assistant made it) | Decision | Why — with the AC, F-rule, test or file behind it |
| --- | --- | --- |
| Plan step 7 of the assistant: "Wire check() to checkRoom. Keep parsing and the end > start validation in the component for now." | Modified | `end > start` is AC1, a rule that already lives in `canBook`; keeping a copy in `App.tsx` is risk 4 and would break the layout rule that the page holds no rule of its own. I keep only the wiring in the page and move parsing and the validation message into a pure module (plan step 7), tested with AC1. The assistant's other steps (rooms.ts, filter tests first, F5 reset) I kept. |

## 4. Feature extension (Task 2)

### 4.1 What I added

The catalog `src/rooms.ts` holds 5 fictional rooms, each with id, name, capacity, equipment list, blocked status and its own bookings (A-101 Lecture Hall 60 seats, B-204 Seminar Room 24, C-310 Computer Lab 30, D-012 Meeting Room 8, E-005 Workshop 16 and blocked). The equipment list is fixed: projector, whiteboard, computers, microphone. On the page the user types the number of attendees and ticks the equipment (F1, F2); only `filterRooms` results are listed, as radio buttons. A blocked room stays in the list with a red "blocked" label and can never be Available (F3). When nothing matches, the list is replaced by a sentence that repeats the filter and says what to change (F4). The check button calls `checkRoom` with the id of the selected room, so the room's own bookings decide (F5). Changing the room, a filter or a time clears the old answer, so a result never belongs to another room.

### 4.2 Demonstration

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | Filter with 20 attendees and "projector" ticked: only A-101, B-204 and C-310 are listed (D-012 has 8 seats, E-005 has 16 and no projector). |
| `evidence/filter-empty.png` | Filter with 100 attendees and "projector": no room matches, so the page shows the empty-state sentence instead of the list (F4). |
| `evidence/switch-a.png` | Room C-310 Computer Lab selected (booked 11:00-13:00), times 11:00 to 12:00, current time 09:00: the result is "Unavailable". |
| `evidence/switch-b.png` | The same times 11:00 to 12:00 with room B-204 Seminar Room (no bookings) selected: the result is "Available", a different answer from switch-a (F5). |
| `evidence/narrow.png` | The page at 375 px wide in portrait with A-101 selected and a result: one column, no horizontal scroll (AC6). |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | Data only: the `Room` type, the 5 fictional rooms of `ROOMS` and the `EQUIPMENT` list. |
| `src/booking.ts` | The booking rules: `canBook` (AC1-AC5, unchanged) and `checkRoom`, which finds the room by id and calls `canBook` with that room's own blocked flag and bookings (F3, F5). |
| `src/filter.ts` | `filterRooms`: capacity >= attendees and ALL selected equipment (F1, F2); returns a new array. |
| `src/request.ts` | `evaluateRequest`: turns the form values (HH:MM, "ends at 24:00") into minutes, builds the validation message and asks `checkRoom`. Pure, no React. |
| `src/time.ts` | `toMinutes` and `fmt`, the only place that parses or prints HH:MM. |
| `src/App.tsx` | The page container: state, `filterRooms` for the list and one `withReset` helper. No room data and no booking rule. |
| `src/components/` | `RoomFilter` (attendees and equipment inputs), `RoomList` (radios, blocked label, empty state), `TimeForm` (the time inputs and the button), `ResultPanel` (message, result and the room's bookings). Presentation only. |

### 5.2 Design decisions

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| Blocked rooms stay in the filtered list with a "blocked" label | Hide blocked rooms from the list | F3 only says a blocked room is never reported Available, not that it is hidden; with the label the user sees why the answer is Unavailable (AC6), and F4's empty state is then only about capacity and equipment. |
| Parsing, validation message and the call to `checkRoom` live in a pure `request.ts`, tested in `request.test.ts` | Keep the parsing and the `end > start` check inside the page, as step 7 of the assistant's plan suggested | The page must hold no rule of its own (the layout rule and checker A5), and risk 4 of 3.1 (an error shown together with a result) could only be fixed and tested once the logic is outside the component. |
| Clear the old answer whenever the room, a filter or a time changes | Recompute the answer live on every change | F5 asks to refresh "appropriately"; clearing is simple and can never show another room's answer (risk 3 of 3.1), while a live recompute would run the rules on half-typed times. |
| `checkRoom(rooms, roomId, request)` takes the whole catalog and an id; an unknown id is not available | Pass the room object to the function | Tests can prove F5 by asking two rooms the same question (`checkRoom.test.ts`); an object would hide whether the right room was found. |

### 5.3 Duplication removed

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| `App.tsx` declared `type Interval` and `booking.ts` declared `Interval` too | one `Interval` in `src/booking.ts`, imported by `rooms.ts` (commit `sis-04: page uses ROOMS...` and the component split) |
| `booking.ts` `canBook`: the parameter type was written inline while the unused `BookingRequest` type described the same shape | `canBook` takes `BookingRequest` (commit `canBook uses the BookingRequest type...`) |
| `App.tsx`: "set the field, then reset the result" was written 7 times (3 named handlers and 4 inline lambdas) | one `withReset` helper in `App.tsx` and one `onChange(patch)` in `TimeForm` |
| The "blocked" state was kept in the page (a checkbox) while `Room.blocked` held the same fact | one source: `Room.blocked` in `rooms.ts`, read by `checkRoom` |

## 6. Automated tests (Task 4)

### 6.1 Test plan

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | `T05 AC1: an end past the day (1380-1441) is Unavailable` (booking.test.ts) | 1380-1441 -> false |
| AC2 | `T07 B2 AC2: 121 minutes (720-841) is Unavailable` | 721 minutes -> false |
| AC3 | `T13 AC3: a blocked room is Unavailable even for a touching request (660-720)` | blocked = true -> false |
| AC4 | `T09 B4 AC4: a partial overlap (630-690) is Unavailable` | 630-690 against 600-660 -> false |
| AC5 | `AC5: an Available request (720-780) leaves the bookings equal to a copy taken before` | Available and the bookings unchanged |
| F1 | `F1: only rooms with capacity >= attendees are returned (10 attendees -> C and D)` (filter.test.ts) | attendees 10 -> rooms C and D |
| F2 | `F2: a room must have ALL selected items (projector + whiteboard -> B and D, not A or C)` | projector + whiteboard -> B, D |
| F3 | `F3 AC3: a blocked room is never Available, even with no bookings (room C)` (checkRoom.test.ts) | room C blocked -> false |
| F4 | `F4: when no room matches, filterRooms returns an empty array (50 attendees)` | 50 attendees -> [] |
| F5 | `F5: the same times give different results in two rooms because of their own bookings (A booked 540-600, B free)` | room A false, room B true |
| B1 | `T06 B1 AC2: exactly 120 minutes (720-840) is Available` | 120 minutes -> true |
| B2 | `T07 B2 AC2: 121 minutes (720-841) is Unavailable` | 121 minutes -> false |
| B3 | `T01 B3 AC4: touching after the booking (660-720) is Available` | 660-720 after 600-660 -> true |
| B4 | `T09 B4 AC4: a partial overlap (630-690) is Unavailable` | 630-690 -> false |
| B5 | `B5 F1: a room whose capacity is exactly equal to the attendees is included (8 -> B is in)` | capacity 8 = attendees 8 -> included |
| B6 | `B6 F1: a room one seat below the attendees is excluded (9 -> B is out)` | capacity 8 < attendees 9 -> excluded |
| INT | `INT F1 F2 F3 F5: every room returned by filterRooms can be checked, and the blocked one stays Unavailable` | filter (8 attendees, whiteboard) gives B, C, D; checkRoom gives true, false, true |

In all, 46 tests in 4 files: `booking.test.ts` (24, my Practice #07/#08 suite, kept), `filter.test.ts` (9), `checkRoom.test.ts` (7), `request.test.ts` (6). Every test uses its own fixed catalog inside the file, imports the real `./booking`, `./filter` or `./request`, and has no mock, `.skip` or `test.each`. The expected values come from AC1-AC5 and F1-F5.

### 6.2 Commands

```text
cd sis-04/app
npm install
npx vitest run
npx tsc --noEmit
npm run build
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/sis-04/sis-04/app

 ✓ src/checkRoom.test.ts (7 tests) 3ms
 ✓ src/filter.test.ts (9 tests) 5ms
 ✓ src/booking.test.ts (24 tests) 4ms
 ✓ src/request.test.ts (6 tests) 3ms

 Test Files  4 passed (4)
      Tests  46 passed (46)
   Start at  16:58:40
   Duration  589ms (transform 180ms, setup 0ms, collect 389ms, tests 15ms, environment 1ms, prepare 578ms)
```

## 7. Quality evaluation (Task 5)

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | 24/24 | 46/46 | the `Tests` line of the baseline run in 1.1 and of the final run in 6.3 |
| Duplicated logic locations removed | 0 | 4 | the four rows of 5.3, each pointed at in the diffs of the commits named there |
| Code structure: modules and their responsibilities | `git ls-files app/src` at `e59697a`: `App.tsx` (data, form state, parsing, validation and rendering), `booking.ts`, `booking.test.ts`, `index.css`, `main.tsx` | `git ls-files app/src` at the head: `rooms.ts`, `booking.ts`, `filter.ts`, `request.ts`, `time.ts`, `App.tsx` and 4 components, 4 test files, `index.css`, `main.tsx` | `git ls-files app/src` before and after, read against the table of 5.1 |
| Remaining limitation | no catalog, no filter, nothing tests the page logic | the page itself is not rendered by any test: INT is `filterRooms` then `checkRoom` (and `evaluateRequest`), so a broken component (for example `RoomList` ignoring `selectedId`) would pass all 46 tests; I only checked the page by hand in Edge at 1000 px and 375 px | I tried to find a rendered test: jsdom and Testing Library are not installed, and the brief asks for no new dependency, so I did not add one |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** Claude (a fresh chat, run as a sub-agent without tools), claude-sonnet-5-5
**Date:** 2026-11-21
**Purpose:** the analysis (Task 1) and the improvement plan: risks of the current code and small steps

**Prompt:**

```text
I have a small React + TypeScript (Vite) app, the Smart Campus Room Availability Checker. I want to extend it, so first I want an analysis. Please do NOT write code and do NOT propose a full rewrite: give me maintainability risks with file/function references and a plan of small steps, smallest safe step first.

REPOSITORY MAP
sis-04/app/
  package.json          Vite + React 18 + TypeScript; scripts: dev, build, test (vitest run)
  index.html            page shell
  src/main.tsx          mounts <App />
  src/index.css         page styles (single column, .row, .error, .result)
  src/App.tsx           the page: holds ROOMS (2 rooms, no capacity/equipment), the form state
                        (room, now, start, end, endOfDay, blocked checkbox), check() which parses
                        HH:MM, validates end > start and calls canBook, renders the result and the
                        room's bookings
  src/booking.ts        canBook({ start, end, now, blocked, bookings }): boolean  (AC1-AC5, repaired in Practice 08)
  src/booking.test.ts   24 Vitest tests for canBook (T01-T14, X1, X2, R01-R05, AC5, BUG-A, BUG-B)

ACCEPTANCE CRITERIA (must stay true)
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Clear, responsive feedback on desktop and mobile.

NEW REQUIREMENTS
Extend the prototype from one room to a catalog of at least four fictional rooms. Each room has id, name, capacity, equipment list, blocked status and its own bookings. Show only rooms that satisfy the user's selected requirements. The availability check must use the chosen room's bookings, not another room's data.
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match.
F5 Changing the selected room must refresh the availability result appropriately.

TARGET LAYOUT (fixed names)
src/rooms.ts  - type Room = { id, name, capacity, equipment, blocked, bookings } and const ROOMS: Room[] (data only)
src/filter.ts - filterRooms(rooms, { attendees, equipment }): Room[]
src/booking.ts - canBook(...) unchanged, plus checkRoom(rooms, roomId, { start, end, now }): boolean which calls canBook
src/App.tsx and components - import these; no room data and no rules of their own

CONSTRAINTS
No login, payments, live APIs or database. Fictional data only. No new dependencies. Do not change AC1-AC6 behaviour.

TASK
List the maintainability risks of the CURRENT code against these requirements (file/function for each) and propose a numbered plan of small steps. Ask for a plan, not a rewrite, and no code yet.
```

**Output used:**

```text
ANALYSIS ONLY (no code, no rewrite). I only know the repo from your pasted map, so file/function references reflect that description. Please verify them against the real source.

## Maintainability risks of the current code vs. the new requirements

**R1. Room data and rules live in the UI (src/App.tsx: ROOMS, check()).**
- ROOMS is hard-coded in App.tsx with 2 rooms and no capacity, equipment or blocked fields.
- check() mixes HH:MM parsing, end > start validation and the canBook call with rendering. The same file owns data, rules and presentation.
- Your target layout says App must hold no room data and no rules. Every new requirement (F1-F5) would otherwise land in this one file.
- This is the largest risk.

**R2. Blocked status is a form checkbox, not room data (App.tsx: "blocked" state, passed to canBook).**
- The user decides whether the room is blocked. The requirement (F3) says it is a property of the room.
- If this checkbox survives, a blocked room can be reported Available simply by leaving it unticked. That breaks F3 and AC3.
- It also hides the real data flow, because canBook's `blocked` argument would come from two possible sources.

**R3. Bookings may not be tied to the chosen room (App.tsx: "the room's bookings" rendering and the canBook call).**
- With 2 rooms this is easy to get right by accident. With 4 or more, and a filtered list, the risk is checking a different room's bookings.
- The risk is highest if the lookup is by array index, because filtering changes indexes.
- Fix the identity rule: look up by room id, never by position in the filtered list.

**R4. Selected room can go stale when the list is filtered (App.tsx: the room state).**
- F4 and F5 mean the selected room may no longer be in the filtered list after the filters change.
- The old result then stays on screen for a room that is no longer shown or matched.
- The result state needs a defined reset or recompute rule whenever the selection or the filters change.

**R5. `now`, start and end are free-form form state parsed in the component (App.tsx: now, start, end, check()).**
- checkRoom(rooms, roomId, { start, end, now }) expects already-parsed values. Today the parsing is inside check().
- Two parsing paths would be a place for AC1 and AC2 regressions.
- Note that the check is also manual (a button): the result goes stale if inputs change after it was computed. F5 makes this visible.

**R6. Error and validation handling is entangled with the result display (App.tsx: .error / .result, check()).**
- Invalid input (end <= start, unparsable time) and Unavailable are different outcomes, but may share one rendering path.
- Adding "no rooms match" (F4) as a third state to that path will get messy.
- The risk is AC6 feedback becoming inconsistent.

**R7. Test coverage is on one function only (src/booking.test.ts, 24 tests for canBook).**
- Nothing covers the new logic: filterRooms (F1, F2, F3 interplay), checkRoom (right room's bookings, unknown room id), or App wiring.
- The existing 24 tests are your safety net for AC1-AC5. Keep them untouched and passing.
- New code without tests is where regressions will come from.

**R8. canBook contract is stable but easy to bend (src/booking.ts).**
- You want canBook unchanged. The risk is someone "helpfully" adding room or capacity logic to it, or checkRoom duplicating rules instead of delegating.
- Keep canBook pure. It must not mutate bookings (AC5; the BUG-A/BUG-B tests presumably guard this).
- checkRoom should only do lookup and delegation. It also needs a defined behaviour for an unknown id.

**R9. Filter semantics are easy to get subtly wrong (new src/filter.ts).**
- F1 is >=, not >.
- F2 is ALL selected items (AND), not any. An empty selection must mean "no constraint".
- Item-name matching must be exact and consistent: a shared constant list or union type, not free-typed strings.
- Attendees of 0, empty or NaN needs a decision.
- Does a blocked room appear in the filtered list but show Unavailable, or is it excluded? F3 only requires it is never reported Available. State this choice explicitly.

**R10. Styling and responsiveness (src/index.css: single column, .row, .error, .result).**
- A room list, filter controls and an empty state add UI to a single-column layout with only a few classes.
- This is a low risk, but it matters for AC6 on mobile.

## Plan: small steps, smallest and safest first

Run `npm test` and `npm run build` after every step. Each step should be one small commit.

1. **Baseline.** Confirm all 24 tests pass and the app builds. Record the current behaviour of the form by hand (a short checklist). No changes.
2. **Write down decisions before coding.**
   - Blocked rooms: shown but Unavailable, or hidden?
   - Equipment vocabulary (fixed list).
   - Attendees input rules (empty means no filter; reject negative and non-integer).
   - checkRoom for an unknown id (return false, or throw).
   - What happens to the result when the selection or filters change (clear it).
3. **Add src/rooms.ts (data only).** Define type Room and ROOMS with at least 4 fictional rooms, covering varied capacity, equipment, one blocked room, and bookings that touch at endpoints. Nothing imports it yet, so this is zero risk.
4. **Add src/filter.ts with filterRooms and tests first** (new filter.test.ts). Cover F1 boundary (equal capacity passes), F2 ALL semantics, empty requirements, no matches, and that the input array is not mutated.
5. **Add checkRoom to src/booking.ts and tests.** It looks up the room by id and calls canBook with that room's own bookings and blocked flag. Test: two rooms with different bookings give different results for the same time; blocked room is never available (F3); unknown id behaves as decided. canBook itself and its 24 tests stay untouched.
6. **Switch App.tsx to import ROOMS from rooms.ts.** Remove the local ROOMS and the blocked checkbox. Take blocked from the room. Look the room up by id. Check manually that behaviour for the two original rooms is unchanged (AC1-AC5).
7. **Wire check() to checkRoom.** Keep parsing and the end > start validation in the component for now. The component then holds only UI state and calls into booking.ts.
8. **Add the filter inputs and use filterRooms for the room list** (attendees, equipment checkboxes). Add the F4 empty state, with clear text and its own style.
9. **Handle F5.** Clear or recompute the result when the selected room or the filters change. If the selected room drops out of the filtered list, reset the selection and show the empty or prompt state.
10. **Optional, after everything works: extract small components** (RoomFilter, RoomList, ResultMessage), still presentational with no rules. Only do this if App.tsx has become hard to read.
11. **Polish for AC6.** Check desktop and mobile widths in index.css, and make sure error, unavailable, available and empty states are visually distinct.
12. **Final regression pass.** Run all tests and the build, and walk through AC1-AC6 and F1-F5 manually against the checklist from step 1.

## Notes
- Steps 3-5 add new files and tests without touching any existing behaviour, so they are the safest place to start.
- The risky changes are steps 6 and 9, where state and data flow change. Keep them as separate commits so they can be reverted alone.
- Open questions that change the plan: should the check run live as inputs change, or stay on a button? Is "now" user-editable in the final product, or only for testing?
```

**Problems found:** The assistant only saw my pasted map, and it said so. Its R3 and R5 (the wrong room's bookings, two parsing paths) were guesses about code it could not read: in my `App.tsx` the room is already looked up by id and parsing exists only once. Its step 7 ("keep parsing and the end > start validation in the component for now") would keep a copy of AC1 in the page. It did not notice the stale result after changing the room (my risk 3); I found it only by running the page.
**Changes made:** I kept its order (data first, filter and checkRoom tests first, then the page) and took risks R1, R2 and R6 as my risks 1, 2 and 4; I dropped R3 and R5 as unconfirmed; I modified step 7 (see 3.3).
**Verified by:** `App.tsx` read line by line, `grep blocked src/App.tsx`, and a run of the page in Edge (Playwright): A-101 at 10:30-11:30 showed Unavailable, switching to B-204 kept the old Unavailable until the button was pressed, and reversed times showed an error with Unavailable.

### 8.2 Exchange 2

**Tool and model:** Claude (a fresh chat, run as a sub-agent without tools), claude-sonnet-5-5
**Date:** 2026-11-21
**Purpose:** implementation: `filterRooms`, `checkRoom` and tests, one step, test first

**Prompt:**

```text
I am extending a React + TypeScript (Vite, Vitest) room availability app. Please implement ONE step, test first. Do not rewrite anything else and add no dependencies.

Existing code (src/booking.ts, already tested, do not change canBook):
export type Interval = { start: number; end: number };
export function canBook({ start, end, now, blocked, bookings }: { start: number; end: number; now: number; blocked: boolean; bookings: Interval[] }): boolean   // minutes after midnight, true = Available

New file src/rooms.ts (data only):
export type Room = { id: string; name: string; capacity: number; equipment: string[]; blocked: boolean; bookings: Interval[] };

Requirements:
F1 Capacity filter: room capacity must be greater than or equal to the requested attendees.
F2 Equipment filter: the room must contain ALL selected required items.
F3 A blocked room cannot be reported as available.
F4 Show a clear empty state when no rooms match (filterRooms returns an empty array).
F5 Changing the selected room must refresh the result; the availability check must use THAT room's own bookings and blocked flag, never another room's.

Please give me:
1. src/filter.ts: export function filterRooms(rooms: Room[], criteria: { attendees: number; equipment: string[] }): Room[]  (it must not mutate its input)
2. an addition to src/booking.ts: export function checkRoom(rooms: Room[], roomId: string, request: { start: number; end: number; now: number }): boolean  - it finds the room by id and CALLS canBook with that room's own blocked and bookings; an unknown id is not available; it must not change anything.
3. Vitest tests (src/filter.test.ts and a few tests for checkRoom) with a FIXED catalog of 4 rooms inside the test file (not the app's data). One test per case, no test.each, no mocks, exact .toBe(true)/.toBe(false), expected values from F1-F5 and not from what the code returns. Cover: capacity exactly equal to attendees is included, one below is excluded, ALL equipment (a room with only a projector must not match projector + whiteboard), no match gives an empty array, blocked room never available, same times in two rooms give different results because of their own bookings.
Return the three pieces of code and a one-line run command.
```

**Output used:**

```text
[…] Assumptions: Intervals are half-open, so a booking of 540-600 and a request starting at 600 do not collide. […] `checkRoom` goes in `src/booking.ts` with a type-only import of `Room`. This is the only change to that file, and `canBook` is untouched.

**1. `src/filter.ts`**
```ts
import type { Room } from './rooms';

export function filterRooms(
  rooms: Room[],
  criteria: { attendees: number; equipment: string[] }
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= criteria.attendees &&
      criteria.equipment.every((item) => room.equipment.includes(item))
  );
}
```
`filter` returns a new array and nothing is mutated. An empty equipment list matches every room, so a capacity-only search works. F4's empty state is the UI's job: show the message when `filterRooms(...).length === 0`.

**2. Addition to `src/booking.ts`**
```ts
import type { Room } from './rooms';

export function checkRoom(
  rooms: Room[],
  roomId: string,
  request: { start: number; end: number; now: number }
): boolean {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return false;
  return canBook({
    start: request.start,
    end: request.end,
    now: request.now,
    blocked: room.blocked,
    bookings: room.bookings,
  });
}
```
The room is looked up by id, so its own `blocked` flag and `bookings` are used (F5). An unknown id returns false.

**3. Tests** […]
```ts
  it('uses the selected room only: D is free at 540-600 although A is booked then', () => {
    expect(checkRoom(catalog, 'D', req)).toBe(true);
  });
```
[…]
**Run command:** `npx vitest run src/filter.test.ts src/booking.checkRoom.test.ts`
```

**Problems found:** The code of `filterRooms` and `checkRoom` was right (`every`, not `some`) and I used it. The tests were weak against my rules: titles carry no F or B IDs, there is no B5/B6-style pair under those names and no integration test; the checks are written as `.includes(...)).toBe(true)`; and the test "uses the selected room only: D is free at 540-600 although A is booked then" proves nothing about F5, because room D's own booking (600-660) only touches 540-600, so D would be Available even if `checkRoom` read room A's data.
**Changes made:** I wrote my own tests first (`filter.test.ts`, `checkRoom.test.ts`) with IDs in the titles, B5 and B6 at capacity 8 and 9, an INT test, and an F5 test where room D's own booking (660-720) is overlapped in D but not in B. Then I added the assistant's `filter.ts` and `checkRoom` unchanged.
**Verified by:** The tests failed first (`Cannot find module './filter'`), then 40 of 40 passed. I changed `every` to `some` once: 5 tests failed (F1, B5, F2 three times), so the F2 tests do catch the mistake, and I restored `every`.

### 8.3 Exchange 3

**Tool and model:** Claude (a fresh chat, run as a sub-agent without tools), claude-sonnet-5-5
**Date:** 2026-11-21
**Purpose:** refactoring advice: how to separate the UI from the rules and remove duplication

**Prompt:**

```text
Here is the current src/App.tsx of my room availability app (React 18 + TypeScript). It works and 40 Vitest tests are green, but it is one big component. I must separate: room data (src/rooms.ts, already done), booking rules (src/booking.ts: canBook, checkRoom), filtering (src/filter.ts: filterRooms) and UI presentation, so that the UI holds NO room data and NO rule of its own, and I must remove duplicated logic. The module names rooms, booking, filter are fixed; the page must keep the same behaviour (AC1-AC6, F1-F5). No new dependencies, no rewrite of the behaviour.

Please do NOT write the full code. Give me: (1) the duplication and mixed responsibilities you can point at in this file (line-level), (2) a proposal of small components and at most one extra pure module, each with a one-line responsibility and its props, (3) the order of small safe steps, and (4) anything in the current file you think is a bug.

```tsx
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
```
```

**Output used:**

```text
## (1) Duplication and mixed responsibilities

**Duplication**
- **Lines 33-48 and 103-106:** The pattern "set a field, then `resetResult()`" is written 7 times. Three of them are named handlers (`changeAttendees`, `toggleEquipment`, `selectRoom`). Four are inline lambdas on the time inputs and the checkbox. Every new input has to remember the reset, and one forgotten reset gives a stale result.
- **Lines 30 and 87:** `Number(attendees) || 0` is repeated. […]
- **Line 11 and line 116:** `Interval` and the `b: Interval` annotation duplicate the booking type […]
- **Line 63 (probably):** `s < e` very likely duplicates a rule inside `canBook` or `checkRoom`. […]

**Mixed responsibilities**
- **Line 9 with lines 30, 66 and 79:** The UI imports `ROOMS` and `EQUIPMENT` directly and passes `ROOMS` to the rule function. […]
- **Lines 56-65:** `check()` mixes input validation (completeness, ordering), conversion to minutes, rule calls and error messages. Only the setState calls belong in the UI.
[…]

## (2) Components and one pure module
- **Pure module `src/timeInput.ts` (the only extra module)**: `toMinutes(hhmm)`, `fmt(minutes)`, `END_OF_DAY = 1440`, `parseAttendees(text)`, `buildInterval({now, start, end, endOfDay})` […]
- **`App`** is a container […] Keep it importing the modules directly so your 40 tests that render `<App />` keep working. […]
- `RoomFilter`, `RoomList`, `TimeForm` (one `onChange(patch)` replaces the four inline lambdas), `ResultMessage`, `BookingList` […]
- One `edit(fn)` helper that runs the update and then `resetResult()`.

## (4) Likely bugs
1. **Lines 63-66, a missing `return`.** When `s >= e`, you set the error but still run `setResult(checkRoom(...))`. The user sees the error and an "Available" or "Unavailable" line together. If `checkRoom` has no ordering guard, it can even say "Available" for an invalid interval. Add `return` after `setError`.
2. **Line 30, attendees are not sanitized.** […]
3. **Stale selection, lines 22 and 31.** […]
[…]
```

**Problems found:** Two claims were wrong: "keep it importing the modules directly so your 40 tests that render `<App />` keep working" (no test renders `App`: 3.1 risk 6 and the file list show that), and "if `checkRoom` has no ordering guard, it can even say Available for an invalid interval" (`canBook` rejects `start >= end`, AC1). It also proposed a `timeInput.ts` module with `parseAttendees` and `END_OF_DAY`, which is more than my code needs. Its bug 1, the missing `return` after the error, was real.
**Changes made:** I split the page into `RoomFilter`, `RoomList`, `TimeForm` and `ResultPanel`, kept two small modules `time.ts` and `request.ts` (not `timeInput.ts`), used one `withReset` helper, and fixed bug 1 in its own commit. I did not add `parseAttendees`, `END_OF_DAY` or `BookingList`.
**Verified by:** The 40 tests stayed green after the split (commit `split the page into components...`); `request.test.ts` was written first and failed on the reversed-times case (`expected { …(2) } to deeply equal { …(2) }`), then 46 of 46 passed after the fix; `tsc --noEmit` and `npm run build` pass; the five screenshots were taken after the refactor.

## 9. Checker results and known fails

| Check | Why it still fails |
| --- | --- |
| none | all 33 checks PASS when the checker runs on a clean checkout. On my laptop the no-`node_modules` check would fail only while the git-ignored `app/node_modules/` folder is present; it is not committed. |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

I gave the assistant a repository map, AC1-AC6, F1-F5 and the constraints, and asked for a plan, not code. It could only see my paste, so two of its risks were guesses; I kept the ones I could confirm in App.tsx and by running the page. The most useful suggestion was the order: data, then filter and checkRoom tests first. The code it wrote for filterRooms and checkRoom was correct, but its tests were not good enough: no F or B IDs, no integration test, and an F5 test that would have passed even if checkRoom read the wrong room, because room D's own booking only touched the request. I rewrote the tests from the rules and then changed every to some once to see five tests fail. In the refactoring answer it claimed that 40 tests render App, which is false, and that checkRoom could call an invalid interval Available, which AC1 already forbids in canBook. It also found a real bug I had carried over: reversed times showed an error and a result together. I wrote the request.test.ts case first, watched it fail, then fixed it. I verified by reading the code, grepping, running the page in Edge at two widths and re-running the whole suite after each step. Tests decided the order of work and caught the some mistake. Next I would add a rendered test with jsdom, because no test would notice a broken component, and recompute the answer live.

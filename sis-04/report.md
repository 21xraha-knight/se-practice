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

<!-- Short: the catalog (how many rooms, which equipment), how the filter is chosen on the page,
     what the empty state says, what happens to an old result when the room changes. -->

(write here)

### 4.2 Demonstration

<!-- One row per screenshot in evidence/. Say what is on it: the filter values, the rooms shown,
     the room selected, the times entered and the result. -->

| Screenshot | What it shows |
| --- | --- |
| `evidence/filter-match.png` | (write here) |
| `evidence/filter-empty.png` | (write here) |
| `evidence/switch-a.png` | (write here) |
| `evidence/switch-b.png` | (write here) |
| `evidence/narrow.png` | (write here) |

## 5. Refactoring (Task 3)

<!-- The diagrams are diagrams/before.puml and diagrams/after.puml (README section 8). -->

### 5.1 Module responsibilities after

| Module or component | Responsibility |
| --- | --- |
| `src/rooms.ts` | (write here) |
| `src/booking.ts` | (write here) |
| `src/filter.ts` | (write here) |
| (write here) | (write here) |

### 5.2 Design decisions

<!-- At least two. The alternative is what you could have done instead (often what the assistant
     proposed). The why names an AC, an F-rule, a test or a risk from 3.1. -->

| Decision | Alternative I did not take | Why |
| --- | --- | --- |
| (write here) | (write here) | (write here) |
| (write here) | (write here) | (write here) |

### 5.3 Duplication removed

<!-- One row per duplicated location that is gone. Count what you can point at, nothing else. -->

| Before (file / function, what was repeated) | After (where it lives now) |
| --- | --- |
| (write here) | (write here) |

## 6. Automated tests (Task 4)

### 6.1 Test plan

<!-- One row per required ID. A test may carry several IDs in its title,
     e.g. test('T06 B1 AC2: exactly 120 minutes is available', …) covers B1 and AC2. -->

| ID | Test title (as in the file) | Input → expected |
| --- | --- | --- |
| AC1 | (write here) | (write here) |
| AC2 | (write here) | (write here) |
| AC3 | (write here) | (write here) |
| AC4 | (write here) | (write here) |
| AC5 | (write here) | (write here) |
| F1 | (write here) | (write here) |
| F2 | (write here) | (write here) |
| F3 | (write here) | (write here) |
| F4 | (write here) | (write here) |
| F5 | (write here) | (write here) |
| B1 | (write here) | (write here) |
| B2 | (write here) | (write here) |
| B3 | (write here) | (write here) |
| B4 | (write here) | (write here) |
| B5 | (write here) | (write here) |
| B6 | (write here) | (write here) |
| INT | (write here) | (write here) |

### 6.2 Commands

<!-- The commands exactly as you typed them, from app/. -->

```text
(paste here)
```

### 6.3 Final run

<!-- The REAL output of the full run on your final code. Every test passes, and the number of
     tests equals what your test files hold (R2). -->

```text
(paste here)
```

## 7. Quality evaluation (Task 5)

<!-- Original = your baseline commit. Final = what you submit. "How I obtained it" says how you
     measured, so someone else could repeat it: "1.1 and 6.3 runs", "counted in 5.3",
     "git ls-files app/src". Do not invent a metric. Tests: write passed/total, e.g. 19/19. -->

| Measure | Original | Final | How I obtained it |
| --- | --- | --- | --- |
| Automated tests passed / total | (write here) | (write here) | (write here) |
| Duplicated logic locations removed | (write here) | (write here) | (write here) |
| Code structure: modules and their responsibilities | (write here) | (write here) | (write here) |
| Remaining limitation | (write here) | (write here) | (write here) |

## 8. AI evidence appendix

<!-- At least three exchanges, one ### 8.N block each: the analysis (Task 1), the plan, and at
     least one implementation, refactoring or test exchange. Copy the block for more.
     The prompt as you sent it; the output may be cut to the part you used, with "[…]" where
     you cut. Verified by: the test, run, file or check that confirmed it — not "it looked right". -->

### 8.1 Exchange 1

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.2 Exchange 2

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

### 8.3 Exchange 3

**Tool and model:** (write here)
**Date:** (write here)
**Purpose:** (write here)

**Prompt:**

```text
(paste here)
```

**Output used:**

```text
(paste here)
```

**Problems found:** (write here)
**Changes made:** (write here)
**Verified by:** (write here)

## 9. Checker results and known fails

<!-- Every check still FAIL or ERROR in your last run of python tests/check_sis.py, and why.
     The same IDs go in submission.yml known_fails. None left? Write: none. -->

| Check | Why it still fails |
| --- | --- |
| (write here) | (write here) |

## 10. AI reflection (Task 6)

<!-- 200–300 words, your own words, no assistant. Answer all five:
     What context did you provide the AI assistant? Which generated suggestions were useful or
     incorrect? What did you personally verify? How did tests influence your engineering
     decisions? What would you improve next? -->

(write here)

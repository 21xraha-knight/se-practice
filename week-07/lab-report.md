# Week 07 — Lab report

**Name:** Baimbetov Rakhat (24B030286)
**Group:** Monday 16:00-19:00
**Date:** 2026-11-21

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Project I continue (`week-06` = my Week 06 Bolt project, `starter` = the provided starter) | starter (I have no Week 06 project; declared in submission.yml) |
| Bolt project link (or `not shared`, and why) | not shared: no Bolt project, the provided starter was used |
| Assistant that generated the tests (tool) | Claude (Claude Code session; the tests were generated in a fresh sub-agent chat with no tools and no project access) |
| Exact model (with its version, or `not displayed`) | claude-sonnet-5-5 (Claude Sonnet 5.5) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | my computer (Windows 11, Node 24.13.1) |
| Vitest version (the `RUN  v…` line of a run) | 3.2.4 |
| Test command | `npx vitest run` (in `week-07/app`, also `npm test`) |

---

## 2. Task 1 — baseline and the booking function

**Before editing:** where did the booking decision live in the project you started from?

| | |
| --- | --- |
| File and function (or "inside the page component") | `app/src/App.tsx`, inside the `check()` function of the `App` component (the `let ok = true; if … else if …` block) |
| Its inputs | `s`, `e`, `n` (start, end and now in minutes, converted from the HH:MM inputs), the `blocked` checkbox state and `room.bookings` |
| What it returned | nothing: it set a local boolean `ok` and then called `setResult(ok)` |
| How the page used it | `result` state rendered as the words Available or Unavailable; validation messages for empty inputs and for end before start were set just before in the same function |

**What I changed to extract `canBook`.** Say which file it now lives in, what you moved, and why
the behaviour did not change. Also say which file of the page now calls it. 40 words or more.

<!-- Write below this line -->

I created `app/src/booking.ts` with `export function canBook({ start, end, now, blocked, bookings })` and moved the whole `let ok = true; if (!(0 <= s && s < e && e <= 1440)) … else if … blocked … for (const b of bookings)` block into it unchanged, only renaming `s`, `e` and `n` to the parameter names `start`, `end` and `now`. `App.tsx` now imports it with `import { canBook } from './booking'` and calls `canBook({ start: s, end: e, now: n, blocked, bookings: room.bookings })`. The behaviour did not change because every condition, its order and its operators were copied as they were, and the conversion from HH:MM to minutes and the validation messages stayed in the page. `tsc --noEmit` passed and I checked the page in a browser after the change (section 8: the same Available / Unavailable answers). The Claude Code assistant did this extraction, with me reviewing the diff in commit `week-07: extract canBook into src/booking`.

---

## 3. Task 2 — the test plan

Default fixture: `now = 540`, `blocked = false`, `bookings = [{ start: 600, end: 660 }]`, fresh
for every test. **The Expected column comes from AC1–AC4, never from the code.** Write the
**reason** for each expected result **before** you send the generation prompt.

| ID | Candidate / changed input | Expected | AC | Reason (in your words) |
| --- | --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 | The booking ends at 660 and the request starts at 660. An interval end is excluded, so they share only one instant and do not overlap. |
| T02 | 540–570 (starts now) | false | AC1 | Start 540 equals now 540. AC1 needs the start to be strictly after now, so a request that starts right now is already in the past. |
| T03 | 720–720 (zero duration) | false | AC1 | 720 to 720 has zero length. AC1 needs start < end strictly, and an empty interval is not a booking. |
| T04 | 750–720 (reversed) | false | AC1 | The start 750 is after the end 720. AC1 requires start < end, so a reversed interval is invalid. |
| T05 | 1380–1441 (past day end) | false | AC1 | End 1441 is one minute past 24:00 (1440). AC1 caps the end at 1440, so the request spills into the next day. |
| T06 | 720–840 (120 minutes) | true | AC2 | 720 to 840 is exactly 120 minutes. AC2 rejects only durations longer than 120, so the limit itself is allowed. |
| T07 | 720–841 (121 minutes) | false | AC2 | 720 to 841 is 121 minutes, one minute over the limit. AC2 rejects anything longer than 120, so the first value past the limit fails. |
| T08 | 570–600 (touching before) | true | AC4 | The request ends at 600 and the booking starts at 600. They touch at one endpoint only, which AC4 explicitly allows. |
| T09 | 630–690 (partial overlap) | false | AC4 | 630 to 690 overlaps the booking 600 to 660 during 630 to 660, so it clashes in the middle. |
| T10 | 570–690 (contains booking) | false | AC4 | 570 to 690 starts before the booking and ends after it, so the whole booking 600 to 660 is inside the request. That is still an overlap. |
| T11 | 615–645 (inside booking) | false | AC4 | 615 to 645 lies fully inside 600 to 660. The request is inside the booking, which is an overlap. |
| T12 | 600–660 (identical interval) | false | AC4 | The request is identical to the booking, so every minute overlaps. A duplicate booking must be rejected. |
| T13 | 660–720, blocked = true | false | AC3 | 660 to 720 is otherwise valid (touching, 60 minutes, in the future), so the only reason to reject is blocked = true, which is AC3. |
| T14 | 630–690, bookings = [] | true | AC4 | With bookings = [] nothing can overlap. 630 to 690 would clash with the default booking, so the empty list is what makes it valid. |
| AC5 | an Available request — the bookings after the call equal the bookings before | true, data unchanged | AC5 | An Available request (720 to 780) must leave the booking list exactly as it was. I take a copy before the call and compare after it, because a function that pushes the new interval would still return true. |
| X1 | 1320–1440 (ends exactly at 24:00, 120 minutes) | true | AC1 | The largest end AC1 allows is 1440, and T05 only tests one minute beyond it. 1320 to 1440 is also exactly 120 minutes, so it sits on both limits at once and nothing overlaps the 10:00 booking. |
| X2 | bookings = [600–660, 720–780], request 660–720 | true | AC4 | The request is squeezed between two bookings and touches both at an endpoint. T01 and T08 touch only one side. It checks that the loop in canBook does not reject the request because of the second booking. |

X1 and X2 are **your own two cases**: a boundary or a state that T01–T14 do not reach. Fill all
five columns.

---

## 4. Task 3 — the generation prompt and the first suite

**The prompt exactly as I sent it.** Use the deck's prompt with `[our test framework]` replaced by
`Vitest`, followed by the case table from section 3:

```text
Generate tests for the existing booking function using Vitest. Use AC1–AC6 and the reviewed case table below.

Import the real function used by the page. Keep its code unchanged. Use fixed time and fresh fixtures. Assert exact decisions and unchanged booking data.

Return the test file, run command, and AC mapping. Flag unclear requirements. We will run the tests ourselves.

AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback.

Function (src/booking.ts, tests live next to it as src/booking.test.ts):
export function canBook({ start, end, now, blocked, bookings }): boolean
// minutes after midnight (600 = 10:00, 1440 = 24:00); true = Available, false = Unavailable

Code of src/booking.ts:
export type Interval = { start: number; end: number };
export type BookingRequest = { start: number; end: number; now: number; blocked: boolean; bookings: Interval[] };
export function canBook({ start, end, now, blocked, bookings }: BookingRequest): boolean {
  let ok = true;
  if (!(0 <= start && start < end && end <= 1440)) ok = false;
  else if (!(start > now)) ok = false;
  else if (end - start > 120) ok = false;
  else if (blocked) ok = false;
  else {
    for (const b of bookings) {
      if (start < b.end && end > b.start) {
        ok = false;
        break;
      }
    }
  }
  return ok;
}

Default fixture: now = 540, blocked = false, bookings = [{ start: 600, end: 660 }]. Fresh data in every test; change only what the row says.

| ID | Candidate / changed input | Expected | AC |
| T01 | 660–720 (touching after) | true | AC4 |
| T02 | 540–570 (starts now) | false | AC1 |
| T03 | 720–720 (zero duration) | false | AC1 |
| T04 | 750–720 (reversed) | false | AC1 |
| T05 | 1380–1441 (past day end) | false | AC1 |
| T06 | 720–840 (120 minutes) | true | AC2 |
| T07 | 720–841 (121 minutes) | false | AC2 |
| T08 | 570–600 (touching before) | true | AC4 |
| T09 | 630–690 (partial overlap) | false | AC4 |
| T10 | 570–690 (contains booking) | false | AC4 |
| T11 | 615–645 (inside booking) | false | AC4 |
| T12 | 600–660 (identical interval) | false | AC4 |
| T13 | 660–720, blocked = true | false | AC3 |
| T14 | 630–690, bookings = [] | true | AC4 |
| AC5 | an Available request (720–780); bookings after the call equal bookings before | true, data unchanged | AC5 |
| X1 | 1320–1440 (ends exactly at 24:00, 120 minutes) | true | AC1 |
| X2 | bookings = [600–660, 720–780], request 660–720 (touches two bookings) | true | AC4 |
```

The prompt was sent in a fresh sub-agent chat (no tools, no earlier messages). The only addition was one harness sentence at the end: "(Instruction for this session only: do not use any tools; ...)" for the agent not to run anything. The case table also holds X1 and X2 and the code of `booking.ts` was pasted because the chat could not see it.

**The assistant's answer: run command, AC mapping and any unclear requirements it flagged,
pasted unedited.** Its test file goes to `suites/first/` and is not pasted here:

```text
## Run command

npx vitest run src/booking.test.ts

(Add `--reporter=verbose` to see each T/X id. No config changes needed; the import is `./booking`, the real module, which is not modified.)

## AC mapping

| AC | Covered by | Notes |
|---|---|---|
| AC1 | T02, T03, T04, T05, X1 | Covers start == now, zero and reversed interval, end > 1440, end == 1440 accepted. Not covered: start < 0 and start == 0 (see flags). |
| AC2 | T06 (120 true), T07 (121 false) | Boundary pair covered. |
| AC3 | T13 | Blocked with an otherwise valid, non-overlapping interval, so only `blocked` drives the result. |
| AC4 | T01, T08, T09, T10, T11, T12, T14, X2 | Touching before/after, partial, containing, contained, identical, empty list, two touching neighbours. |
| AC5 | AC5 test (plus an Unavailable variant, a repeat-call check, and the unchanged-bookings assertions on every table row) | Only the data-unchanged half is testable here. |
| AC6 | Not covered | Out of scope for a unit test of `canBook`. |

## Unclear requirements and gaps to flag

1. AC6 (desktop and mobile layout, understandable validation feedback) cannot be tested through `canBook`. It needs a component or e2e test (for example Playwright at two viewport widths) against the page. No page code was provided, so none is written.
2. AC5's "clear Available / Unavailable decision" is a UI label. `canBook` only returns a boolean. The true to Available and false to Unavailable mapping is untested. Only the "no data change" part is asserted.
3. AC1 lower bound: `0 <= start` is not exercised by the table. With `now = 540`, any start < 540 is rejected by the "after now" rule, so negative or zero start cannot be isolated without changing `now`. The table says to change only what the row says, so I did not add such a case. A row like `now = -10, start = -5` or `now = -1, start = 0` would cover it. Please decide whether to add one.
4. AC1: the table's only "start not after now" row is start == now (T02). Start < now is untested.
5. AC3 says "the selected room is blocked", but the function takes a single `blocked` boolean. Whether it is already resolved for the selected room is the page's responsibility and is not tested here.
6. Rule precedence cannot be observed because the function returns only a boolean. For example, a request that is both too long and overlapping gives false either way. The tests assert decisions only, not the reason. If the page needs per-rule validation messages (AC6), `canBook` cannot supply them, and a reason-returning function would need to be specified.
7. The X1 and X2 rows are labelled AC1 and AC4 in the table, but they sit outside the T01 to T14 numbering. I treated them as reviewed extras.
8. "Fixed time": the function has no clock dependency, so fixed time is just `now = 540`. If the page computes `now` from `Date`, that code is where fake timers (`vi.useFakeTimers`) would be needed, and it is not covered here.
9. Not run: tests were written but not executed, as requested.
```

The first suite was saved to `suites/first/` **before** I changed anything in it: yes

---

## 5. Task 4 — review of the first suite

Review it **before** you run it. Look at the imports, the expected values, isolation, duplicates
and skipped tests. Make one row per decision. At least **two** rows, and each one names the kind of
weakness (the deck's table: *no exception occurred* · *expected = current output* · *only valid
requests* · *mocked booking function*, or your own) and the AC that decides it.

| # | Test or part of the suite | What is weak or wrong | Decision: accept / revise / reject | AC or reason |
| --- | --- | --- | --- | --- |
| 1 | The `it.each(rows)` block that holds T01–T14, X1 and X2 | Table-driven: titles are `$id [$ac] …` so an ID is not written in a test title, and the course rule is one test per case, no `test.each`. The checker (and a reader) cannot find T05 by name. | revise: one `test('T05 AC1: …')` per case | AC1–AC4 (each case keeps its own AC from the plan) |
| 2 | Inside the same loop: `expect(req.bookings).toBe(bookingsRef)` and the per-item `toBe` after every case | Weak in the deck's sense of *no exception occurred* mixed with duplicated assertions: the same immutability check is repeated 16 times, but an assertion on a non-Available request proves nothing about AC5 (a rejected request may never reach the code that changes them). | revise: keep one AC5 test on an Available request, compared with a copy taken before | AC5 |
| 3 | `AC5: calling twice…` and `AC5: an Unavailable decision also leaves bookings unchanged` | Duplicated cases: 630–690 repeats T09, and "twice" tests a pure function's determinism, which no AC asks for. | reject | AC5 says Available / Unavailable without changing data; T09 already covers 630–690 |
| 4 | `fixture hygiene` test | It tests the test helper `makeRequest`, not `canBook`. | reject | no AC; it cannot detect a defect in `booking.ts` |
| 5 | The expected values of T01–T14, X1, X2 | I recomputed each from AC1–AC4 and the plan before running; all 16 are correct and none copies the output of the code (deck: *expected = current output*). | accept | AC1–AC4 |
| 6 | The import `from './booking'` and no mocks | It imports the real function used by the page (deck: *mocked booking function*); accepted as it is. | accept | AC1–AC5 |
| 7 | `now` is 540 in every case | Only start == now is tested, so a `canBook` that ignores the supplied `now` and uses 540 would pass; AC1 says "after the supplied current time". | revise: add R01 (now 719) and R02 (now 720) | AC1 |
| 8 | Every overlap case has one booking | A `canBook` that only checks `bookings[0]` would pass; the second booking is only used by X2 where it touches. | revise: add R04 (overlap only the second booking) | AC4 |

---

## 6. Task 5 — running, diagnosing, improving

### 6.1 The first run

The **real** terminal output of the first run of the first suite, pasted unedited. Include the
`RUN  v…` line and the `Tests` summary line. A build message or the assistant saying "tests pass"
is not a run.

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-practice/week-07/app

 ✓ src/booking.test.ts (20 tests) 4ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
   Start at  16:34:34
   Duration  568ms (transform 44ms, setup 0ms, collect 63ms, tests 4ms, environment 0ms, prepare 168ms)
```

The terminal printed colour codes; the text above is the same run with them removed. It is the run of the unedited first suite copied to `app/src/booking.test.ts`.

**Each failure, diagnosed** (the deck's table: import/runner error · assertion mismatch · result
changing per run · no tests discovered). Write `none` in the first row if nothing failed.

| Failing test | Observed failure | First check | Test repair or implementation fix? | Action taken |
| --- | --- | --- | --- | --- |
| none | all 20 tests passed | I checked the expected values against the plan, not only the colour of the run | nothing to repair in the code | The green run does not mean the suite follows the rules: it uses `it.each`, so I rewrote it as one test per case (decision 1) and added R01–R05 (decisions 7, 8, 2). No implementation fix was needed: `booking.ts` already matched AC1–AC5. |

### 6.2 The improvement prompt

The deck's improvement prompt exactly as sent, followed by the actual output from 6.1. Then
paste the assistant's answer, unedited:

```text
Review this test suite against AC1–AC6 and our case table. Identify incorrect expectations, weak assertions, duplicated cases, and missing boundaries.

For each proposed change, explain the requirement and the defect it could detect. Improve the tests without changing correct expectations to match buggy behavior.

Use the actual failure output below. Separate test repairs from implementation fixes.

AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback.

[…the case table, the first suite and the actual output of 6.1 followed, as in the file I sent]

----- ANSWER -----

**Review of `src/booking.test.ts` against AC1–AC6 and the case table**

I could not see `src/booking.ts`, so I am judging the tests only against the requirements and the case table.

**Reading the failure output**
- There are no failures. Vitest reports 20 of 20 passing, which is 16 table rows (T01–T14, X1, X2), 3 AC5 tests and 1 fixture test.
- Nothing in the output points to an implementation defect, so I have no implementation fixes to propose.
- A green run does not show the suite is strong. Several plausible bugs would still pass it (listed below).
- If the new tests below fail, that points to an implementation bug. The expectation should stay as written, per your instruction.

**1. Incorrect expectations**
- None found. I recomputed all 16 rows against AC1–AC4 and each expected value is right.
- The rows isolate their rules well:
  - T05 is only 61 minutes long, so it fails on the day end alone.
  - T13 and T07 are otherwise valid.
  - T14 is the control for T09.

**2. Weak assertions and gaps in the checks**
- **Mutation check (AC5):**
  - Every immutability check runs on a fixture with a single booking, except X2, whose two bookings are already sorted.
  - An implementation that sorts `req.bookings` in place, or mutates it in other ways, would pass.
  - Requirement: AC5, no change to existing booking data.
  - Repair:
    - Build the fixture with a deep freeze, so a mutation throws.
    - Add one test with unsorted bookings, such as `[{720,780},{600,660}]`, and compare before and after.
    - Optionally also assert that `now`, `blocked`, `start` and `end` are unchanged.
- **`now` is never varied:**
  - Every row uses `now = 540`, so an implementation that hard-codes 540 passes everything.
  - Requirement: AC1, "after the supplied current time".
  - Repair: add the `now` rows in section 4.
- **Single booking in every overlap case:**
  - Every overlap case except X2 uses one booking.
  - An implementation that checks only `bookings[0]`, or uses `every` instead of `some`, would pass.
  - Requirement: AC4, "any … existing booking".
- **Rejections cannot show which rule fired:**
  - `canBook` returns a bare boolean, so a rejection for the wrong reason still passes a `false` row.
  - The paired true/false controls partly cover this: T01 with T13, T06 with T07, T09 with T14.
  - T02 has no matching control. The `now` rows below add one.

**3. Duplicated or low-value cases**
- **AC5 "unavailable" test:**
  - 630–690 repeats T09.
  - The `it.each` body already checks immutability on all 16 rows, including every `false` row.
  - Repair: delete this test.
- **AC5 "calling twice" test:** it adds nothing that the immutability checks and determinism of a pure function do not already cover. Delete it.
- **AC5 "available" test:**
  - Keep the 720–780 input, because it is the table's AC5 row and no other row uses it.
  - Drop the redundant `toHaveLength(1)` and `toEqual({600,660})` lines, since `toEqual(before)` covers them.
  - Fold the test into the frozen-fixture version.
- **Fixture hygiene test:** it tests the test helper, not the product. It is harmless, but optional. I would delete it, because a frozen fixture built fresh each call makes it redundant.
- **Reference checks in the table loop:** `toBe(bookingsRef)` and the per-item `toBe` are fine, but a frozen fixture makes them unnecessary.

**4. Missing boundaries**

Each row below is a new test. The defect column is what the test would catch.

| New case | Expected | Requirement | Defect it detects |
|---|---|---|---|
| 541–571 (starts one minute after now) | true | AC1 | `start > now + 1`, or a wrong comparison |
| 500–560 (starts before now) | false | AC1 | Only `start == now` is rejected, not past starts |
| 720–780 with `now = 720` | false | AC1 | Hard-coded now, or `>=` instead of `>` |
| 720–780 with `now = 719` | true | AC1 | Hard-coded now, or an off-by-one on now |
| 570–601 (overlaps by 1 minute at the front) | false | AC4 | Over-lenient overlap test, such as `end - 1` |
| 659–720 (overlaps by 1 minute at the back) | false | AC4 | Same as above, at the other edge |
| 600–630 (same start as booking) | false | AC4 | Comparison bug when starts are equal |
| 630–660 (same end as booking) | false | AC4 | Comparison bug when ends are equal |
| Bookings `[600–660, 720–780]`, request 750–770 | false | AC4 | Only the first booking is checked |
| Bookings `[600–660, 720–780]`, request 700–721 | false | AC4 | Same as above, at the second booking's edge |
| Bookings `[720–780, 600–660]` (unsorted), request 660–720 | true | AC4 | Result depends on booking order |
| Bookings `[600–620, 630–650]`, request 590–660 (70 min, spans both) | false | AC4 | Containment of several bookings missed |
| `blocked = true`, `bookings = []`, request 720–780 | false | AC3 | AC3 isolated from AC4, which is the only rule T13 cannot separate |
| 1439–1440 | true | AC1 | Day end treated as exclusive, if X1 passes only by luck |

- **Lower bound `0 ≤ start`:**
  - With `now = 540`, a start of 0 or below is already rejected by "after now", so the `0 ≤ start` clause cannot be tested separately.
  - A test is possible only if `canBook` accepts a negative `now`, for example `now = -60` with request -30–30 expecting `false`.
  - Please confirm whether negative `now` is in scope before adding it.
- **Non-integer or NaN inputs:** these are not covered by AC1–AC6, so I would add them only if the spec says so.

**5. AC6 and the AC5 display requirement**
- The suite is a pure-function unit suite. It cannot verify:
  - desktop and narrow/mobile layout;
  - understandable validation messages;
  - the "Available / Unavailable" label shown to the user.
- These need separate checks, such as a component or Playwright test at about 1280px and 375px, and a case table for messages (one message per failed rule).
- Without those checks, AC6 and the display half of AC5 have no automated coverage.

**Test repairs versus implementation fixes**
- **Test repairs:**
  - Freeze the fixture and add the unsorted multi-booking mutation test.
  - Remove the three redundant AC5 and fixture tests.
  - Add the new rows from section 4.
- **Implementation fixes:**
  - None are warranted by the output.
  - After adding the tests, any new red result would be a candidate fix in `booking.ts`.
  - Run a mutation tool such as Stryker to confirm the suite now kills the boundary and `now` mutants.

Files: `C:\Users\Рахат\Documents\se-practice\.work\p07_improve_prompt.txt` (read only; nothing was run or edited).
```

Sent in a fresh sub-agent chat, like the first prompt. Order of events, honestly: I had already written my own improved suite from my Part 4 review before this answer arrived. I then compared it with the answer. I accepted: one test per case without a table, the AC5 test on an Available request, `now` varied (R01, R02), the one-minute back overlap (R03), the second-booking overlap (R04), unsorted bookings not reordered (R05). I did not take: the deep-frozen fixture (not needed with a JSON copy compare), the front one-minute overlap, same-start/same-end and the 1439-1440 case (the first assertions already cover those through T09, T10, T12 and X1), Stryker (outside the lab), and negative `now` (no AC says `now` may be negative). Implementation fixes proposed by the answer: none, and I made none.

### 6.3 The final run

The **real** output of the final suite (`booking.test.*` beside your module), after every
change and after restoring the correct code from section 7. Every test must pass. If a real defect
is still open, leave its test failing and explain it in 9.1.

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-practice/week-07/app

 ✓ src/booking.test.ts (22 tests) 4ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  16:38:52
   Duration  467ms (transform 35ms, setup 0ms, collect 69ms, tests 4ms, environment 0ms, prepare 112ms)
```

---

## 7. Task 6 — deliberate defects

You need a reviewed, passing suite first. Then introduce **one** defect at a time in your booking
module, leave the tests unchanged, run, record, and **restore** the code. A syntax or import
error does not count as detection.

| Trial | Intentional change | Detected / Survived | Failing test ID(s) | If it survived: why, and what you added |
| --- | --- | --- | --- | --- |
| M1 | Reject duration >= 120 instead of > 120 | Detected | T06, X1 | T06 is the planned detection; X1 (1320-1440, exactly 120 minutes) fails too. |
| M2 | Treat touching endpoints as an overlap | Detected | T01, T08, X2, R05 | Touching cases fail as planned; R05 fails because its request touches the first booking. |
| M3 | Remove the blocked-room rejection | Detected | T13 | T13 (660-720 with blocked = true) is the only test with `blocked = true`, so it is the only one that can see M3. |

**The run of each mutant, pasted unedited.** Paste the `Tests` summary line and the failing test
names at least:

```text
M1 (`end - start > 120` changed to `>= 120`):
 RUN  v3.2.4 C:/Users/Рахат/Documents/se-practice/week-07/app
   × AC1 valid time > X1 AC1: ending exactly at 24:00 (1320-1440, 120 minutes) is Available 4ms
   × AC2 maximum duration > T06 AC2: exactly 120 minutes (720-840) is Available 0ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/booking.test.ts > AC1 valid time > X1 AC1: ending exactly at 24:00 (1320-1440, 120 minutes) is Available
AssertionError: expected false to be true // Object.is equality
 FAIL  src/booking.test.ts > AC2 maximum duration > T06 AC2: exactly 120 minutes (720-840) is Available
AssertionError: expected false to be true // Object.is equality
      Tests  2 failed | 20 passed (22)

M2 (`start < b.end && end > b.start` changed to `<=` and `>=`):
 RUN  v3.2.4 C:/Users/Рахат/Documents/se-practice/week-07/app
   × AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available 5ms
   × AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available 0ms
   × AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available 0ms
   × AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call 0ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/booking.test.ts > AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available
AssertionError: expected false to be true // Object.is equality
 FAIL  src/booking.test.ts > AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available
AssertionError: expected false to be true // Object.is equality
 FAIL  src/booking.test.ts > AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available
AssertionError: expected false to be true // Object.is equality
 FAIL  src/booking.test.ts > AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call
AssertionError: expected false to be true // Object.is equality
      Tests  4 failed | 18 passed (22)

M3 (the `else if (blocked) ok = false;` line removed):
 RUN  v3.2.4 C:/Users/Рахат/Documents/se-practice/week-07/app
   × AC3 blocked room > T13 AC3: a blocked room is Unavailable even for a touching request (660-720) 4ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/booking.test.ts > AC3 blocked room > T13 AC3: a blocked room is Unavailable even for a touching request (660-720)
AssertionError: expected true to be false // Object.is equality
      Tests  1 failed | 21 passed (22)
```

Each mutant was run on the final suite of 22 tests and the file was restored with `git checkout -- app/src/booking.ts` afterwards (`git status` showed no change in `booking.ts`). The lines are filtered from the Vitest output (RUN, failing names, assertion lines and the Tests line). All three changes reverted, and the full suite run again (section 6.3): yes

---

## 8. Task 7 — manual UI checks

Use `now = 09:00` and an existing `10:00–11:00` booking. Do them in the page in a browser. Save a
screenshot of each as `evidence/ui-1.png` … `evidence/ui-5.png`. Take **ui-4 at phone width**
(about 375 px, portrait).

| # | Action | Expected observation | AC | What I observed | Pass / Fail / Not testable |
| --- | --- | --- | --- | --- | --- |
| U1 | Check 11:00–12:00, unblocked | Available, with the fixed sample booking | AC5 | Pressed Check with the defaults (now 09:00, start 11:00, end 12:00, room A-101, not blocked). The page showed Available and listed the booking 10:00–11:00. | Pass |
| U2 | Enable blocked, then check again | Unavailable replaces the earlier result | AC3, AC5 | Ticked Room blocked and pressed Check again. The page showed Unavailable instead of the earlier Available (one result line, not two). | Pass |
| U3 | Clear a required input and submit | Understandable validation feedback | AC6 | Cleared the Start time input and pressed Check. The page showed "Fill in the current time, the start and the end." and no result line. | Pass |
| U4 | Use a narrow (phone) width | Controls and result remain usable | AC6 | Opened the page at 375 x 812 (portrait) and pressed Check. All fields stack in one column, the button and the Available result are visible, and the page has no horizontal scroll (scrollWidth 375). | Pass |
| U5 | Repeat the checks on the same data | Existing bookings remain unchanged | AC5 | Pressed Check three times on the same data. The result stayed Available and the bookings list still showed only 10:00–11:00. | Pass |

---

## 9. Comparison and what still fails

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| none | all 33 checks PASS when the checker runs on a clean checkout. On my laptop A4 shows FAIL only while the git-ignored `app/node_modules/` folder is present; it is not committed. |

### 9.2 Original and improved suites

| Measure | First suite | Improved suite |
| --- | --- | --- |
| Executed / passed / failed | 20 / 20 / 0 | 22 / 22 / 0 |
| Requirements with meaningful tests (AC IDs and gaps) | AC1–AC5 covered, but only through a table, `now` fixed at 540, one booking in every overlap case; AC5 asserted on 16 rows including rejected ones | AC1–AC5 with exact decisions, `now` varied (R01, R02), second-booking overlap (R04), AC5 on an Available request and on unsorted bookings (R05); gap: AC6 and `0 ≤ start` are not reachable by a unit test |
| Selected mutants detected | not run on the first suite (I ran M1–M3 only on the final suite) | 3 of 3 (M1: T06, X1; M2: T01, T08, X2, R05; M3: T13) |
| Accepted / revised / rejected tests | (the first suite, review in section 5) 2 accepted, 4 revised, 2 rejected decisions | 22 tests, each with its ID in the title |
| Remaining limitations | (the checker counts 4 `it()` calls here, Vitest ran 20 because `it.each` expands 16 rows) uses `it.each`, which the rules forbid; no separate T-names | AC6 (feedback on desktop and phone) is only checked by hand; `canBook` is true/false so a wrong reason for a rejection cannot be seen |

### 9.3 What no AC decides

Call your function with `bookings = [{ start: 700, end: 650 }]` (a reversed existing booking)
and a request of 660–720. What does it return? Does any AC say what it should return? (This is
the value you declare in `submission.yml` under `assumptions.invalid_existing_booking`.)

- It returns `true`. The reversed existing booking `{ start: 700, end: 650 }` is silently ignored, because `660 < 650` is false so the overlap condition never holds. I checked it by calling the function (`node --experimental-strip-types`) and it printed `true`. No AC says what an invalid existing booking should do: AC4 talks about overlapping "an existing booking" and does not say the existing data must be valid. I declare `returns-true` and I do not put it in a test, because a test would copy the current output of the code (the deck's weak test *expected = current output*). The risk is that a corrupted booking could hide a real conflict; a later requirement should say whether canBook must reject such a list.

---

## 10. Conclusion (120–180 words)

<!-- Answer all three in your own words, without the assistant:
     (a) Which mistake in the FIRST suite would have let a wrong canBook pass, and how did you find it?
     (b) What does your final green run prove, and what does it NOT prove? Use a mutant or a UI check.
     (c) One testing limitation that remains.
     Worthless: "The AI wrote good tests and they all passed."
     Worth everything: "The first suite expected T06 (exactly 120 minutes) to be rejected. That
     contradicts AC2, and it failed on a correct canBook. If I had changed the code to make it
     pass, M1 would have become the real behaviour." -->

The first suite looked fine: 20 of 20 green, and I recomputed every expected value from AC1–AC4 and found none wrong. Its mistake was in the shape: one `it.each` loop, `now` always 540 and one booking in every overlap case. A `canBook` that ignored the supplied `now`, or checked only the first booking, would have stayed green, so I added R01, R02 and R04. My final 22-test run proves AC1–AC5 for those inputs, and the three mutants show it: M1 broke T06 and X1, M2 broke T01, T08, X2 and R05, M3 broke T13 only. It does not prove AC6: only my five manual checks looked at the page, and the unit tests cannot see layout. A limitation that remains: `canBook` returns a bare boolean, so a request rejected for the wrong reason still passes any `false` test.

# Week 08 — Lab report

**Name:** Baimbetov Rakhat (24B030286)
**Group:** Monday 16:00-19:00
**Date:** 2026-11-21

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Assistant I debugged with (tool) | Claude (Claude Code session; the two diagnosis chats were fresh sub-agent chats with no tools) |
| Exact model (with its version, or `not displayed`) | claude-sonnet-5-5 (Claude Sonnet 5.5) |
| Where the skill was installed (ChatGPT / Claude web / Claude Code / prompt-only simulation) | prompt-only simulation (the sub-agent chats have no skill loader, so the text of SKILL.md was pasted as the first part of the message) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | my computer (Windows 11, Node 24.13.1) |
| Vitest version (the `RUN  v…` line of a run) | 3.2.4 |
| Language of my booking module (`ts` or `js`) — the file I copied from `buggy/` | ts (`buggy/booking.ts`) |

---

## 2. Task 1 — baseline, buggy code, failing tests

### 2.1 My Week 07 suite on my own code

The **real** output of your Week 07 suite, run in `week-08/app/` **before** you replace
anything. It should be green. If it is not, say why under the block.

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app

 ✓ src/booking.test.ts (22 tests) 4ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  16:40:53
   Duration  991ms (transform 38ms, setup 0ms, collect 79ms, tests 4ms, environment 0ms, prepare 534ms)
```

### 2.2 The same suite on the provided canBook

You copied the whole `canBook` function from `buggy/booking.ts` (or `.js`) over yours and changed
nothing else. This is the real output:

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app

 ❯ src/booking.test.ts (22 tests | 5 failed) 10ms
   ✓ AC1 valid time > T02 AC1: a request that starts exactly now (540-570) is Unavailable 1ms
   ✓ AC1 valid time > T03 AC1: zero duration (720-720) is Unavailable 0ms
   ✓ AC1 valid time > T04 AC1: reversed interval (750-720) is Unavailable 0ms
   ✓ AC1 valid time > T05 AC1: an end past the day (1380-1441) is Unavailable 0ms
   ✓ AC1 valid time > R01 AC1: a request that starts one minute after now (now 719, 720-780) is Available 0ms
   ✓ AC1 valid time > R02 AC1: the same request is Unavailable when now is 720 (the supplied now decides, not a fixed 540) 0ms
   ✓ AC1 valid time > X1 AC1: ending exactly at 24:00 (1320-1440, 120 minutes) is Available 0ms
   ✓ AC2 maximum duration > T06 AC2: exactly 120 minutes (720-840) is Available 0ms
   ✓ AC2 maximum duration > T07 AC2: 121 minutes (720-841) is Unavailable 0ms
   ✓ AC3 blocked room > T13 AC3: a blocked room is Unavailable even for a touching request (660-720) 0ms
   × AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available 5ms
     → expected false to be true // Object.is equality
   × AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available 0ms
     → expected false to be true // Object.is equality
   ✓ AC4 overlaps and touching > T09 AC4: a partial overlap (630-690) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T10 AC4: a request that contains the booking (570-690) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T11 AC4: a request inside the booking (615-645) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T12 AC4: an identical interval (600-660) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T14 AC4: the same 630-690 request is Available when there are no bookings 0ms
   ✓ AC4 overlaps and touching > R03 AC4: overlapping the booking by one minute at the back (659-720) is Unavailable 0ms
   ✓ AC4 overlaps and touching > R04 AC4: with two bookings, overlapping only the second one (750-770) is Unavailable 0ms
   × AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available 0ms
     → expected false to be true // Object.is equality
   × AC5 data is not changed > AC5: an Available request (720-780) leaves the bookings equal to a copy taken before 1ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality
   × AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call 0ms
     → expected false to be true // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:60:27
     58| describe('AC4 overlaps and touching', () => {
     59|   test('T01 AC4: touching after the booking (660-720) is Available', (…
     60|     expect(ask(660, 720)).toBe(true);
       |                           ^
     61|   });
     62|   test('T08 AC4: touching before the booking (570-600) is Available', …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:63:27
     61|   });
     62|   test('T08 AC4: touching before the booking (570-600) is Available', …
     63|     expect(ask(570, 600)).toBe(true);
       |                           ^
     64|   });
     65|   test('T09 AC4: a partial overlap (630-690) is Unavailable', () => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:87:95
     85|   });
     86|   test('X2 AC4: a request touching two bookings (660-720 between 600-6…
     87|     expect(ask(660, 720, { bookings: [{ start: 600, end: 660 }, { star…
       |                                                                                               ^
     88|   });
     89| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  src/booking.test.ts > AC5 data is not changed > AC5: an Available request (720-780) leaves the bookings equal to a copy taken before
AssertionError: expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":720,"end":780}]"

 ❯ src/booking.test.ts:97:43
     95|     const decision = canBook({ start: 720, end: 780, ...data });
     96|     expect(decision).toBe(true);
     97|     expect(JSON.stringify(data.bookings)).toBe(before);
       |                                           ^
     98|     expect(data.bookings).toHaveLength(1);
     99|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  src/booking.test.ts > AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:104:56
    102|     const data = fixture({ bookings: [{ start: 720, end: 780 }, { star…
    103|     const before = JSON.stringify(data.bookings);
    104|     expect(canBook({ start: 660, end: 720, ...data })).toBe(true);
       |                                                        ^
    105|     expect(JSON.stringify(data.bookings)).toBe(before);
    106|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 17 passed (22)
   Start at  16:41:02
   Duration  545ms (transform 45ms, setup 0ms, collect 71ms, tests 10ms, environment 0ms, prepare 143ms)
```

### 2.3 One failing test per bug

Add the two regression tests from README Part 1, step 5: one named `BUG-A` and one named `BUG-B`.
Run them **on the buggy code**. Both must fail here. That is the evidence that each test can see
its bug.

```text

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app

 ❯ src/booking.test.ts (24 tests | 7 failed) 10ms
   ✓ AC1 valid time > T02 AC1: a request that starts exactly now (540-570) is Unavailable 1ms
   ✓ AC1 valid time > T03 AC1: zero duration (720-720) is Unavailable 0ms
   ✓ AC1 valid time > T04 AC1: reversed interval (750-720) is Unavailable 0ms
   ✓ AC1 valid time > T05 AC1: an end past the day (1380-1441) is Unavailable 0ms
   ✓ AC1 valid time > R01 AC1: a request that starts one minute after now (now 719, 720-780) is Available 0ms
   ✓ AC1 valid time > R02 AC1: the same request is Unavailable when now is 720 (the supplied now decides, not a fixed 540) 0ms
   ✓ AC1 valid time > X1 AC1: ending exactly at 24:00 (1320-1440, 120 minutes) is Available 0ms
   ✓ AC2 maximum duration > T06 AC2: exactly 120 minutes (720-840) is Available 0ms
   ✓ AC2 maximum duration > T07 AC2: 121 minutes (720-841) is Unavailable 0ms
   ✓ AC3 blocked room > T13 AC3: a blocked room is Unavailable even for a touching request (660-720) 0ms
   × AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available 4ms
     → expected false to be true // Object.is equality
   × AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available 0ms
     → expected false to be true // Object.is equality
   ✓ AC4 overlaps and touching > T09 AC4: a partial overlap (630-690) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T10 AC4: a request that contains the booking (570-690) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T11 AC4: a request inside the booking (615-645) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T12 AC4: an identical interval (600-660) is Unavailable 0ms
   ✓ AC4 overlaps and touching > T14 AC4: the same 630-690 request is Available when there are no bookings 0ms
   ✓ AC4 overlaps and touching > R03 AC4: overlapping the booking by one minute at the back (659-720) is Unavailable 0ms
   ✓ AC4 overlaps and touching > R04 AC4: with two bookings, overlapping only the second one (750-770) is Unavailable 0ms
   × AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available 0ms
     → expected false to be true // Object.is equality
   × AC5 data is not changed > AC5: an Available request (720-780) leaves the bookings equal to a copy taken before 1ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality
   × AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call 0ms
     → expected false to be true // Object.is equality
   × Practice 08 regression tests > BUG-A AC4: a request touching bookings on both sides (600-660 between 540-600 and 660-720) is Available 0ms
     → expected false to be true // Object.is equality
   × Practice 08 regression tests > BUG-B AC5: an Available request that touches nothing (720-780) leaves the bookings equal to a copy 0ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:60:27
     58| describe('AC4 overlaps and touching', () => {
     59|   test('T01 AC4: touching after the booking (660-720) is Available', (…
     60|     expect(ask(660, 720)).toBe(true);
       |                           ^
     61|   });
     62|   test('T08 AC4: touching before the booking (570-600) is Available', …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > T08 AC4: touching before the booking (570-600) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:63:27
     61|   });
     62|   test('T08 AC4: touching before the booking (570-600) is Available', …
     63|     expect(ask(570, 600)).toBe(true);
       |                           ^
     64|   });
     65|   test('T09 AC4: a partial overlap (630-690) is Unavailable', () => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  src/booking.test.ts > AC4 overlaps and touching > X2 AC4: a request touching two bookings (660-720 between 600-660 and 720-780) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:87:95
     85|   });
     86|   test('X2 AC4: a request touching two bookings (660-720 between 600-6…
     87|     expect(ask(660, 720, { bookings: [{ start: 600, end: 660 }, { star…
       |                                                                                               ^
     88|   });
     89| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  src/booking.test.ts > AC5 data is not changed > AC5: an Available request (720-780) leaves the bookings equal to a copy taken before
AssertionError: expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":720,"end":780}]"

 ❯ src/booking.test.ts:97:43
     95|     const decision = canBook({ start: 720, end: 780, ...data });
     96|     expect(decision).toBe(true);
     97|     expect(JSON.stringify(data.bookings)).toBe(before);
       |                                           ^
     98|     expect(data.bookings).toHaveLength(1);
     99|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  src/booking.test.ts > AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:104:56
    102|     const data = fixture({ bookings: [{ start: 720, end: 780 }, { star…
    103|     const before = JSON.stringify(data.bookings);
    104|     expect(canBook({ start: 660, end: 720, ...data })).toBe(true);
       |                                                        ^
    105|     expect(JSON.stringify(data.bookings)).toBe(before);
    106|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  src/booking.test.ts > Practice 08 regression tests > BUG-A AC4: a request touching bookings on both sides (600-660 between 540-600 and 660-720) is Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:111:95
    109| describe('Practice 08 regression tests', () => {
    110|   test('BUG-A AC4: a request touching bookings on both sides (600-660 …
    111|     expect(ask(600, 660, { bookings: [{ start: 540, end: 600 }, { star…
       |                                                                                               ^
    112|   });
    113|   test('BUG-B AC5: an Available request that touches nothing (720-780)…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  src/booking.test.ts > Practice 08 regression tests > BUG-B AC5: an Available request that touches nothing (720-780) leaves the bookings equal to a copy
AssertionError: expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":720,"end":780}]"

 ❯ src/booking.test.ts:117:43
    115|     const before = JSON.stringify(data.bookings);
    116|     expect(canBook({ start: 720, end: 780, ...data })).toBe(true);
    117|     expect(JSON.stringify(data.bookings)).toBe(before);
       |                                           ^
    118|   });
    119| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 17 passed (24)
   Start at  16:41:13
   Duration  514ms (transform 40ms, setup 0ms, collect 73ms, tests 10ms, environment 0ms, prepare 135ms)
```

The two new tests are `BUG-A AC4: a request touching bookings on both sides (600-660 between 540-600 and 660-720)` and `BUG-B AC5: an Available request that touches nothing (720-780) leaves the bookings equal to a copy`. Both fail here (7 failed, 17 passed, 24 in all).

---

## 3. Defect log

One row per defect. At least **BUG-A and BUG-B**. "Suspected cause" is your hypothesis
**before** you ask any assistant: the line and why.

| Defect | Test ID | Input | Expected | Actual | Suspected cause (line and why) |
| --- | --- | --- | --- | --- | --- |
| BUG-A | T01 (also T08, X2, and the new BUG-A test) | request 660-720, default fixture (booking 600-660) | Available (`true`): the intervals only touch at 660 | `false` (Unavailable) | In the loop of `canBook`: `if (start <= b.end && end >= b.start) return false;`. With `<=` and `>=`, 660 <= 660 is true, so a request that only touches the booking counts as an overlap. AC4 allows touching, so the comparison must be strict (`<` and `>`). |
| BUG-B | AC5 test and the new BUG-B test (request 720-780 touches nothing) | 720-780, default fixture | `true`, and bookings still `[600-660]` | `true`, but bookings became `[600-660, 720-780]` | The line `bookings.push({ start, end });` right before `return true`. It writes the free slot into the caller's array, so the data changes (AC5). The comment above it ("keep the room's list current") is the reason it was added. R05 also fails, but for BUG-A: its request 660-720 touches a booking, so it returns `false` before the push is reached and BUG-B stays hidden there until BUG-A is fixed. |

---

## 4. Tasks 2–3 — the skill

**The checks from the deck, before you zip it.** Answer each one yes / no:

| Check | yes / no |
| --- | --- |
| The file is plain UTF-8 text, named exactly `SKILL.md` (not `SKILL.md.txt`) | yes |
| The first and the closing YAML delimiter are exactly three hyphens: `---` | yes |
| `name` is lowercase with hyphens, and `description` says WHEN to use it | yes |
| I read the whole file once: no passwords, API keys or private student data | yes |

**The contents of `skills/bug-detector.zip`.** Paste the listing (Windows: open the ZIP and copy
the paths; macOS/Linux: `unzip -l skills/bug-detector.zip`):

```text
bug-detector/SKILL.md
```

**Installation.** Where you uploaded it, what the upload said, and whether a new chat showed the
skill as enabled. If upload was not available, write `prompt-only simulation` and say why.
Screenshot of the result: `evidence/install.png`.

<!-- Write below this line -->

SKILL.md was written into `skills/bug-detector/SKILL.md` as the deck's text, word for word, and zipped with Python's `zipfile` (`skills/bug-detector.zip` holds only `bug-detector/SKILL.md`, the same bytes as the committed file). The text was not generated by a model; the Claude Code assistant wrote the deck's text into the file, so it is not "typed by me".

Installation: I did not upload it anywhere. I run in Claude Code in a scratch session and the two diagnosis chats were sub-agent chats that have no skill loader and no skill badge, so I used the deck's fallback: a **prompt-only simulation**, declared as `skill.environment: prompt-only`. `evidence/install.png` is a rendering (HTML rendered by Edge) of the real message text of chat 2, showing the SKILL.md text and the skill question. It is not a screenshot of a skills screen, and I say so on the image.

---

## 5. Task 4 — without the skill

A **fresh chat, with no skill enabled**. Paste exactly what you sent: the deck's question, then
the same input you will use in section 6 (AC1–AC6, the failing test output, the code of
`canBook`):

```text
Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.

Acceptance criteria:
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Preserve clear UI feedback on desktop and mobile.

Failing test (Vitest 3.2.4, default fixture now = 540, blocked = false, bookings = [{ start: 600, end: 660 }]):
 FAIL  src/booking.test.ts > AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available
AssertionError: expected false to be true // Object.is equality
- Expected
+ Received
- true
+ false
 ❯ src/booking.test.ts:60:27
     60|     expect(ask(660, 720)).toBe(true);
       |                           ^

Code of canBook (src/booking.ts):
export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start <= b.end && end >= b.start) return false;
  }
  // keep the room's list current with the slot that was just found free
  bookings.push({ start, end });
  return true;
}
```

**The assistant's answer, pasted unedited:**

```text
**Root cause**

The overlap check in `canBook` uses inclusive comparisons:

    if (start <= b.end && end >= b.start) return false;

With the existing booking {600, 660} and a request of 660-720, `start (660) <= b.end (660)` is true and `end (720) >= b.start (600)` is true. The touching slot is therefore rejected as an overlap. That is the `false` the test received. The test is correct under AC4, which allows bookings that only touch at endpoints. Intervals are half-open [start, end), so the correct overlap test is strict.

**A second defect (violates AC5)**

`canBook` ends with `bookings.push({ start, end })`. A query that should only answer Available / Unavailable mutates the caller's data. Two consequences:
- Asking `ask(660, 720)` twice returns true, then false, because the first call inserted the slot. This makes tests order-dependent and flaky.
- The function is supposed to be a pure check. Booking should be a separate, explicit step.

The failing test only hits the first defect, but the second would break the very next assertion for the same slot.

**Minimal patch (src/booking.ts)**

    -  for (const b of bookings) {
    -    if (start <= b.end && end >= b.start) return false;
    -  }
    -  // keep the room's list current with the slot that was just found free
    -  bookings.push({ start, end });
    -  return true;
    +  for (const b of bookings) {
    +    if (start < b.end && end > b.start) return false;
    +  }
    +  return true;

The other checks match the criteria and should stay as they are:
- AC1: `start < end`, `start > now` (strictly in the future), and 0 <= start, end <= 1440.
- AC2: `end - start > 120` is rejected, so exactly 120 is allowed.
- AC3: `blocked` is rejected.

If something relied on the push to record bookings, move it into a separate `addBooking(bookings, slot)` function that the caller invokes after a successful `canBook`. The UI layer must call it only on confirmed booking, not on availability checks.

**Regression tests (src/booking.test.ts, Vitest)**

    describe("AC4/AC5 overlaps, touching, purity", () => {
      const base = { now: 540, blocked: false };
      const mk = () => [{ start: 600, end: 660 }];
      const ask = (s: number, e: number, b = mk()) =>
        canBook({ ...base, start: s, end: e, bookings: b });

      it("touching after is Available", () => expect(ask(660, 720)).toBe(true));
      it("touching before is Available", () => expect(ask(540 + 1, 600)).toBe(true));
      it("partial overlap start is Unavailable", () => expect(ask(630, 690)).toBe(false));
      it("partial overlap end is Unavailable", () => expect(ask(570, 630)).toBe(false));
      it("fully inside is Unavailable", () => expect(ask(610, 650)).toBe(false));
      it("fully containing is Unavailable", () => expect(ask(590, 670)).toBe(false));
      it("identical slot is Unavailable", () => expect(ask(600, 660)).toBe(false));

      it("does not mutate bookings (AC5)", () => {
        const b = mk();
        const snapshot = structuredClone(b);
        ask(660, 720, b);
        ask(660, 720, b);
        expect(b).toEqual(snapshot);
        expect(ask(660, 720, b)).toBe(true); // repeatable result
      });
    });

Boundary tests for the other criteria, to guard against regressions from future edits:
- AC1: start == end, start > end, and start == now are all false. start == now + 1 is true.
- AC2: a duration of 120 is true. A duration of 121 is false.
- AC3: `blocked: true` returns false even for a free slot.

**AC6 (UI feedback)**

The UI needs no change for this fix. After the patch, the Available / Unavailable label is derived from the pure boolean, so it no longer flips on re-check. Verify manually or with a component test that the message renders at desktop and mobile widths. I haven't seen the UI code, so I can't confirm that part.

No code was edited.
```

The chat was a fresh sub-agent chat with no skill and no tools (one harness line only said not to use tools). It found both bugs.

---

## 6. Task 5 — with the skill

**Another fresh chat, with `bug-detector` enabled.** Send exactly the same input as in section 5.
Only the question changes, to the deck's skill question:

```text
Use the bug-detector skill to diagnose the failed room-booking test.

Acceptance criteria:
AC1 Reject start >= end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Preserve clear UI feedback on desktop and mobile.

Failing test (Vitest 3.2.4, default fixture now = 540, blocked = false, bookings = [{ start: 600, end: 660 }]):
 FAIL  src/booking.test.ts > AC4 overlaps and touching > T01 AC4: touching after the booking (660-720) is Available
AssertionError: expected false to be true // Object.is equality
- Expected
+ Received
- true
+ false
 ❯ src/booking.test.ts:60:27
     60|     expect(ask(660, 720)).toBe(true);
       |                           ^

Code of canBook (src/booking.ts):
export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start <= b.end && end >= b.start) return false;
  }
  // keep the room's list current with the slot that was just found free
  bookings.push({ start, end });
  return true;
}
```

**The assistant's answer, pasted unedited:**

```text
**Bug-detector diagnosis: failed test T01 (AC4, touching after the booking)**

**1. Reproduction (smallest deterministic input)**
Fixture: now=540, blocked=false, bookings=[{600,660}]. The call is canBook({start:660, end:720, ...}).
- AC1: 0<=660<720<=1440 and 660>540, so it passes.
- AC2: duration is 60, which is within 120, so it passes.
- AC3: not blocked, so it passes.
- AC4 loop: `660 <= 660` is true and `720 >= 600` is true, so it returns false. The test expects true. This matches the failure at line 60.

**2. Confirmed defects**

| # | Defect | Evidence | Root cause | Fix | Test |
|---|---|---|---|---|---|
| 1 | Bookings that only touch at an endpoint are rejected as overlaps (violates AC4) | T01 fails: expected true, received false. The input 660-720 against 600-660 traces to `return false` in the loop. | The overlap check uses inclusive comparisons: `start <= b.end && end >= b.start`. Intervals are half-open, so touching is not an overlap. | Use strict comparisons: `if (start < b.end && end > b.start) return false;` | See below. |
| 2 | `canBook` mutates the booking list (violates AC5: "without changing booking data") | The line `bookings.push({ start, end })` runs on every success. This is visible in the code, so it is confirmed by inspection even though no test has failed on it yet. | A side effect is mixed into a query function. The comment "keep the room's list current" shows it was intentional but wrong for this contract. | Delete the push. Booking should happen in a separate function that is only called on confirmation. | See below. |

**3. Hypotheses (not confirmed from the evidence given)**
- Defect 2 can corrupt later tests if the fixture's `bookings` array is shared across tests. A passing "Available" call would silently add a booking, so a repeated call or a later test could then see "Unavailable". I can't confirm this without seeing the test file. It would explain flaky or order-dependent failures.
- AC1 says to reject "requests in the past". `start > now` also rejects start == now. That is probably acceptable, but it depends on whether "now" counts as the past. Check the intended meaning with the spec owner.
- AC6 (UI feedback on desktop and mobile) is not covered by this code or this failure. No conclusion is possible.
- Other checks look correct: the start/end ordering and bounds, the 120-minute cap (`>` allows exactly 120), and the blocked check.

**4. Minimal fix (proposed only; no code edited)**
```ts
for (const b of bookings) {
  if (start < b.end && end > b.start) return false;
}
return true; // no bookings.push
```

**5. Regression tests and expected results**
Use the fixture bookings=[{600,660}] and now=540.
- ask(660,720) returns true. This is the failing T01 and should now pass.
- ask(540,600) returns true. The booking touches at the start, and start 540 is not greater than now 540, so this one actually fails AC1. Use ask(545,600) instead, which should return true.
- ask(630,690) returns false (real overlap).
- ask(600,660) returns false (exact duplicate).
- ask(610,650) returns false (contained inside the booking).
- AC5 non-mutation: take a snapshot with `structuredClone(bookings)`, call ask(660,720), and expect bookings to still equal the snapshot (length 1). Then call ask(660,720) a second time and expect true again, which proves idempotence. This test fails today because of defect 2.

**Priority:** fix defect 1 to make T01 pass. Fix defect 2 as well, because it breaks AC5 and risks cross-test contamination.
```

In chat 2 the message started with the full text of `SKILL.md` (as PART 1, labelled a prompt-only simulation) and then the question above with the input of section 5, unchanged.

Did the environment show that the skill was invoked? not shown (prompt-only simulation: there is no badge; the answer did follow the seven steps and the output table of SKILL.md)

---

## 7. Comparison — judged against the actual code

Do not assume the skill did better. Judge both answers against the code and against what your
tests showed. Write a short verdict in each cell, and give a reason where they differ.

| Criterion | No skill | With skill |
| --- | --- | --- |
| Correct root cause | Yes for both: `<=`/`>=` at `start <= b.end && end >= b.start` (BUG-A) and `bookings.push` (BUG-B), as my fixes confirmed. | Yes for both, same lines, in a table with evidence for each. |
| Reproducible test | Yes: a full test block. `ask(540 + 1, 600)` is a valid touching-before case, and the non-mutation test with `structuredClone` is right. Its regression test would fail on the buggy code and pass after the fix. | Yes: inputs with expected results. It noticed by itself that `ask(540,600)` would fail AC1 (start == now) and replaced it with `ask(545,600)`. Its AC5 test "fails today because of defect 2": my BUG-B test did fail. |
| Minimal proposed patch | One patch that fixes both bugs together (4 lines changed or removed). Correct against the code, but it merges two bugs and adds an optional `addBooking` helper that nobody asked for. | One fix per defect in its table: strict comparison for BUG-A, delete the push for BUG-B. Closer to the "one minimal change per bug" rule. |
| Unsupported claims | "Asking `ask(660, 720)` twice returns true, then false": on the provided code both calls return false because BUG-A rejects first; true-then-false only appears after BUG-A is fixed. "Tests order-dependent and flaky": my fixtures are fresh for every test, so no flakiness exists. | It said BUG-B is "confirmed by inspection" (fair: the line is in the code). Its hypotheses are marked as hypotheses: shared fixtures (false for my suite) and `start == now` (not a defect, T02/AC1 decide it). Nothing is claimed as fact that the code does not show. |
| Clarity of explanation | Clear prose, root cause first, but the two bugs and the test advice are mixed in one flow. | Clearer: numbered steps, a defect table, confirmed defects separated from hypotheses. A little longer. |

**Which bugs did each answer find?** (BUG-A, BUG-B, both, neither)

- No skill: both. With skill: both. BUG-B was visible by reading the code in both chats, because the whole function was in the input, so the skill did not find anything the plain prompt missed. What differed: the skill answer kept confirmed defects and hypotheses apart (step 4) and gave one fix per defect; the plain answer made two small unsupported claims about flakiness. My own tests showed the same two defects: T01, T08, X2 and BUG-A (BUG-A), AC5 and BUG-B (BUG-B), and R05 failed first for BUG-A and then for BUG-B.

---

## 8. Task 6 — repair and regression

Review the proposed patch yourself, then make **one minimal change per bug**, one commit each.
Rerun the test that was failing, then the full suite.

### 8.1 The BUG-A patch

The change as a diff (`git diff`, or the old and the new line), then the real run:

```text
diff --git a/week-08/app/src/booking.ts b/week-08/app/src/booking.ts
index d11f2b6..1c81e68 100644
--- a/week-08/app/src/booking.ts
+++ b/week-08/app/src/booking.ts
@@ -22,7 +22,7 @@ export function canBook({ start, end, now, blocked, bookings }: {
   if (end - start > 120) return false;
   if (blocked) return false;
   for (const b of bookings) {
-    if (start <= b.end && end >= b.start) return false;
+    if (start < b.end && end > b.start) return false;
   }
   // keep the room's list current with the slot that was just found free
   bookings.push({ start, end });

$ npx vitest run -t "BUG-A" (the test that was failing first), then the full suite
 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app
 ✓ src/booking.test.ts (24 tests | 23 skipped) 1ms
 Test Files  1 passed (1)
      Tests  1 passed | 23 skipped (24)
--- full suite after BUG-A fix only
 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app
   × AC5 data is not changed > AC5: an Available request (720-780) leaves the bookings equal to a copy taken before 4ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality
   × AC5 data is not changed > R05 AC5: unsorted bookings are not reordered by the call 0ms
     → expected '[{"start":720,"end":780},{"start":600…' to be '[{"start":720,"end":780},{"start":600…' // Object.is equality
   × Practice 08 regression tests > BUG-B AC5: an Available request that touches nothing (720-780) leaves the bookings equal to a copy 0ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯
      Tests  3 failed | 21 passed (24)
```

Commit `week-08: fix BUG-A (strict overlap comparison)`. One line changed. The full suite still has 3 failures after this fix, and they are the BUG-B ones: the AC5 test, R05 and the BUG-B test. R05 failed for BUG-A before; now it fails for BUG-B, which is the hidden second bug.

### 8.2 The BUG-B patch and the final run

The change as a diff, then the real output of the **full** suite. Every test must pass.

```text
diff --git a/week-08/app/src/booking.ts b/week-08/app/src/booking.ts
index 1c81e68..c0f3aa5 100644
--- a/week-08/app/src/booking.ts
+++ b/week-08/app/src/booking.ts
@@ -24,7 +24,5 @@ export function canBook({ start, end, now, blocked, bookings }: {
   for (const b of bookings) {
     if (start < b.end && end > b.start) return false;
   }
-  // keep the room's list current with the slot that was just found free
-  bookings.push({ start, end });
   return true;
 }

$ npx vitest run

 RUN  v3.2.4 C:/Users/Рахат/Documents/se-wt/week-08/week-08/app

 ✓ src/booking.test.ts (24 tests) 3ms

 Test Files  1 passed (1)
      Tests  24 passed (24)
   Start at  16:42:35
   Duration  492ms (transform 37ms, setup 0ms, collect 67ms, tests 3ms, environment 0ms, prepare 132ms)
```

Commit `week-08: fix BUG-B (canBook no longer pushes into bookings)`. I removed the `bookings.push` line together with the comment that justified it, so the comment would not lie. All 24 tests pass: T01-T14, X1, X2, R01-R05, AC5, BUG-A and BUG-B.

---

## 9. What still fails, and what AI-assisted debugging cannot do

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| none | the checker is expected to give 31 PASS on a clean checkout (the local `node_modules/` folder makes B6 fail until it is moved away, and it is not committed) |

### 9.2 One limitation of AI-assisted debugging

<!-- Use something that actually happened in sections 5-8. 20 words or more. -->
- In chat 1 the assistant said `ask(660, 720)` would return true and then false on a second call, but on the provided code it returns false both times because BUG-A rejects the request before the push. It described a state that exists only after a partial fix, with the same confident tone as its correct findings, so I could only tell by running my tests: R05 failed for BUG-A first and for BUG-B only after the first fix.

---

## 10. Conclusion (80–150 words)

<!-- Answer both, in your own words, without the assistant (3-5 sentences, as the deck asks):
     (a) Did the skill help? Show it with one row of section 7.
     (b) What did your tests actually prove - and what did they not?
     Worthless: "The skill made the AI much better at debugging."
     Worth everything: "Both answers found BUG-A from the T01 failure. Only the skill answer
     separated BUG-B as a hypothesis instead of a fact, because step 4 told it to. BUG-B was only
     visible after the BUG-A patch: the AC5 test had been failing for the wrong reason." -->

The skill did not find more bugs: both chats found BUG-A and BUG-B because the whole function was in the input, so reading it was enough (section 7, "Correct root cause"). It helped with form, not with correctness: it separated confirmed defects from hypotheses and gave one fix per defect, while the plain answer merged them and made a claim about flaky tests that my fresh fixtures contradict. My tests proved more than either chat: T01, T08, X2 and BUG-A showed BUG-A, the BUG-B test showed BUG-B, and R05 showed that one bug hides another until the first fix. They did not prove AC6, and they cannot show whether the skill would help on a bug that is not visible in the code.

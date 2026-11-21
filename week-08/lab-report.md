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
(paste here)
```

**Installation.** Where you uploaded it, what the upload said, and whether a new chat showed the
skill as enabled. If upload was not available, write `prompt-only simulation` and say why.
Screenshot of the result: `evidence/install.png`.

<!-- Write below this line -->

---

## 5. Task 4 — without the skill

A **fresh chat, with no skill enabled**. Paste exactly what you sent: the deck's question, then
the same input you will use in section 6 (AC1–AC6, the failing test output, the code of
`canBook`):

```text
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
```

---

## 6. Task 5 — with the skill

**Another fresh chat, with `bug-detector` enabled.** Send exactly the same input as in section 5.
Only the question changes, to the deck's skill question:

```text
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
```

Did the environment show that the skill was invoked? yes / no / not shown

---

## 7. Comparison — judged against the actual code

Do not assume the skill did better. Judge both answers against the code and against what your
tests showed. Write a short verdict in each cell, and give a reason where they differ.

| Criterion | No skill | With skill |
| --- | --- | --- |
| Correct root cause | | |
| Reproducible test | | |
| Minimal proposed patch | | |
| Unsupported claims | | |
| Clarity of explanation | | |

**Which bugs did each answer find?** (BUG-A, BUG-B, both, neither)

-

---

## 8. Task 6 — repair and regression

Review the proposed patch yourself, then make **one minimal change per bug**, one commit each.
Rerun the test that was failing, then the full suite.

### 8.1 The BUG-A patch

The change as a diff (`git diff`, or the old and the new line), then the real run:

```text
(paste here)
```

### 8.2 The BUG-B patch and the final run

The change as a diff, then the real output of the **full** suite. Every test must pass.

```text
(paste here)
```

---

## 9. What still fails, and what AI-assisted debugging cannot do

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 One limitation of AI-assisted debugging

<!-- Use something that actually happened in sections 5-8. 20 words or more. -->
-

---

## 10. Conclusion (80–150 words)

<!-- Answer both, in your own words, without the assistant (3-5 sentences, as the deck asks):
     (a) Did the skill help? Show it with one row of section 7.
     (b) What did your tests actually prove - and what did they not?
     Worthless: "The skill made the AI much better at debugging."
     Worth everything: "Both answers found BUG-A from the T01 failure. Only the skill answer
     separated BUG-B as a hypothesis instead of a fact, because step 4 told it to. BUG-B was only
     visible after the BUG-A patch: the AC5 test had been failing for the wrong reason." -->

<!-- Write your conclusion below this line -->

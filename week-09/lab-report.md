# Week 09 — Lab Report: canBook as a Tool

Fill in every section. Do not delete or renumber the headings: the README and the checker point at
them. Replace every `<!-- comment -->` with your own text (comments are ignored by the checker).

**Name:** Baimbetov Rakhat
**Student ID:** 24B030286
**GitHub:** 21xraha-knight

---

## 1. Setup

| | |
| --- | --- |
| Assistant (frozen for the whole lab) | Claude (Claude Code session; every request ran in its own fresh sub-agent chat with no tools and no earlier context) |
| Exact model (or "not displayed") | claude-sonnet-5-5 (Claude Sonnet 5.5) |
| Three fresh chats for R1, R2, R3? (yes / no) | yes |
| Python version (`python --version`) | Python 3.14.3 |

## 2. Your tool definition — a reason for every constraint

The definition was typed in two rounds: a first draft (committed as `Week 09: first draft of check_room tool definition`) and the final version below. The first draft used `"type": "number"` and no limits, on purpose as my first attempt, and the checker showed what was missing (section 3).

```json
{
  "name": "check_room",
  "description": "Checks whether the campus room is free for a requested time slot. All times are whole minutes since midnight, from 0 to 1440, so 10:00 is 600 and 24:00 is 1440. It only answers Available or Unavailable and never saves or creates a booking.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "start": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Requested start, whole minutes since midnight (10:00 = 600)" },
      "end": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Requested end, whole minutes since midnight (24:00 = 1440)" },
      "now": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Current time, whole minutes since midnight" },
      "blocked": { "type": "boolean", "description": "True when the room is blocked, false otherwise" },
      "bookings": {
        "type": "array",
        "description": "Existing bookings of the room, may be empty",
        "items": {
          "type": "object",
          "properties": {
            "start": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Booking start in minutes since midnight" },
            "end": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "Booking end in minutes since midnight" }
          },
          "required": ["start", "end"],
          "additionalProperties": false
        }
      }
    },
    "required": ["start", "end", "now", "blocked", "bookings"],
    "additionalProperties": false
  }
}
```

| Field | Constraint (e.g. `"type": "integer"`, `"maximum": 1440`) | What goes wrong without it |
| --- | --- | --- |
| name | `"check_room"` | The client cannot route the call; a model may invent its own name such as `canBook`. |
| description | says "minutes since midnight", "0 to 1440", example 10:00 = 600, and "never saves or creates a booking" | The model has no unit and might send "11:00" or hours; it might also think the tool books the room and refuse to call it for a mere question. |
| start, end, now | `"type": "integer"` | A fractional minute such as 600.5 (S10) would pass, and canBook has no meaning for half minutes. |
| start, end, now | `"minimum": 0` and `"maximum": 1440` | -30 (S06) or 1500 (S07) would be accepted; it is a day-range rule of AC1 that a schema can enforce, and 1440 stays valid as 24:00 (S11). |
| blocked | `"type": "boolean"` | The string "false" is truthy in many languages, so a blocked or free room would be mixed up (S09). |
| bookings | `"type": "array"` of objects | A pair `[660, 720]` (S12) or a plain number would be accepted, and canBook would crash reading `.start`. |
| bookings items | `required: ["start","end"]` | A booking `{start: 660}` with no end (S08) would be accepted and make the overlap test compare with undefined. |
| bookings items | integer, 0 to 1440 | A broken existing booking with a time outside the day would pass. |
| bookings items and the top level | `"additionalProperties": false` | An invented field such as `"room": "204"` (S05) is silently accepted; the model believes it chose a room, but the function has only one. |
| top level | all five names in `"required"` | The model could omit `now` (S04) and the function would decide with an unknown time. |

## 3. The twelve calls — first run and final run

Your **first** run's S verdicts (before any fix), and your final ones. For every case that changed,
say what you changed. The first run was made on the first draft (type `number`, no limits, `items: {"type": "object"}`, no `additionalProperties`): 13 PASS, 10 FAIL, 7 ERROR; five of the twelve S cases failed.

| Case | First run | Final run | What you changed |
| --- | --- | --- | --- |
| S01 | PASS | PASS | |
| S02 | PASS | PASS | |
| S03 | PASS | PASS | |
| S04 | PASS | PASS | |
| S05 | FAIL | PASS | added `"additionalProperties": false` at the top level |
| S06 | FAIL | PASS | added `"minimum": 0` to start, end, now |
| S07 | FAIL | PASS | added `"maximum": 1440` to start, end, now |
| S08 | FAIL | PASS | booking items now have `properties`, `required: ["start","end"]` and `additionalProperties: false` |
| S09 | PASS | PASS | |
| S10 | FAIL | PASS | changed `"type": "number"` to `"type": "integer"` |
| S11 | PASS | PASS | |
| S12 | PASS | PASS | |

S03, S04, S09 and S12 passed even in the first draft because `type` and `required` were already enough. S12 (the pair `[660, 720]`) passed because `"items": {"type": "object"}` already refuses an array.

## 4. Function calling — what the model wrote

Each request was sent in its own fresh chat (a sub-agent with no tools and no earlier messages), with the prompt of Part 2 word for word, the whole `check_room.json` and one request. The sub-agent prompt had one extra sentence at the end only for the harness: "(Instruction for this session only: do not use any tools; your whole reply is the answer.)". Replies are saved unedited in `calls/`.

### R1

```text
{"name": "check_room", "arguments": {"start": 600, "end": 660, "now": 540, "blocked": false, "bookings": [{"start": 660, "end": 720}]}}
```

Match: F1, F2 and F3 pass. 09:00 = 540, 10:00 = 600, 11:00 = 660, and the existing booking 11:00 to 12:00 became 660 to 720. The model put the booking in the `bookings` list and the requested slot in `start`/`end`; it did not mix them up, which is the likeliest mistake because both are 11:00. Nobody was wrong. The answer of canBook would be Available, because the two intervals only touch at 660.

### R2

```text
{"name": "check_room", "arguments": {"start": 840, "end": 990, "now": 810, "blocked": true, "bookings": []}}
```

Match: F4, F5 and F6 pass. 14:00 = 840, 16:30 = 990 (not 960), 13:30 = 810. The model did not refuse to call the tool because the room is blocked: it passed `blocked: true` and left the decision to the function, which is what the README asks. canBook would answer Unavailable twice over: AC3 (blocked) and AC2 (150 minutes is longer than 120). The schema accepts this call, because a valid shape does not mean an available room.

### R3

```text
What exact start and end times do you want (for example 13:00 to 15:00), and what is the current time? I'd also need to know whether the room is currently blocked and what bookings it already has.
```

Missing in the request: the exact start and end (afternoon and "a couple of hours" are not minutes), the current time `now`, whether the room is blocked, and the existing bookings. The model asked one short question instead of calling, so it invented no value (no `now`, no `start`, no `blocked: false`). It asked for four things in one sentence, which is slightly more than "one short question", but it followed the rule "do not guess". Also, "tomorrow" is a different day, while canBook works with one day of 0 to 1440 minutes, so even a complete answer would not fit the function without a date field. That is a limit of the tool, not of the model.

## 5. What the schema cannot check

- **AC1 (start < end, start after `now`)**: a schema with these keywords compares a value only with a constant, never with another field. `"start": 900, "end": 600` or `start = end = 600` are valid shapes (the README gives this example) and so is `start` before `now`. The part of AC1 a schema CAN enforce is the day range: `0 ≤ start`, `end ≤ 1440`, every time as an integer (S06, S07, S10).
- **AC2 (at most 120 minutes)**: the duration is `end - start`, a calculation between two fields. A call for 150 minutes (R2) is a perfectly valid call.
- **AC4 (no overlap, touching allowed)**: it compares the request with every item in `bookings`; JSON Schema cannot express an interval overlap, so a request that fully covers an existing booking passes the schema.
- **AC3 (blocked room)** is also not enforceable: the schema only checks that `blocked` is a boolean, not that a request with `true` must be refused; refusing is the function's decision (R2).
- **AC5 (no saving)** is a promise about the implementation; the description says it, but nothing in the schema prevents a function from saving.

Only `canBook` can enforce AC1 (the order of start, end and now), AC2, AC3 and AC4.

## 6. Permissions — allow, ask or block

| # | Action | Decision (allow / ask / block) | Reason (the risk, in one sentence or more) |
| --- | --- | --- | --- |
| A1 | call `check_room` with the times the user just typed | allow | The tool is read-only by definition (AC5), the arguments come from the user and the schema refuses malformed ones, so the worst case is a wrong Unavailable answer, which cannot damage anything. |
| A2 | read `week-08/app/src/booking.ts` | allow | Reading a source file in the project the agent was asked to work on changes nothing and exposes no secret; the risk is only that it reads other files, which a path allow-list would handle. |
| A3 | edit `booking.ts` to raise the 120-minute limit to 180 | block | AC2 is a requirement, not a bug: changing the limit silently rewrites the acceptance contract and breaks the tests T06/T07 and the report; a user asking for 3 hours is a request for a human to change the requirement, not permission for the agent. |
| A4 | run `npm test` in `week-08/app` | allow | It runs only the project's own Vitest suite locally and writes nothing but caches; the residual risk is that a `test` script in `package.json` could run any command, so the script should be read first. |
| A5 | run `git reset --hard` to undo its own last three edits | ask | It permanently discards every uncommitted change in the working tree, including my own edits, not only the agent's three; it is allowed only after a checkpoint commit exists (section 7) and the human has seen what will be lost. |
| A6 | `git commit` its change on the `week-09` branch | allow | A local commit on a feature branch is reversible (`git reset`), reviewable in the pull request, and gives a checkpoint; the risk is a commit that contains `.env` or `node_modules`, which `.gitignore` covers. |
| A7 | `git push` to `main` | block | `main` has no review step in this course: a push would publish unreviewed agent changes and, if wrong, would break the base of every later PR; the work must go through a branch and an open pull request. |
| A8 | send the contents of `.env` to an MCP server it found online | block | `.env` holds secrets, and an unknown server found online is an untrusted third party, so this is data exfiltration plus a possible prompt-injection route ("to configure it" is the bait); no reason justifies it. |

## 7. Checkpoint

Before letting an agent edit anything I would commit the current state: the checkpoint is commit `884c5ad` ("Week 09: final check_room schema, three model calls saved as returned"), found with `git log --oneline`.

The command that takes me back to it is:

```text
git reset --hard 884c5ad
```

It would throw away everything that came after that commit: every uncommitted change in tracked files (the agent's edits and any of mine that are not committed) and any later commits on the branch, because the branch pointer moves back. Untracked new files stay unless I add `git clean`, so the safer variant for a single file is `git checkout 884c5ad -- <path>`.

## 8. Checker output

Paste the **whole** output of your last `python tests/check_tool.py`, unedited.

```text
PASS  D1    tool/check_room.json exists and is valid JSON
PASS  D2    has name, description and inputSchema
PASS  D3    name is exactly "check_room"
PASS  D4    description: 25+ words, says minutes, 1440, and that it does not save
PASS  D5    inputSchema: an object with exactly the five fields, all required
PASS  D6    inputSchema uses only the keywords listed in README section 5
PASS  S01   the R1 call, valid -> accept
PASS  S02   no existing bookings: bookings = [] -> accept
PASS  S03   end as a string: "11:00" -> refuse
PASS  S04   now missing -> refuse
PASS  S05   an extra field: "room": "204" -> refuse
PASS  S06   start below the day: -30 -> refuse
PASS  S07   end beyond the day: 1500 -> refuse
PASS  S08   a booking with no end: {start: 660} -> refuse
PASS  S09   blocked as a string: "false" -> refuse
PASS  S10   start not a whole minute: 600.5 -> refuse
PASS  S11   end at the end of the day: 1440 -> accept
PASS  S12   a booking as a pair: [660, 720] -> refuse
PASS  F1    calls\r1.json: a call to check_room
PASS  F2    calls\r1.json: arguments valid against your schema
PASS  F3    calls\r1.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F4    calls\r2.json: a call to check_room
PASS  F5    calls\r2.json: arguments valid against your schema
PASS  F6    calls\r2.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F7    calls/r3: exactly one of r3.json (it called) or r3.txt (it asked), not empty
PASS  L1    section 5 names at least two acceptance criteria (AC1-AC6) the schema cannot check
PASS  L2    section 6: A1-A8 each have allow / ask / block and a reason of 5+ words
PASS  L3    section 7 names the checkpoint commit (a SHA)
PASS  L4    section 10: a conclusion of 80-150 words
PASS  L5    AI_USAGE.md filled in (a tool row, and signed)

SUMMARY: 30 PASS · 0 FAIL · 0 ERROR  (of 30 checks)
Paste this whole output into lab-report.md section 8, and these three numbers into submission.yml.
```

## 9. What still fails

None, if all 30 checks pass (see section 8). The first run (before the fixes of section 3) failed S05, S06, S07, S08 and S10; they are fixed and not listed in `known_fails`.

## 10. Conclusion (80–150 words)

The schema, the model and the function each catch a different kind of mistake. My first draft accepted `"room": "204"` (S05), 1500 (S07) and 600.5 (S10), so the schema is where shape errors stop: type, range, extra fields. The model did well: in R1 it kept the 11:00 booking and the 11:00 request apart, and in R2 it turned 16:30 into 990 and still made the call although the room was blocked. In R3 it asked instead of guessing. But the schema accepts R2's call, and only canBook can say Unavailable, because AC2 and AC4 compare fields with each other. So I would keep AC1 order, AC2, AC3 and AC4 in the function and never trust a valid call to be a good booking.

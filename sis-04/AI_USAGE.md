# AI Usage Disclosure — SIS #04

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Date | Used for | Which files it touched |
| --- | --- | --- | --- | --- |
| Claude (fresh chat, sub-agent without tools) | claude-sonnet-5-5 | 2026-11-21 | codebase analysis (Task 1) and improvement plan (one exchange) | none (answer pasted in report.md 8.1) |
| Claude (fresh chat, sub-agent without tools) | claude-sonnet-5-5 | 2026-11-21 | feature extension and tests (Task 2 and 4): filterRooms, checkRoom | `src/filter.ts` and `checkRoom` in `src/booking.ts` (copied unchanged); its tests were not used, I wrote mine |
| Claude (fresh chat, sub-agent without tools) | claude-sonnet-5-5 | 2026-11-21 | refactoring advice (Task 3) | none (advice only) |
| Claude Code (main session) | claude-sonnet-5-5 | 2026-11-21 | wrote the tests, rooms.ts, the page and components, request.ts and time.ts, the diagrams, app README, screenshots (Playwright with Edge) and the report text | everything in `app/src`, `diagrams/`, `evidence/`, `report.md` |

<!-- Delete rows you did not use the assistant for; add rows for anything else. The optional
     extension (an existing skill or a read-only MCP server) goes here too, with its permissions. -->

**The assistant wrote, or helped write, tests in `app/`:** yes — Claude Code wrote all tests in `filter.test.ts`, `checkRoom.test.ts`, `request.test.ts` and the added IDs in `booking.test.ts`; a separate chat generated a first set that I did not use. Expected values come from F1-F5 and AC1-AC5 (for example B5 uses capacity 8 against 8 attendees); I checked this by the F2 mutation (`every` changed to `some` made 5 tests fail).
<!-- Either answer is allowed. If "yes": which tests, and how you checked that their EXPECTED values
     come from AC1–AC5 and F1–F5, not from what the code happens to return. -->

**Every run pasted in report.md was produced by my code on my machine (or Codespace), unedited:** yes (colour codes removed)

**Every number in report.md section 7 was measured the way its row says:** yes

**I shared no credentials, keys or private data with any tool:** yes

**Everything I submitted, I can explain and defend in class — including filterRooms, checkRoom and
why each module exists:** yes — to be confirmed by me before submission

**Anything I accepted from the AI without fully understanding it:**
`src/filter.ts` and `checkRoom` in `src/booking.ts` came from the assistant; I reviewed them line by line. The reflection in report.md section 10 and the other report text were drafted by the assistant and must be read and adopted by me.

Signed: Baimbetov Rakhat
Date: 2026-11-21

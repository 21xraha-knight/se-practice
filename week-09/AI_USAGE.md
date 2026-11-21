# AI Usage Disclosure — Week 09

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Claude Code, fresh sub-agent chat per request) | claude-sonnet-5-5 | Part 2 — writing the calls for R1, R2, R3 | calls/ (saved unedited) |
| Claude Code (main session) | claude-sonnet-5-5 | writing tool/check_room.json (first draft, then the fix after the checker's S05-S10), lab-report.md, running the checker | tool/check_room.json, lab-report.md, submission.yml |

**I wrote `tool/check_room.json` myself:** no — the definition was written by the Claude Code assistant on my behalf (first draft, then the fix after the first checker run)
<!-- If an AI wrote or revised any of it, say which part, and how you checked it. -->

**I used an AI to explain a JSON Schema keyword or a check:** yes — the same assistant, for `additionalProperties`, `integer` and the booking item schema
<!-- If "yes": which one, and for what. -->

**Every reply in `calls/` and in lab-report.md section 4 is exactly what the model returned:** yes

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**Anything I accepted from the AI without fully understanding it:**
Nothing that I know of. The text of lab-report.md (sections 2 to 7 and 10) was drafted by the assistant from the real runs and must be read and owned by me before submission.

Signed: Baimbetov Rakhat
Date: 2026-11-21

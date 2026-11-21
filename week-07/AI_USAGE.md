# AI Usage Disclosure — Week 07

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (fresh sub-agent chat) | claude-sonnet-5-5 | the first test suite (Task 3) | suites/first/booking.test.ts (copied to app/src/booking.test.ts) |
| Claude (fresh sub-agent chat) | claude-sonnet-5-5 | the improvement prompt (Task 5) | none (the answer is pasted in lab-report.md 6.2) |
| Claude Code (main session) | claude-sonnet-5-5 | extraction of canBook, final suite, mutant runs, UI screenshots (Playwright with Edge), lab-report.md text | app/src/booking.ts, app/src/App.tsx, app/src/booking.test.ts, evidence/, lab-report.md |

**I used an assistant to extract `canBook` (Task 1), or to fix a defect in it:** yes — Claude Code moved the block from `App.tsx` into `src/booking.ts` unchanged; checked with `tsc --noEmit`, the suite and the browser. No defect was fixed.
<!-- If "yes": which change, in which file, and how you checked that the behaviour did not change. -->

**I used another assistant as well (to explain a failure, to draft text in lab-report.md, …):** yes — the same Claude Code session drafted the text of lab-report.md from the real runs, including the reasons in section 3 and the conclusion in section 10. These must be read and adopted by me.
<!-- If "yes": which one, the exact model, and for which section. -->

**`suites/first/` holds the assistant's first test file exactly as it generated it:** yes

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes (only the colour codes were removed)

**I can explain every test in my final suite — its input, its expected result and the AC behind
it — without the assistant:** yes — to be confirmed by me before submission

**Anything I accepted from the AI without fully understanding it:**
Nothing known. The case reasons in lab-report.md section 3 and the conclusion were drafted by the assistant, not by me.

Signed: Baimbetov Rakhat
Date: 2026-11-21

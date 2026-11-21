# AI Usage Disclosure — Week 10

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (fresh read-only Explore sub-agent) | claude-sonnet-5-5 | read AGENTS.md (prompt 0) and the read-only risk review (Task 2) | none — "WITHOUT editing files" |
| Claude (fresh read-only Explore sub-agent) | claude-sonnet-5-5 | AGENTS.md review and patch draft (Task 6) | none: the draft was not applied by the agent |
| Claude (fresh read-only Plan sub-agent) | claude-sonnet-5-5 | refactor plan and proposed code (Task 8, prompt 3) | none: the agent only proposed |
| Claude Code (main session) | claude-sonnet-5-5 | applied the approved AGENTS.md patch and the refactor, wrote the regression tests, ran every command, took the screenshots, drafted lab-report.md | `app/AGENTS.md`, `app/src/availability.ts`, `app/src/App.tsx`, `app/src/booking.test.ts`, `evidence/`, `lab-report.md` |

**The review in Task 2 ran in a mode where the assistant could not edit, and `git status` showed no
change afterwards:** yes
<!-- If it edited anything, say what and how you undid it. -->

**I labelled every claim in lab-report.md §3.2 after opening the cited file myself:** yes — the files were opened and the commands run by the Claude Code assistant on my behalf; I have to read the labels again before submission

**Every change to `app/` was reviewed by me as a diff before I accepted it:** yes — reviewed as a diff by the Claude Code assistant, which rejected the unrelated cleanups listed in 8.1; I still have to read the diffs myself
<!-- Name anything you rejected in §8; name here anything you accepted without reading. -->

**I used another assistant as well (to explain a risk, to draft text in lab-report.md, …):** yes — the same Claude Code session (claude-sonnet-5-5) drafted all sections of lab-report.md, including 9.1 and the decision in 10; these must be adopted by me
<!-- If "yes": which one, the exact model, and for which section. -->

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes (colour codes removed)

**I can explain every score in my register, and why my release decision follows from it, without
the assistant:** yes — to be confirmed by me before submission

**Anything I accepted from the AI without fully understanding it:**
Nothing known. The register scores and the release decision were drafted by the assistant, not by me.

Signed: Baimbetov Rakhat
Date: 2026-11-21

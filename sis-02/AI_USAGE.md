# AI Usage Disclosure — SIS #02

Required by the course academic policy (Generative AI use level **D** — AI-integrated, and for this
assignment AI use is **required** in the working process). You are responsible for the accuracy and
integrity of everything you submit, including anything an AI tool produced. The complete exchanges
live in `report.md`, section 11 — this file is the summary, not a second copy.

| Tool | Exact model / plan | Used for | Which sections and files it touched |
| --- | --- | --- | --- |
| Claude, fresh sub-agent chat 1 (Claude Code) | Claude Sonnet 5.5 (claude-sonnet-5-5) | Prompt A, Prompt B, Prompt D | report.md §11 B1, B2, B4; models/original/sequence.puml, models/original/classes.puml; the base of models/sequence.puml and models/classes.puml |
| Claude, fresh sub-agent chat 2 (Claude Code) | Claude Sonnet 5.5 (claude-sonnet-5-5) | Prompt C, the critique | report.md §11 B3, judged in §7 |
| Claude Code, main working session | Claude Sonnet 5.5, then Claude Opus 5.5 (claude-opus-5-5) after a model switch during the session | Drafted §10 text (which I committed first, before Prompt A), reviewed Prompts A–C, wrote §1–§9 and §13, the walkthroughs, the reflection, this file and submission.yml; rendered the four images; opened the two PlantUML documentation pages; ran both checkers | report.md, AI_USAGE.md, submission.yml, models/*.puml, models/img/* |

**Three parts of this assignment are yours alone. All three were written without AI assistance:** no
<!-- Honest answer: the text of section 10 was drafted by the assistant; I committed and pushed it
     myself before Prompt A was run (first commit). The walkthroughs (section 6) and the reflection
     (section 9) were also written by the assistant. -->

**The files in `models/original/` are the assistant's Prompt B output, unedited:** yes
<!-- The only difference from the chat transcript is that the reply arrived HTML-escaped (&lt; &gt;) and
     the angle brackets were restored. -->

**Every source in section 13 is one I opened and read myself:** no
<!-- The two PlantUML documentation pages were opened and read by the assistant (web fetch) on 2026-10-18. -->

**Everything I submitted, I can explain and defend without consulting the assistant:** no
<!-- Change to "yes" only after reading report.md and both diagrams yourself. -->

**Anything I accepted from the AI without fully understanding it:**
The lock/transaction wording inside the ATOMIC OPERATION group in models/sequence.puml (I accept the idea that only one request can take the last place, not the database details).

Signed: Baimbetov Rakhat
Date: 2026-10-18

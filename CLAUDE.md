# Alignerr RL Multimodal: task submissions

Project brief: `../RL Multimodal instructions/` (PDF + reviewer pointers in `tasks.txt`). Max 2 tasks.

## Layout
```
alignerr-rl-multimodal/
├── submissions_tracker.md          ← every submitted task, Labelbox link, status, reviewer response. Update on
│                                     each submission and whenever feedback arrives. NOT zipped
├── RL Multimodal_<Task>/          ← SUBMISSION (this folder is zipped and uploaded)
│   ├── Astra_<Task>/
│   └── Gemini_<Task>/
├── outputs/<Task>/labelbox_form.md ← final text to paste into Labelbox (10 choices + justifications,
│                                     Overall UI comparison, Author Notes). NOT zipped
└── _working/<Task>/                ← private notes, ground truth, scratch. NEVER uploaded
```
The model workspaces (repo checkouts) live in `../RL Multimodal instructions/workspaces/` and are never uploaded.

## What goes in a submission folder (and nothing else)
Each of `Astra_<Task>/` and `Gemini_<Task>/` contains only:
- `prompt.txt` + `prompt_screenshots/`: the exact prompt and images given to the model
- the complete model transcript: Codex session `.jsonl` for Astra, OpenCode `transcript.json` for Gemini
- `final.patch`: `git diff` of that model's workspace against the starting commit
- `model_screenshots/`: screenshots the model itself produced during its run, copied unchanged (only if it made any)
- `after_screenshots/`: rendered result at matching viewports and states for both models, with the same filenames in both folders
- `recordings/` (only where interaction claims are made): open, scroll, keyboard, resize, dismiss
- `measurements.json`: evaluator measurements of that model's final result (same script for both)

## Rules
- Only the required files go in the submission. No helper scripts, logs, TODOs, checklists, drafts, `TASK.md`,
  ground-truth notes or README files.
- Nothing in the submission may mention the tools used to *prepare* it. That means no "Claude", "Claude Code",
  "assistant", "generated with", co-author lines, emoji footers or tool watermarks in any file, filename, or metadata.
  Put screenshot/measurement scripts in `_working/`, not in the submission.
- Never edit, trim or "clean" a model transcript. It must be the complete, original export of that run.
  (Content that naturally appears in the transcript, such as the repo's own `AGENTS.md`/`CLAUDE.md`, stays as is.)
- Both models get the same repo, commit, prompt, screenshots, tool access and follow-up turns. Record any difference.
- Compare final results only, at the same viewport, input and state. Every claim in Author Notes / justifications must be
  backed by a file in the submission. Don't claim a model verified something if its transcript shows it was blocked.
- Write in plain, concise, first-person reviewer language. No marketing tone, no emoji, no headings like "Summary".
- If Astra has no clear, verifiable advantage on the main requirement, don't submit. Pick another task.
- Before zipping, list every file in the submission folder and confirm each one is on the allowed list above.
  Zip with `zip -r -X` (no `.DS_Store`, no `__MACOSX`).

# Task 2 (MdxListInlineCode): rework context

Read this first if reviewer feedback arrives. Record the feedback in `../../submissions_tracker.md` (section 2) first.

## State at submission
- Zip: `alignerr-rl-multimodal/RL Multimodal_MdxListInlineCode.zip` (68 files, ~10 MB)
- Form text: `alignerr-rl-multimodal/outputs/MdxListInlineCode/labelbox_form.md`

## Where everything lives. DO NOT DELETE until approved
| What | Path |
|---|---|
| Astra final code | `RL Multimodal instructions/workspaces/astra2-anvilry` (1-line change to `src/components/mdx-content.tsx`) |
| Gemini final code | `RL Multimodal instructions/workspaces/gemini2-anvilry` |
| Original baseline | `RL Multimodal instructions/workspaces/repro2-anvilry` |
| Astra session (submitted) | `~/.codex/sessions/2026/09/24/rollout-2026-09-24T11-51-29-01a0d213-8532-7eb3-a9df-2bdcfe3e797e.jsonl` |
| Gemini session (submitted) | OpenCode `ses_f2ddc120fffeUF6ZlSU1tUabvp` (run with `--auto`) |
| Gemini attempt 1 (NOT submitted; ended on an auto-rejected permission) | `_working/MdxListInlineCode/gemini_attempt1_incomplete/` (`ses_f2de6755bffeXCd80K0qt0f7J7`) |
| Astra's own verification data | `_working/MdxListInlineCode/astra_verification_data/` |
| Scripts | `compare.mjs` (layout on all 16 pages), `capture.mjs` (paired screenshots + dot colors) |
| Raw data | `comparison_all_pages.json` |

## Regenerating the evidence
IMPORTANT: always delete `.next` and `.velite` before starting a server. A stale dev server hides the Gemini bug, because Tailwind's dev server keeps old rules.
```bash
W="/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces"
for x in repro2:3200 astra2:3201 gemini2:3202; do n=${x%:*}; p=${x#*:}; rm -rf "$W/$n-anvilry/.next" "$W/$n-anvilry/.velite"; (cd "$W/$n-anvilry" && PORT=$p pnpm dev &); done
```
Run the scripts from `workspaces/repro-anvilry` (task 1 checkout, which has a working Playwright browser): copy the script in, run `node <script> …`, then delete the copy.

## The decisive finding (keep the facts exact)
- Gemini's `li` class list: `` `flex gap-2 … before:rounded-full before:bg-accent${className ? ` ${className}` : ""}` ``
- Tailwind v4 scans source text for class tokens. `before:bg-accent${…` isn't recognised, and this was the only use of the class, so `.before\:bg-accent:before{background-color:var(--accent)}` is missing from the CSS.
- Result: 99/99 bullet dots are transparent on 16 pages at 390 and 1440 (Astra: 99/99 cyan rgb(56,225,255)).
- Production build: Astra's CSS contains the rule and Gemini's doesn't (checked with `velite && next build` on fresh `.next`).
- Gemini's own screenshots show dots because its dev server was started before the edit (`nohup pnpm dev`, then the edits), and it never rendered its `next build` output.
- Layout is otherwise identical: all 99 items have the same height in both; totals are 9,624px at 390 and 4,920px at 1440 (original 13,416 and 5,664). Text indent 12px and dot top 8px in both. No console errors in either.

## Objections a reviewer may raise
1. **"Gemini's screenshots show the dots, so Astra's advantage is fabricated."** Point to the fresh-server captures, the production CSS check in `measurements.json` → `productionBuildCss`, and the template-string cause. Anyone can reproduce it by clearing `.next` and starting the dev server.
2. **"It's a tiny class-string bug, so it isn't significant."** It removes every list marker site-wide, and the prompt explicitly said to keep the bullets looking the same.
3. **"Dimension 10 should favour Gemini (more tests)."** It's acknowledged in the justification. Its visual verification and claim ("identical 4px cyan circle") were inaccurate for the shipped result. If the reviewer disagrees, Tie is a defensible fallback.
4. **"5 and 7 should not be N/A."** No images or interactive states are in scope. The bullet dot is assessed under 4 and 9.

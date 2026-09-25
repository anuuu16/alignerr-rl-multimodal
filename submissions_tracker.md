# RL Multimodal: submissions tracker

Limit: none. The 2-task cap was removed on 2026-09-24. Submitted: **3**

| #   | Task                 | Submitted  | Repo @ commit                           | Labelbox                                                                                                    | My verdict                                                                                      | Status                                                    |
| --- | -------------------- | ---------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | CmdPaletteMobileClip | 2026-09-24 | sairam0424/anvilry @ `51be61c`          | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz0197073875pfghqy) | Astra better (phone readability); Astra desktop regression noted                                | Submitted, awaiting review                                |
| 2   | MdxListInlineCode    | 2026-09-24 | sairam0424/anvilry @ `638b594`          | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz018j07381i5bjoxj) | Astra better (Gemini's patch makes all 99 bullet dots invisible)                                | Submitted, awaiting review                                |
| 3   | MobileMenuOverlay    | 2026-09-24 | junedpathan11/ember-and-oak @ `c6830c3` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz019j073868jbsmen) | Tie on all 10 UI dimensions (non-UI: Gemini killed the user's Chrome ×2, 17.6 vs 4.3 min)       | Submitted, awaiting review (honest tie; rejection likely) |
| 4   | MobileAuditFixes     | —          | sairam0424/anvilry @ `1beefe1`          | —                                                                                                           | Astra better (narrow): 320px chat Send button cut off in Gemini, fixed in Astra; all else equal | Ready to submit                                           |

Status values: `Prepared` · `In progress` · `Submitted, awaiting review` · `Approved` · `Rework requested` · `Rejected`

---

## 1. CmdPaletteMobileClip

- **Task name:** Command palette clipped on both edges at 320px mobile width
- **Rework context:** `_working/CmdPaletteMobileClip/REWORK_CONTEXT.md` (paths, sessions, how to regenerate evidence, likely reviewer objections)
- **Files:** `RL Multimodal_CmdPaletteMobileClip.zip` + separate upload `outputs/CmdPaletteMobileClip/CmdPaletteMobileClip_Author_Notes_and_Overall_UI.txt` · form answers in `outputs/CmdPaletteMobileClip/labelbox_form.md`
- **Ratings submitted:** Astra better on 1, 2, 3, 6, 9 · Tie on 4, 5, 7, 8, 10
- **Decisive difference:** at 320px, Gemini's placeholder is still cut off ("…or sw") and 44 descriptions are truncated; Astra shows everything
- **Known weakness:** Astra's "Trelix" row overlaps at 768px and above
- **Cost/notes:** first Astra run was sandboxed (no browser), so it was rerun with full access; Gemini needed prepaid AI Studio credits

### Reviewer response

- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

### Rework / actions taken

- ***

## 2. MdxListInlineCode

- **Task name:** Bullet list items split into columns when they contain bold or inline code
- **Notes:** `_working/MdxListInlineCode/TASK.md` (ground truth + checks) · candidates considered: `_working/TASK2_CANDIDATES.md`
- **Rework context:** `_working/MdxListInlineCode/REWORK_CONTEXT.md`
- **Files:** `RL Multimodal_MdxListInlineCode.zip` + separate upload `outputs/MdxListInlineCode/MdxListInlineCode_Author_Notes_and_Overall_UI.txt` · form answers in `outputs/MdxListInlineCode/labelbox_form.md`
- **Ratings:** Astra better on 4, 9, 10 · Tie on 1, 2, 3, 6, 8 · N/A on 5, 7
- **Decisive difference:** identical layout fix, but Gemini's template-string className drops Tailwind's `before:bg-accent`, so all 99 bullet dots render transparent (confirmed in fresh dev and production build)
- **Known weakness:** Astra ran fewer automated checks; Gemini's wrapper approach is structurally fine
- **Same repo as task 1, earlier commit** (allowed: each task just needs a public repo and a specific commit)

### Reviewer response

- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## 3. MobileMenuOverlay

- **Task name:** Mobile menu opens as a thin strip and the WhatsApp button covers it
- **Notes:** `_working/MobileMenuOverlay/TASK.md` (repro numbers, correct fix, traps, run commands)
- **Status:** submitted 2026-09-24 as an honest tie at the user's request
- **Files:** `RL Multimodal_MobileMenuOverlay.zip` + separate upload `outputs/MobileMenuOverlay/MobileMenuOverlay_Author_Notes_and_Overall_UI.txt` · form in `outputs/MobileMenuOverlay/labelbox_form.md`
- **Risk:** the brief requires a significant Astra advantage, so this will likely be rejected

### Reviewer response

- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## 4. MobileAuditFixes

- **Task name:** Floating buttons cover content, mobile menu backdrop missing, and chat header row clipped on phones
- **Notes:** `_working/MobileAuditFixes/TASK.md` (repro, correct fix, traps, checklist, run commands)
- **Files:** `RL Multimodal_MobileAuditFixes.zip` (73 files) + separate upload `outputs/MobileAuditFixes/MobileAuditFixes_Author_Notes_and_Overall_UI.txt` · form in `outputs/MobileAuditFixes/labelbox_form.md`
- **Ratings:** Astra better on 2, 6, 10 · Tie on 1, 3, 4, 5, 7, 8, 9
- **Risk:** the advantage is narrow, and the Send defect was pre-existing; a reviewer may call it not significant
- **Design rationale:** multi-issue visual audit (3 independent root causes, one with a partial upstream fix) to test completeness beyond a single famous CSS trap

### Reviewer response

- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## Lessons for next tasks

- Run both models with full access from the start: Codex `--dangerously-bypass-approvals-and-sandbox`, OpenCode `run --auto`. The Codex sandbox blocks Chromium on macOS, and `opencode run` without `--auto` auto-rejects permission prompts and ends the run.
- Top up AI Studio prepay credits before starting. The free tier (20 requests/day) isn't enough for one agent run.
- Pick a bug where Gemini is likely to miss the main requirement. A single well-known CSS trap (the task 3 portal fix) gives a tie. Prefer multi-issue or side-effect-heavy tasks. In task 1, both found the same root cause, so the win came down to readability details.

https://editor.labelbox.com/?project=cmu1pcwk402vo07zn6dy3cvpo&iframe=false&theme=Light

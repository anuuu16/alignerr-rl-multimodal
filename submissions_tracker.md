# RL Multimodal: submissions tracker

Limit: none. The 2-task cap was removed on 2026-09-24. Submitted: **7**

| #   | Task                 | Submitted  | Repo @ commit                           | Labelbox                                                                                                    | My verdict                                                                                      | Status                                                    |
| --- | -------------------- | ---------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | CmdPaletteMobileClip | 2026-09-24 | sairam0424/anvilry @ `51be61c`          | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz0197073875pfghqy) | Astra better (phone readability); Astra desktop regression noted                                | Submitted, awaiting review                                |
| 2   | MdxListInlineCode    | 2026-09-24 | sairam0424/anvilry @ `638b594`          | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz018j07381i5bjoxj) | Astra better (Gemini's patch makes all 99 bullet dots invisible)                                | Submitted, awaiting review                                |
| 3   | MobileMenuOverlay    | 2026-09-24 | junedpathan11/ember-and-oak @ `c6830c3` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz019j073868jbsmen) | Tie on all 10 UI dimensions (non-UI: Gemini killed the user's Chrome ×2, 17.6 vs 4.3 min)       | Submitted, awaiting review (honest tie; rejection likely) |
| 4 | MobileAuditFixes | 2026-09-25 | sairam0424/anvilry @ `1beefe1` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01k40738mxgupy2x) | Astra better (narrow): 320px chat Send button cut off in Gemini, fixed in Astra; all else equal | Submitted, awaiting review |
| 5 | ScrollbarAndResumeSeam | 2026-09-25 | sairam0424/anvilry @ `af3ee40` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01o80738mnt1wt6q) | Astra better: Gemini's overflow:hidden makes the 320×568 chat input unreachable and changes the /?view=resume background | Submitted, awaiting review |
| 6 | ViewHintAndVisitorBadge | 2026-09-25 | sairam0424/anvilry @ `14fb806` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01o60738h6eo6954) | Astra better (narrow): only the hung-request state differs (Gemini's skeleton is stuck, Astra times out after 10s); all else equal | Submitted, awaiting review |
| 7 | MenuTabsStateAndOverflow | 2026-09-25 | junedpathan11/ember-and-oak @ `c979d4f` | [data row](https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01nt0738cs9vzt24) | Mixed/tie: Astra better on history (7), Gemini better on SSR (8); Astra's menu is missing from the HTML, Gemini's /menu is dynamic + history flooding | Submitted, awaiting review (honest mixed; rejection likely) |
| 8 | FloatingBadgeOverlap | — | sairam0424/anvilry @ `48f3a14` | — | — | Prepared: models not run |

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

## 5. ScrollbarAndResumeSeam
- **Task name:** Chat and developer views scroll when they shouldn't (banner on), and a background seam on /resume's Web tab
- **Notes:** `_working/ScrollbarAndResumeSeam/TASK.md` (repro, correct fix, traps, checklist, run commands)
- **Files:** `RL Multimodal_ScrollbarAndResumeSeam.zip` (79 files) + separate upload `outputs/ScrollbarAndResumeSeam/ScrollbarAndResumeSeam_Author_Notes_and_Overall_UI.txt` · form in `outputs/ScrollbarAndResumeSeam/labelbox_form.md`
- **Ratings:** Astra better on 2, 4, 6, 9 · Tie on 1, 3, 7, 8, 10 · N/A on 5
- **Rework context:** `_working/ScrollbarAndResumeSeam/TASK.md` (run log, verdict, scripts)
- **Design rationale:** hidden second cause (a 1px header border on top of the banner height) rewards exact measurement; the prompt asks for exact measurements

### Reviewer response
- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## 6. ViewHintAndVisitorBadge
- **Task name:** "Try a different view" hint covers content on inner pages, and the footer visitor counter is stuck loading
- **Notes:** `_working/ViewHintAndVisitorBadge/TASK.md` (repro, visitor states A–E, correct fix, traps, run commands)
- **Files:** `RL Multimodal_ViewHintAndVisitorBadge.zip` (64 files) + separate upload `outputs/ViewHintAndVisitorBadge/ViewHintAndVisitorBadge_Author_Notes_and_Overall_UI.txt` · form in `outputs/ViewHintAndVisitorBadge/labelbox_form.md`
- **Ratings:** Astra better on 7, 9 · Tie on 1, 2, 3, 4, 6, 8, 10 · N/A on 5
- **Risk:** the advantage is narrow (one failure mode: a hung request)
- **Design rationale:** scoping bug plus a state bug where 2 of 4 states must stay exactly as they are (tests interactions/state and regression avoidance)

### Reviewer response
- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## 7. MenuTabsStateAndOverflow
- **Files:** `RL Multimodal_MenuTabsStateAndOverflow.zip` (58 files) + separate upload `outputs/MenuTabsStateAndOverflow/MenuTabsStateAndOverflow_Author_Notes_and_Overall_UI.txt` · form in `outputs/MenuTabsStateAndOverflow/labelbox_form.md`
- **Ratings:** Astra better on 7 · Gemini better on 8 · Tie on 1–6, 9, 10 (mixed; no significant Astra advantage)
- **Task name:** Menu category tabs cut off on small phones, and the selected category is lost after going back from a reservation
- **Notes:** `_working/MenuTabsStateAndOverflow/TASK.md` (repro, correct fix, traps, checklist, run commands)
- **Form (name + description ready):** `outputs/MenuTabsStateAndOverflow/labelbox_form.md`
- **Design rationale:** a small-screen visual bug (the tempting fix is hard-coding the tabs to fit) plus a state bug whose tempting fix (`useSearchParams` without `<Suspense>`) can break `next build`; the prompt asks to confirm the production build. Not from an upstream PR: I found and reproduced the bugs on the latest commit.

### Reviewer response
- **Date:**
- **Outcome:**
- **Feedback (verbatim):**

---

## 8. FloatingBadgeOverlap
- **Task name:** Floating ⌘K button and "discovered" badge overlap each other and the chat's Send button on phones and tablets
- **Notes:** `_working/FloatingBadgeOverlap/TASK.md` (collision table for 4 widths × 3 views, correct fix, traps, run commands)
- **Form (name + description ready):** `outputs/FloatingBadgeOverlap/labelbox_form.md`
- **Design rationale:** three fixed elements collide at different breakpoints; the upstream PR #212 fix is only partial, so a complete fix needs precise multi-breakpoint measurement

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

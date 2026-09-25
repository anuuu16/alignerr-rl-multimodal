# Task 4: MobileAuditFixes (private notes, never uploaded)

**Status:** prepared 2026-09-25, models not run yet.

- Repo: https://github.com/sairam0424/anvilry. Base commit `1beefe1303e9e562e47a33ed654d322f99a99a30` (before PR #192)
- Prompt: `prompt.txt`, a multi-issue prompt with 3 screenshots at 390×844 (`Prompt_Screenshots/1_…`, `2_…`, `3_…`)
- Workspaces: `RL Multimodal instructions/workspaces/{repro4,astra4,gemini4}-anvilry`. Shallow history, pnpm deps, `.env.local` from the example (discovery badge flag OFF, so two floating buttons)
- This commit's pinned Playwright browser may not be downloaded. Equal for both models; my scripts run from `workspaces/repro-anvilry`.

## Why this task (the design rationale)
Tasks 1–3 showed that both models solve a single well-known CSS trap equally (task 3 was a tie). Gemini lost on details and side effects (task 1: readability; task 2: the Tailwind class string). This prompt has 3 independent visual bugs with different root causes, and one of them (1) needs a design judgment that the upstream author only solved partially. So completeness and regression-avoidance get tested across several fixes.

## Reproduced on the original (fresh dev server)
| # | Where | Measurement |
|---|---|---|
| 1 | /about and /resume bottom at 390×844 and 320×568 | Fixed "Ask my portfolio" (left 20, 167×42) and ⌘K (right, 72×35) sit over the footer's "Subscribe", "RSS" and "© 2026 Sairam Ugge". In `/?view=chat` the ⌘K button covers the composer caption "Grounded in real work · may simplify details" |
| 2 | Mobile nav drawer open | Backdrop `fixed inset-0 top-14 z-40 bg-bg-base/70 backdrop-blur-sm` has **height 0** (390 and 320), so there's no dimming and tapping outside doesn't close the menu |
| 3 | `/?view=chat` header row | Content is 374px wide in 342px at 390, and in 272px at 320. "AI CONCIERGE" is clipped at the right edge; "Back to Classic" wraps onto 2 lines |

## Ground truth (upstream PR #192, keep away from the models)
1. `globals.css`: `@media (max-width: 768px) { body { padding-bottom: 7rem } }`. Upstream **admits a limitation**: it doesn't reach the chat and developer views, whose `<main>` is height-bounded. A strong fix also clears the chat composer caption.
2. `mobile-nav.tsx`: the `<header>` (site-nav) has `backdrop-blur-md`, which makes it the containing block, so `inset-0` resolves to the header. Fix: `createPortal` the backdrop and drawer panel to `document.body`. Upstream also raised the drawer footer's icon buttons from 20×20 to 44×44 (WCAG 2.5.8), which wasn't asked in our prompt.
3. `chat-view.tsx`: compact/full label split at the `sm` breakpoint for the badge row, plus a scroll-affordance fade (not asked).
(Upstream's 4th fix, Pagefind whitespace, isn't in our prompt.)

## Traps
| Weak fix | Why it fails |
|---|---|
| `z-index` on the backdrop | Still 0 height, because the containing block is the header |
| `h-screen` on the backdrop | The top is still the header's box; stacking stays trapped |
| Remove the header blur | Visual regression on desktop and mobile |
| Hide the floating buttons on mobile or shrink them only | Removes features; doesn't guarantee clearance |
| Padding only on body / only on /about | The chat view caption stays covered (issue 1 says "any page or view") |
| `overflow-x-auto` or `whitespace-nowrap` on the chat row | Hides or scrolls instead of fitting; "AI Concierge" is still clipped at first paint |
| Changing desktop spacing or labels | The prompt forbids desktop changes |

## Evaluation checklist
1. At 390×844 and 320×568: nothing interactive or textual under the floating buttons at the bottom of /about, /resume and one /projects page, and none under ⌘K in `/?view=chat` or `/?view=developer`
2. Drawer: backdrop covers the viewport below the nav, the page is dimmed, tapping outside closes the menu, Escape closes it, and focus behaves sensibly
3. Chat row: every item fully visible at 390 and 320 (scrollWidth ≤ clientWidth), no clipped text
4. Desktop 1440: nav, footer, chat header and floating buttons look unchanged (paired screenshots)
5. No console errors or hydration warnings
6. Rendered verification claims in each transcript match fresh-server measurements (clear `.next` first!)

## Run commands
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/MobileAuditFixes"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra4-anvilry"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/1_about_page_bottom_390px.png" -i "$P/Prompt_Screenshots/2_menu_open_390px.png" -i "$P/Prompt_Screenshots/3_chat_view_390px.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini4-anvilry"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/1_about_page_bottom_390px.png" -f "$P/Prompt_Screenshots/2_menu_open_390px.png" -f "$P/Prompt_Screenshots/3_chat_view_390px.png" \
  -- "$(cat "$P/prompt.txt")"
```
Safety: Gemini used `pkill -f "Google Chrome"` in task 3. **Close your own Chrome (or use Safari) before the Gemini run.**

## Run log and result
- Astra: `rollout-2026-09-25T11-10-57-01a0d714-c235-7b82-bcdf-bb182d6cfab7.jsonl`, 7.1 min, 1,590,116 tokens. Patch: 7 files (+171 −47), including a new `e2e/mobile-layout.spec.ts`
- Gemini: `ses_f28c78291ffeYn4hoQB7kELFER`, 18.4 min, 103 messages, $1.7111 ≈ ₹161.75. Patch: 7 files (+205 −79), including a new `mobile-nav.dom.test.tsx`. It only killed its own `next dev`, not Chrome.
- Verdict: **Astra better on 2, 6, 10; Tie on 1, 3, 4, 5, 7, 8, 9.** Narrow but verifiable.
  - Both fixed all 3 issues at 390, and desktop element positions are identical to the original.
  - Decisive: at 320×568 in chat, Gemini's Send button is at x 305→321 (cut off, the same as the original); Astra's is at 231→275 (fixed).
  - Gemini's own `320px_chat_view.png` shows the cut-off button while its report claims 320 is clear.
  - The overlap lists show one chat chip "under" the floating button for both. That's a measurement artifact: the chip is clipped by its own scroll container.
- Evidence scripts: `compare.mjs`, `record.mjs`. Raw data: `comparison.json`
- Rework: regenerate with fresh servers (repro4 on 3400, astra4 on 3401, gemini4 on 3402), clearing `.next` and `.velite` by literal path first.

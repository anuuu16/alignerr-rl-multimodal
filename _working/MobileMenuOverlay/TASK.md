# Task 3: MobileMenuOverlay (private notes, never uploaded)

**Status:** prepared on 2026-09-24. The task cap was removed the same day, so it is ready to run.

- Repo: https://github.com/junedpathan11/ember-and-oak (Next 16.3.5, React 19, Tailwind 4, npm). No AGENTS.md or CLAUDE.md in the repo
- Base commit: `c6830c3921151ada9b3922ea4bb605505369bdba` (before PR #3, merged 2026-09-12)
- Prompt: `prompt.txt`. Screenshots: `Prompt_Screenshots/before_390px_menu_{closed,open}.png`
- Workspaces: `RL Multimodal instructions/workspaces/{repro,astra,gemini}-ember`. Shallow history (1 commit), `npm ci` done, `.env.local` present
- Dev server: `npm run dev` (or `PORT=xxxx npx next dev`)

## Reproduced (390×844, home page, after tapping the hamburger)
- `#mobile-menu` (`fixed inset-0 z-50`) measures **0→76px** tall instead of 844px. It's sized to the header.
- All 4 links (Home 77, Menu 138, Private Dining 199, Reserve 260) and the phone number (443) sit **outside** the overlay box. They overflow onto the hero with no background, so they're nearly unreadable.
- The WhatsApp FAB (`fixed bottom-5 right-5 z-40`, a sibling of the header in `<body>`) paints **over** the menu.

## Ground truth (keep away from the models)
- `components/blocks/Navbar.tsx`: `<header className="sticky top-0 z-30 border-b bg-bg/95 backdrop-blur-[2px]">`
- A `backdrop-filter` other than `none` (1) makes the header the containing block for `position: fixed` descendants, so `inset-0` resolves to the ~76px header box, and (2) creates a stacking context. The overlay's `z-50` then only competes inside the header, whose `z-30` loses to the FAB's `z-40`.
- Upstream fix: render the overlay with `createPortal(…, document.body)`. Behavior is otherwise unchanged (scroll lock, Escape, close on navigate, autoFocus, ARIA).
- Also valid: move the blur to a pseudo-element or sibling layer, or render the overlay outside `<header>`.

## Traps (these separate a strong fix from a weak one)
| Weak fix | Why it fails |
|---|---|
| Raise the overlay to `z-[9999]` | Still trapped in the header's stacking context, so the FAB stays on top and the height stays 76px |
| `h-screen` / `h-[100dvh]` on the overlay | Fixes the height but not the FAB, and the top is still relative to the header |
| Remove `backdrop-blur` from the header | Fixes both bugs but changes the header design, which the prompt forbids |
| Raise the header's z-index above 40 | The FAB goes under the header while the menu is closed, which is a regression |
| Portal with `useEffect` + `setMounted` | This repo's lint rule `react-hooks/set-state-in-effect` rejects it (upstream PR note) |

## What to check after both runs
1. Overlay is 390×844 at 390px, with a solid `bg-bg` and all links and the phone number inside it, readable
2. FAB hidden under the open menu (use `elementFromPoint` at the FAB centre, which should hit the overlay)
3. Header unchanged at 390 and 1440: blur still present (`backdrop-filter: blur(2px)`), same height and border
4. Closes with X, Escape and a link tap; body scroll lock is released after closing
5. Focus: the close button is focused on open; Tab stays sensible
6. Desktop (≥768): no hamburger, menu never renders, and the FAB still sits above the page content
7. No hydration or console errors (portal on the server)

## Run commands (use the flags that worked for tasks 1 and 2)
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/MobileMenuOverlay"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra-ember"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/before_390px_menu_closed.png" -i "$P/Prompt_Screenshots/before_390px_menu_open.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini-ember"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/before_390px_menu_closed.png" -f "$P/Prompt_Screenshots/before_390px_menu_open.png" \
  -- "$(cat "$P/prompt.txt")"
```
Evaluator note: always delete `.next` before starting a server for comparison (the Tailwind dev cache lesson from task 2).

## Collecting patches
`next dev` (Next 16.3) auto-creates `AGENTS.md` (a Next.js notice for coding agents) and `CLAUDE.md` (`@AGENTS.md`) in the repo root the first time it runs. Neither model writes these files, so exclude them from `final.patch`:
`git ls-files --others --exclude-standard | grep -vE '^(AGENTS|CLAUDE)\.md$' | xargs -r git add -N && git diff > final.patch`
If a model *edits* them, that's model work and belongs in the patch.

## Run log
- Astra: `rollout-2026-09-24T13-43-05-01a0d279-b126-77b2-b660-7c98e575259f.jsonl` (13:43, about 5 min, 756,498 tokens). Portal fix and extras. It used Playwright `chromium.launch({channel:'chrome'})` (headless, temporary profile). No kill commands.
- Gemini: `ses_f2d7f98dcffexuD7u2SCooRgy2` (started 13:50 with `--auto`). At 13:55:51 it launched the real `Google Chrome.app` headless with no `--user-data-dir`. At **13:58:13 it ran `pkill -f "Google Chrome"`, which force-closed the user's open Chrome browser**. Then it relaunched headless Chrome with `--user-data-dir=/tmp/chrome-test-profile`. No crash report was written. The user reported "my chrome crashed". This is not a UI dimension, but it's a factual transcript observation that can go in Author Notes as a note on how Gemini went about the task, if the user agrees.
- Gemini ran the same force-close of all Chrome processes again at 14:06:03 (second time). It also killed an unrelated watcher process whose command line contained that text.

## Comparison result (fresh servers, `.next` cleared): TIE on the UI
Both fixes are correct and render identically. The 390x844 open-menu PNGs are byte-identical.
| Check | Astra (portal) | Gemini (fragment sibling) |
|---|---|---|
| Overlay size 390x844 / 320x568 / 390x480 | full viewport | full viewport |
| Overlay parent | BODY | BODY |
| WhatsApp FAB covered when open | yes | yes |
| Header (h 77/70, blur(2px), sticky z-30) | unchanged | unchanged |
| Close: X / Escape / Home-on-home / Menu link | all close, scroll restored | all close, scroll restored |
| Resize open → 1024 | closes | closes |
| Focus on open | close button | close button |
| Tab past last item | escapes the dialog (to the skip link) | escapes the dialog (to page content), same as the original |
| Console errors | 0 | 0 |
Minor extras: Astra adds `overflow-y-auto` + `shrink-0` (menu scrolls on very short screens). At 390x480 all items were still inside the viewport for both, so there's no visible difference.
Process note (not a UI dimension): Gemini force-closed all of the user's Chrome processes twice (13:58:13 and 14:06:03).
Verdict: no significant, verifiable Astra UI advantage. Don't submit as-is (per the brief: "If both solve the problem equally well... choose another task").
Costs: Astra 756,498 tokens; Gemini $0.7645 ≈ ₹72.27.

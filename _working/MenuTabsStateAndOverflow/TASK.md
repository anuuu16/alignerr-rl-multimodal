# Task 7: MenuTabsStateAndOverflow (private notes, never uploaded)

**Status:** prepared 2026-09-25, models not run yet.

- Repo: https://github.com/junedpathan11/ember-and-oak (Next 16.3.5, React 19, Tailwind 4, npm). No AGENTS.md or CLAUDE.md committed.
- Base commit: `c979d4f8bd52d8f657971763cb7f6c1fd08eb320` (latest main, after PR #4). **Not an upstream-PR task**: there's no merged fix; I found and reproduced these bugs myself.
- `.env.local`: copied from `.env.example` if present (Web3Forms key placeholder, so the reserve form shows "Form not configured").
- Prompt: `prompt.txt`. Screenshots in `Prompt_Screenshots/`: 1 (320, Drinks selected and cut off), 2 (390, Desserts before reserve), 3 (reserve prefilled), 4 (390, after Back, showing Starters)
- Workspaces: `RL Multimodal instructions/workspaces/{repro7,astra7,gemini7}-ember`. Shallow, `npm ci` done.
- Note: `next dev` (Next 16.3) auto-creates `AGENTS.md` (a Next.js notice for coding agents) and `CLAUDE.md` (`@AGENTS.md`) in the repo root on first run. I deleted them from repro7 after reproducing. **Exclude them from both final patches** unless a model edits them.
- Evaluator: run scripts from `workspaces/repro-anvilry` (working Chromium). Use ports 3700 (repro7), 3701 (astra7), 3702 (gemini7).

## Why this task
Previous wins came from side effects (T2 class string, T5 overflow:hidden and shared class) and small-screen details (T4). This task combines:
- a small-screen visual bug where the tempting fix is to hard-code the tabs to fit (wrap, shrink or cut spacing), which changes the design or only fits one width
- a **state** bug whose tempting fix, `useSearchParams()` in the client `MenuTabs` on a static page, needs a `<Suspense>` boundary in Next 16. Without it, `next build` fails or the page opts out of static rendering. The prompt explicitly asks to confirm the production build works.

## Reproduced (original, fresh `next dev`)
| Check | 320×640 | 390×844 | 1440×900 |
|---|---|---|---|
| Tablist `[role=tablist]` | overflow-x: auto; scrollWidth 380 vs clientWidth 320 | fits | fits |
| Drinks tab after tap or End key | **left 303 → right 360 (cut off), scrollLeft stays 0** | 303→360, fully visible | visible |
| Scroll affordance for the tab row | none (no fade, no visible scrollbar hint) | n/a | n/a |
| Desserts → dish "Reserve a table" → Back | **lands on Starters**, scrollY 27 | **Starters**, scrollY 0 | **Starters**, scrollY 0 |
| URL after Back | `/menu` (no category state) | `/menu` | `/menu` |
| Reserve `?dish=` prefill for all 16 dishes | ✅ correct | ✅ | ✅ |
Keyboard: Arrow, Home and End work (from PR #4) and must keep working.

## Ground truth (keep away from the models)
Files: `components/blocks/MenuTabs.tsx` ("use client"; `useState(site.menu[0].id)`; tab buttons in `[role=tablist]` with `overflow-x-auto`; panels rendered with `hidden`), page `app/(pages)/menu/page.tsx` (server, static).
A good fix:
1. When the active tab changes (click, tap or keyboard), scroll the selected tab into view within the strip, e.g. `tab.scrollIntoView({ block: "nearest", inline: "nearest" })` or by setting the tablist's `scrollLeft`. Optionally add a subtle edge fade or padding as a scroll affordance without changing the look. Keep `overflow-x-auto`.
2. Persist the active category in the URL (for example `?category=desserts` or `#desserts`) with `history.replaceState` or `router.replace(…, { scroll: false })`, and initialise from it on load:
   - either read `window.location` in an effect (no hydration mismatch; brief Starters flash is acceptable)
   - or use `useSearchParams()` **wrapped in `<Suspense>`** in the page
   - sessionStorage is an acceptable alternative for Back, but it doesn't give shareable links (the prompt asks that "a link to the menu with a specific category open should also work")
   Back from /reserve should then show Desserts, and scroll restoration should bring the user back near the dish.
3. Keep the ARIA wiring (aria-selected, aria-controls, roving tabindex, hidden panels) and Arrow/Home/End.

## Traps
| Weak fix | Problem |
|---|---|
| `flex-wrap` on the tabs, smaller font or reduced gap to fit 320 | Changes the look; still breaks at narrower widths or with longer labels |
| Hide the overflow (`overflow-hidden`) | Drinks unreachable |
| `useSearchParams()` in MenuTabs without Suspense | `next build` error ("should be wrapped in a suspense boundary") or CSR bailout of /menu |
| Read `location` or `sessionStorage` in the `useState` initializer | Hydration mismatch warning |
| `router.push` on every tab change | Floods history, so Back walks through tabs instead of leaving the page |
| `scrollIntoView()` without `block: "nearest"` | Page jumps vertically when switching tabs |
| Breaking the roving tabindex, aria-controls or Home/End | Keyboard or a11y regression |

## Evaluation checklist
1. 320 and 360: after tapping Drinks and after End, the selected tab's rect is fully within the viewport; the page doesn't jump vertically (compare scrollY before and after)
2. 390 and 1440: tabs look unchanged (paired screenshots and rects vs original)
3. Desserts → reserve → Back at 320, 390, 1440 → Desserts selected, near the previous scroll position
4. Deep link (`/menu?category=desserts`, `#desserts`, or whatever the model chose) opens that tab; an unknown value falls back to Starters
5. History: switching tabs 3 times then pressing Back once leaves the menu page (no history flooding)
6. Keyboard: Arrow, Home and End work; roving tabindex intact; aria-selected and aria-controls correct
7. `npm run build` succeeds; /menu is still prerendered static (check the build output route table); no console or hydration errors
8. Transcript claims match fresh-server results (clear `.next` by literal path)

## Run commands
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/MenuTabsStateAndOverflow"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra7-ember"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/1_menu_drinks_tab_selected_320px.png" -i "$P/Prompt_Screenshots/2_menu_desserts_before_reserve_390px.png" \
  -i "$P/Prompt_Screenshots/3_reserve_page_prefilled_390px.png" -i "$P/Prompt_Screenshots/4_menu_after_back_390px.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes; close Chrome first, since Gemini ran pkill on Chrome in task 3)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini7-ember"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/1_menu_drinks_tab_selected_320px.png" -f "$P/Prompt_Screenshots/2_menu_desserts_before_reserve_390px.png" \
  -f "$P/Prompt_Screenshots/3_reserve_page_prefilled_390px.png" -f "$P/Prompt_Screenshots/4_menu_after_back_390px.png" \
  -- "$(cat "$P/prompt.txt")"
```

## Run log (in progress)
- Astra: `rollout-2026-09-25T21-34-26-01a0d94f-950b-7411-8e12-e603718de20d.jsonl`, 8.0 min, 1,336,248 tokens. It uses `useSearchParams` for `?category=` and wraps `<MenuTabs/>` in `<Suspense>` **with no fallback**, plus scroll-into-view and edge-fade cues.
  - `next build` passes and /menu is still ○ static, BUT the prerendered `menu.html` visible markup has **0 dish names, 0 role=tab, and 1 "Reserve a table" (the header's)**, vs the original's 9 dishes, 4 tabs and 33 links (57 KB → 10 KB visible HTML). The menu content is client-only, so the menu area is blank before hydration and there are no dishes for crawlers or no-JS visitors. **This is a regression to weigh.**
- Gemini: `opencode run --auto`, started 21:45.
- Gemini: `ses_f26a6b6dcffebPKMRhykp6kXpG`, 16.6 min, 84 msgs, $1.4163 ≈ ₹134. Page reads `searchParams` (so /menu becomes ƒ dynamic), pushState per tab click, `lib/menu.ts` helper, supports `#hash`. Its only rm/kill: its own /tmp test scripts and next dev.
- Verdict (production builds): **mixed. Astra better on 7 (history), Gemini better on 8 (menu in the HTML), Tie on the other 8.** No significant Astra advantage. Packaged honestly at the user's request.
  - Both: End key at 320 gives Drinks 243→300 (orig 283→340); Back restores Desserts and the scroll position at 320, 390, 1440; ?category works; tab strip at 390/1440 identical; no page jump; keyboard intact.
  - Astra regression: prerendered /menu has 0 tabs and 0 dishes (Suspense with no fallback).
  - Gemini regressions: /menu is dynamic; after 3 tab clicks, Back stays on the menu.
- Scripts: `compare.mjs` (uses waitUntil 'load' because Astra's page never hit networkidle), `record.mjs`. Data: `comparison.json`. Build logs were in the scratchpad; the route tables are copied into `measurements.json`.

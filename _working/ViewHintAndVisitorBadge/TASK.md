# Task 6: ViewHintAndVisitorBadge (private notes, never uploaded)

**Status:** prepared 2026-09-25, models not run yet.

- Repo: https://github.com/sairam0424/anvilry. Base commit `14fb8065c67f51803683f14ccbd29946a103eafc` (before PR #185)
- `.env.local` = `.env.example` + `NEXT_PUBLIC_VISITOR_COUNTER=true` (all three workspaces). No Redis, so `/api/visit` returns `{"total":0,"today":0}`
- Prompt: `prompt.txt`. Screenshots in `Prompt_Screenshots/`: /work 390 hint, /projects 1440 hint, footer skeleton after 15s
- Workspaces: `RL Multimodal instructions/workspaces/{repro6,astra6,gemini6}-anvilry`

## Why this task
Wins so far came from side effects and regressions (tasks 2 and 5) and small-screen details (task 4). This task combines a scoping bug (with tempting wrong fixes) and a **state** bug where two of four states must stay exactly as they are. That tests dimension 7 (interactions/state) and regression avoidance.

## Reproduced (original, fresh browser)
**Hint** (`src/components/view-hint.tsx`: `if (dismissed || !dwelled || view !== "classic") return null;`, fixed; top-16 inset-x-3 on mobile, bottom-5 right-44 on desktop):
- Shows after the dwell delay on `/`, `/work`, `/projects`, `/articles` and `/work/pensieve` at 390 and 1440, covering "// production work @ Ascendion", "// open-source AI infrastructure", "// writing — 8 articles" (390) and project cards, article titles and "Impact" (1440). On `/` it's intended.

**Visitor badge** (`src/components/site-footer.tsx` `VisitorBadge`): `total` starts null, the cache seeds it if present, and the API only sets it when `total > 0`. null renders the skeleton and 0 renders nothing.
| State | Original | Required |
|---|---|---|
| A. First visit, API `{total:0}` | skeleton forever ❌ | hide (no fake number) |
| B. Cached 1234, API `{total:0}` | "↑ 1,234 engineers visited" ✅ | unchanged |
| C. First visit, API 500 / network error | skeleton forever ❌ | hide |
| D. First visit, API `{total:4321}` | "↑ 4,321 engineers visited" and cached ✅ | unchanged |
| E. Slow API (a few seconds) | skeleton, then the result | a brief skeleton is fine; must resolve |

## Ground truth (upstream PR #185, keep away from the models)
1. view-hint: add a pathname check (`usePathname() === "/"`) so the hint only renders on the home route.
2. site-footer: when the API resolves with no usable count and there's no cached value, set state so the badge hides (for example `setTotal(prev => prev ?? 0)`); same on error. Cached-value behavior untouched.

## Traps
| Weak fix | Problem |
|---|---|
| Hide the hint on mobile only, or move or restack it | Still covers content on desktop content pages, or changes the design |
| Remove the hint entirely | Removes an intended feature on `/` |
| Show "0 engineers visited" or "—" | Fake or placeholder number; the prompt says show nothing |
| `setTotal(0)` unconditionally on API 0 | Wipes the cached count, so B breaks |
| A timeout that hides the badge even when a cache exists | B breaks |
| Remove the skeleton altogether | Layout shift and no loading state; D should still show a brief skeleton → number |
| Write 0 to localStorage | Poisons the cache for later visits |

## Evaluation checklist
1. Hint: present on `/` after the dwell delay (390 and 1440), absent on /work, /projects, /articles and /work/pensieve (390 and 1440). Dismiss still works on `/`.
2. Badge states A–E with `page.route` mocks (fresh context per state), at 1440 and 390. Check the final DOM and the localStorage value after each.
3. Nothing else visually changed (footer layout, hint styling on `/`).
4. No console errors or hydration warnings.
5. Transcript claims match fresh-server results (clear `.next` and `.velite` by literal path).

## Run commands
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/ViewHintAndVisitorBadge"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra6-anvilry"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/1_work_page_390px.png" -i "$P/Prompt_Screenshots/2_projects_page_1440px.png" \
  -i "$P/Prompt_Screenshots/3_footer_first_visit_after_15s_1440px.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes; close Chrome first)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini6-anvilry"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/1_work_page_390px.png" -f "$P/Prompt_Screenshots/2_projects_page_1440px.png" \
  -f "$P/Prompt_Screenshots/3_footer_first_visit_after_15s_1440px.png" \
  -- "$(cat "$P/prompt.txt")"
```

## Run log and result
- Astra: `rollout-2026-09-25T20-14-15-01a0d906-2d22-73e0-bad0-d8072b3aa311.jsonl`, 5.6 min, 1,136,665 tokens. Patch: 5 files; the hint moved from layout.tsx to page.tsx; the badge gets a loading flag, a 10s AbortController timeout and an isRealCount check; plus an e2e spec.
- Gemini: `ses_f26f3d515ffecZ6ncHahffoQJZ`, 13.9 min, 81 msgs, $0.9163 ≈ ₹86.6. Patch: 4 files; `usePathname() === "/"` gate; the badge tracks cachedCount and calls setTotal(0) on 0/error when there's no cache; `<p mt-2>` moved inside; unit tests.
- Its /tmp/verification_screenshots also held task 4's old files. Only the 7 from this run (20:31–20:33) were copied.
- Verdict: **Astra better on 7 and 9; Tie on 1, 2, 3, 4, 6, 8, 10; N/A on 5.** Narrow.
  - The only difference is state E (first visit, API hangs): Gemini's skeleton is still present at 15s, and Astra hides it after its 10s timeout.
  - All other states (A, B, C, C2, D, E2, F) and the hint are equal.
- Scripts: `compare.mjs`, `record.mjs`. Data: `comparison.json`

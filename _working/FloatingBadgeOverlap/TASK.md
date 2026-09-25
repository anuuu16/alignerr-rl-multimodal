# Task 8: FloatingBadgeOverlap (private notes, never uploaded)

**Status:** prepared 2026-09-25, models not run yet.

- Repo: https://github.com/sairam0424/anvilry. Base commit `48f3a14aff09b7a8609f7d9634a5bd8a93d37b42` (before PR #212; #210 already merged)
- `.env.local` = `.env.example` + `NEXT_PUBLIC_DISCOVERY_BADGES=true` (all three workspaces). The badge renders only when ≥1 discovery is in `localStorage["anvilry:discoveries"]` (unlocked by switching views, asking the chat, etc.). For evaluation, seed `["view-switch","chat-question"]` with an init script (this shows "★ 2/5 discovered").
- Prompt: `prompt.txt`. Screenshots in `Prompt_Screenshots/`: chat 390, /about 390, chat 640
- Workspaces: `RL Multimodal instructions/workspaces/{repro8,astra8,gemini8}-anvilry` (shallow, pnpm deps installed). Evaluator ports 3800/3801/3802.

## Why this task
Tasks 4 and 5 showed Gemini loses on precise multi-breakpoint layout and on fixes with side effects. Here, three independently positioned fixed elements (the ⌘K trigger, the discovery badge, and the chat composer's mic/Send) collide at different breakpoints and in different views. The upstream fix (#212) is a **single breakpoint-offset change to the badge** and doesn't resolve every collision measured below, so a complete fix needs real measurement at 320, 390, 640 and 1440 across views. The obvious fixes (z-index, hiding the badge, moving the trigger back down) each break something.

## Reproduced (original, badge seeded with 2/5)
Rects are [left, top, right, bottom] in px.
| Viewport / view | ⌘K trigger | Badge | Composer Send | Collisions |
|---|---|---|---|---|
| 390×844 chat | [298,729,370,764] | [229,748,370,778] | [301,730,345,774] | **badge↔trigger, trigger↔Send, badge↔Send** |
| 390×844 developer | same | same | n/a | **badge↔trigger** |
| 390×844 /about | same | same | n/a | **badge↔trigger** (badge text half hidden) |
| 320×568 chat | [228,453,300,488] | [159,472,300,502] | [231,454,275,498] | **all three** |
| 320×568 developer, /about | same | same | n/a | **badge↔trigger** |
| 640×900 chat | [490,845,620,880] | [479,804,620,834] | [547,782,591,826] | **badge↔Send** |
| 640×900 developer, /about | same | same | n/a | none |
| 1440×900 all | [1290,845,1420,880] | [1279,804,1420,834] | [1011,782,1055,826] | none (desktop is correct and must stay) |

Cause: `command-palette.tsx` trigger is `fixed bottom-20 right-5 … sm:bottom-5` (#210 raised it on mobile). `discovery-badge.tsx` is `fixed bottom-[calc(1.25rem+46px)] right-5 z-30` at **all** widths, so below `sm` it now sits *under* the trigger. In the chat view the composer's mic/Send sit in the same bottom-right band at <sm (trigger too) and at sm–md (badge).

## Ground truth
Upstream PR #212 (keep away from the models) only changed the badge: `bottom-[calc(5rem+46px)] … sm:bottom-[calc(1.25rem+46px)]`, stacking it 46px above the trigger at each breakpoint. That fixes badge↔trigger at <sm, but by my rects:
- trigger↔Send at 390 and 320 chat is still present (the trigger at bottom-20 is still in the composer's band)
- badge↔Send at 640 chat is still present

So a fully correct fix goes beyond upstream. For example, reserve space for the floating cluster in the chat composer (or lift the cluster above the composer in the chat and developer views), and keep the badge stacked above the trigger at every breakpoint from one shared offset so they can't drift apart again. Desktop 1440 positions must stay unchanged.

## Traps
| Weak fix | Problem |
|---|---|
| Raise the badge's z-index above the trigger | Badge readable but still overlapping ⌘K and Send; tap targets still overlap |
| Hide the badge on mobile | Removes a feature |
| Move the trigger back to `bottom-5` on mobile | Re-breaks what #210 fixed (trigger vs composer at the very bottom) |
| Upstream-only badge offset | Leaves trigger↔Send (390/320 chat) and badge↔Send (640 chat) |
| Hard-coded pixel offsets tuned for 390 only | Breaks at 320 or 640 |
| Changing desktop offsets | The prompt says desktop must stay the same |

## Evaluation checklist
1. For each of 320×568, 390×844, 640×900 and 1440×900 × {`/?view=chat`, `/?view=developer`, `/about`}: no pairwise rect overlap among the trigger, badge, composer mic and composer Send (use elementFromPoint at each control's centre too)
2. Badge text fully visible (not covered by the trigger)
3. Desktop 1440 rects identical to the original
4. The composer is still usable (input, mic, Send visible and clickable) and the chips are unchanged
5. The badge still appears only with discoveries >0, and the ⌘K trigger still opens the palette
6. No console errors
7. Transcript claims match fresh-server measurements (clear `.next` and `.velite` by literal path)

## Run commands
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/FloatingBadgeOverlap"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra8-anvilry"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/1_chat_view_390px.png" -i "$P/Prompt_Screenshots/2_about_page_390px.png" -i "$P/Prompt_Screenshots/3_chat_view_640px.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes; close Chrome first)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini8-anvilry"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/1_chat_view_390px.png" -f "$P/Prompt_Screenshots/2_about_page_390px.png" -f "$P/Prompt_Screenshots/3_chat_view_640px.png" \
  -- "$(cat "$P/prompt.txt")"
```
Collecting: Gemini's `/tmp` screenshot folders may contain files from older runs. Copy only the files named in its transcript, with timestamps inside its run window.

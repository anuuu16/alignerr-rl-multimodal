# Task 5: ScrollbarAndResumeSeam (private notes, never uploaded)

**Status:** prepared 2026-09-25, models not run yet.

- Repo: https://github.com/sairam0424/anvilry. Base commit `af3ee40dd68f633f772bba14e2c991cfaaed9578` (before PR #180)
- `.env.local` = `.env.example` + `NEXT_PUBLIC_OPEN_TO_WORK=true` (production config, which shows the banner). **Both model workspaces have it.**
- Prompt: `prompt.txt`. 4 screenshots in `Prompt_Screenshots/` (resume Web tab 1440; chat and developer after scroll 1440; chat after scroll 390)
- Workspaces: `RL Multimodal instructions/workspaces/{repro5,astra5,gemini5}-anvilry` (shallow, pnpm deps installed)

## Why this task
Tasks 2 and 4 showed Gemini loses on precision details it doesn't measure. Problem 2 here has a **hidden second cause**: fixing the obvious banner height still leaves **1px** of overflow from the header border. Only exact measurement reaches 0, and the prompt explicitly asks for "exact measurements".

## Reproduced (original, fresh server, banner on)
| Check | 1440×900 | 390×844 |
|---|---|---|
| `/?view=chat` page overflow (scrollHeight − innerHeight) | **38px** | **80px** |
| `/?view=developer` page overflow | **38px** | **80px** |
| Header height (the calc assumes 3.5rem = 56px) | **57px** (1px border-bottom) | 57px |
| /resume Web tab | opaque `bg-bg-base px-4 py-10 …` wrapper covering the grid from y≈422 for 2,492px | from y≈492 for 3,028px |
The banner is ~37px at desktop and wraps taller on phones (~79px), which is why the phone overflow is larger.

## Ground truth (upstream PR #180, keep away from the models)
1. `src/components/home/resume-view.tsx`: `ResumeViewInline` reused `ResumeView`'s wrapper class containing opaque `bg-bg-base`. Split `WRAPPER_CLASS` so only the standalone `?view=resume` page keeps a solid background.
2. `src/app/globals.css`: the body's decorative grid changed from `background-attachment: fixed` to a `position: fixed` pseudo-element. This is a robustness fix and not required by our prompt.
3. `chat-view.tsx` / `developer-view.tsx`: main is `h-[calc(100dvh-3.5rem)]`, so subtract the banner height when `NEXT_PUBLIC_OPEN_TO_WORK` is on. `site-nav.tsx`: give the header `h-14` so the border stays inside 3.5rem (border-box). **Both are needed for 0px.**

## Traps and what separates the fixes
| Weak fix | Result |
|---|---|
| Subtract a hard-coded ~37px for the banner | Desktop goes to 1px (border); phones stay broken because the banner wraps to ~79px |
| Subtract the banner but not the border | 1px overflow remains, so the page still scrolls 1px |
| `overflow: hidden` on body/html in these views | Hides the symptom and may clip content; it's hiding, not fixing |
| Remove the banner in these views | Changes the design and removes content |
| Resume: remove `bg-bg-base` from the shared class | The standalone `?view=resume` page loses its solid background, a regression |
| Resume: add the grid background to the wrapper | Duplicated or misaligned grid (the grid is fixed-attachment on body), so a seam or pattern shift remains |

## Evaluation checklist
1. `scrollHeight − innerHeight` = 0 in the chat and developer views at 1440×900, 1024×768, 390×844 and 320×568 (banner on)
2. The transcript and terminal still scroll internally; the composer/input is fully visible; nothing is clipped at the bottom
3. Nav not pushed out of view by wheel or touch scroll
4. /resume Web tab: no seam; grid continuous and aligned with the header area; the PDF tab and `/?view=resume` unchanged
5. Everything else unchanged (other pages, desktop layout)
6. With the banner flag OFF, no regression (0 overflow, no gap)
7. Transcript claims match fresh-server measurements (clear `.next` and `.velite` by literal path)

## Run commands
```bash
P="/Users/anu/Desktop/PersonalProjects/Alignerr/alignerr-rl-multimodal/_working/ScrollbarAndResumeSeam"
# Astra
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/astra5-anvilry"
codex exec -m gpt-6-astra -c model_reasoning_effort=medium --dangerously-bypass-approvals-and-sandbox \
  -i "$P/Prompt_Screenshots/1_resume_web_tab_1440px.png" -i "$P/Prompt_Screenshots/2_chat_view_after_scroll_1440px.png" \
  -i "$P/Prompt_Screenshots/3_developer_view_after_scroll_1440px.png" -i "$P/Prompt_Screenshots/4_chat_view_after_scroll_390px.png" \
  -- "$(cat "$P/prompt.txt")"
# Gemini (after Astra finishes; close Chrome first)
cd "/Users/anu/Desktop/PersonalProjects/Alignerr/RL Multimodal instructions/workspaces/gemini5-anvilry"
opencode run --auto -m google/gemini-3.8-flash \
  -f "$P/Prompt_Screenshots/1_resume_web_tab_1440px.png" -f "$P/Prompt_Screenshots/2_chat_view_after_scroll_1440px.png" \
  -f "$P/Prompt_Screenshots/3_developer_view_after_scroll_1440px.png" -f "$P/Prompt_Screenshots/4_chat_view_after_scroll_390px.png" \
  -- "$(cat "$P/prompt.txt")"
```

## Run log and result
- Astra: `rollout-2026-09-25T19-19-06-01a0d8d3-ac74-7d12-b8c9-69c01418b00f.jsonl`, 5.4 min, 1,095,786 tokens. Patch: 6 files (+90 −24), including `e2e/viewport-layout.spec.ts`
- Gemini: `ses_f27261929ffe6EstkBKcqBnQw2`, 18.9 min, 105 messages, $1.8088 ≈ ₹171. Patch: 6 files (+38 −21), including `ui/skeleton.tsx`. No kill commands.
- Verdict: **Astra better on 2, 4, 6, 9; Tie on 1, 3, 7, 8, 10; N/A on 5.**
  - Both reach 0 overflow at 1440, 1024 and 390, both fix the seam, and both are fine with the banner off.
  - Gemini regression 1: `/?view=resume` background goes from rgb(7,8,13) to transparent (it removed `bg-bg-base` from the shared class; Astra restored it on ResumeView).
  - Gemini regression 2: `overflow: hidden` on html and body, so at 320×568 the chat input (571→617) can't be reached by wheel or touch. Astra's is reachable via a 100px body scroll (497→543).
  - Astra limitation: that 100px inner scroll at 320×568.
- Scripts: `compare.mjs`, `record.mjs`. Data: `comparison.json`

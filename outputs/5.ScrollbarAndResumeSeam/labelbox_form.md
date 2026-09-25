# ScrollbarAndResumeSeam: Labelbox form answers

**Status:** Submitted (2026-09-25)
**Labelbox data row:** https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01o80738mnt1wt6q

## Task Name
Chat and developer views scroll when they shouldn't, and the /resume Web tab has a background seam

## Task Description
In the anvilry portfolio (Next.js 16, React 19, Tailwind v4) at commit af3ee40, run with the production "Open to work" banner enabled (NEXT_PUBLIC_OPEN_TO_WORK=true), there are two layout problems.

1. On /resume's Web tab, the site's grid background stops partway down the page, leaving a hard seam: the header area shows the grid and everything below is a flat solid block. The PDF tab doesn't have this.
2. The chat view (/?view=chat) and developer view (/?view=developer) are meant to fill the window exactly, with only the transcript or terminal scrolling inside. Instead the whole page scrolls (38px at 1440×900, 80px at 390×844), which pushes the top nav partly out of view.

Both models received the same prompt and four screenshots: the resume Web tab at 1440px, the chat and developer views after scrolling at 1440px, and the chat view after scrolling at 390px. They were asked to find the root causes and fix them without changing anything else about how the pages look, then verify in a browser at desktop width and 390px, reporting exact measurements for the scrolling problem.

## Task info
- Repo: https://github.com/sairam0424/anvilry
- Commit: af3ee40dd68f633f772bba14e2c991cfaaed9578
- Environment: `.env.local` from `.env.example` plus `NEXT_PUBLIC_OPEN_TO_WORK=true`, identical for both models
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same four screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_ScrollbarAndResumeSeam.zip

All "after" evidence was captured by me from both final patches on freshly started dev servers (build caches cleared), with the same script, at the same viewports: `after_screenshots/`, `recordings/` and `measurements.json` in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified that the Web résumé's shared wrapper class carries an opaque `bg-bg-base` that covers the body's grid, causing the seam. Both also found that the chat and developer heights use `calc(100dvh-3.5rem)`, which ignores the banner (about 37px on desktop, 79px when it wraps on phones) and the header's extra 1px border (57px instead of 56px). Both also found that the developer view forces a minimum height on phones.

## 02. Layout, alignment, and spacing
**Choice:** Astra better
**Justification:**
At 1440×900, 1024×768 and 390×844, both remove the page-level overflow completely: `scrollHeight − innerHeight` is 0 in both views (it was 38px, 38px and 80px). The nav stays at top 0 after wheel scrolling, the composer and terminal input are visible, and long terminal output scrolls inside the log (`measurements.json`).

The difference is on a short phone, 320×568. There the chat content is taller than the screen in both results. In Gemini's result the chat input and Send button sit below the fold (input 571→617 on a 568px viewport), and because Gemini set `overflow: hidden` on `<html>` and `<body>` for these views, neither wheel nor touch scrolling can bring them into view. In Astra's result the same content scrolls inside the page body by 100px, which brings the input into view (497→543). Evidence: `after_320x568_chat_after_user_scroll.png` and `recordings/chat_320x568_try_to_reach_input.webm` in both folders.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. Neither changes fonts, sizes or text hierarchy. The résumé content, chat heading, metric cards, suggestion chips and terminal text render the same as the original in both at 1440 and 390.

## 04. Colors and component styling
**Choice:** Astra better
**Justification:**
Both fix the Web tab: the grid now continues the whole way down in both (no opaque block over 400px tall remains in main).

The prompt also said not to change anything else about how the pages look, and here they differ. Both removed `bg-bg-base` from the wrapper class shared by the Web tab and the standalone résumé page (`/?view=resume`). Astra added `bg-bg-base` back on the standalone `ResumeView`, so that page keeps its solid rgb(7, 8, 13) background exactly as before. Gemini didn't, so the standalone résumé's background is now transparent and the grid and glow show behind it. Evidence: `after_1440x900_view_resume_standalone.png` in both folders; `measurements.json` → `?view=resume` background.

## 05. Images, icons, and visual assets
**Choice:** Not applicable
**Justification:**
No images or icons are involved. The grid is a CSS background on body and is assessed under 04. Icons in the nav, banner, chat and terminal are unchanged in both.

## 06. Responsive and adaptive behavior
**Choice:** Astra better
**Justification:**
Both handle the banner wrapping on phones without hard-coding its height (both use flex layout for the remaining space), and both reach 0 page overflow at 1440, 1024 and 390. With the banner turned off, both still fill the viewport exactly with no gap (main bottom = viewport height at 1440 and 390).

At 320×568, Gemini's `overflow: hidden` leaves the chat composer out of reach, while Astra's layout keeps it reachable (see 02). Being fair to Gemini: at 320×568 Astra's result isn't perfectly scroll-free either, because the body scrolls by 100px there. But no content becomes unreachable.

## 07. UI interactions and state behavior
**Choice:** Tie
**Justification:**
Comparable. The wheel doesn't move the page in either result at 1440, 1024 or 390 (`scrollY` stays 0 and the nav stays at top 0; `recordings/chat_and_developer_1440_wheel.webm`). After four `help` commands, the developer terminal scrolls internally (log scrollHeight 2,532 vs clientHeight 462 at 1440) with the input still visible in both. The 320×568 reachability difference is counted under 02, 06 and 09.

## 08. Accessibility and usability
**Choice:** Tie
**Justification:**
Both keep the existing landmarks, labels and focus order and add no new controls. Neither adds console errors. The usability impact of Gemini's unreachable composer at 320×568 is assessed under 02, 06 and 09, not counted again here.

## 09. UI fix completeness and regression avoidance
**Choice:** Astra better
**Justification:**
Both fix both requested problems at the verified sizes. Gemini's patch introduces two regressions that Astra's doesn't:
1. The standalone résumé page (`/?view=resume`) loses its solid background, because Gemini removed `bg-bg-base` from the shared class without restoring it where it was needed.
2. `overflow: hidden` on html and body in these views hides overflow instead of fixing it. On a 320×568 phone the chat input becomes unreachable, whereas in the original it could at least be scrolled to.

Astra fixed the causes with a flex layout and kept the standalone page unchanged. Its limitation: a 100px inner scroll remains at 320×568.

## 10. Rendered verification and visual evidence
**Choice:** Tie
**Justification:**
Both rendered and measured at 1440×900 and 390×844 with the banner on and reported exact numbers (document scrollHeight equal to the viewport, scrollY 0 after the wheel, internal log scrolling), and my fresh-server measurements match both. Astra saved screenshots plus a measurement table and added an e2e spec. Gemini saved screenshots of each iteration and ran the unit suite, e2e and lint. Neither checked the standalone `/?view=resume` page or a 320px-tall phone, so neither reported the issues above. Comparable, with the same blind spots.

---

## Overall UI comparison
Both models found the real causes and reach the key measurable target: 0px page overflow in the chat and developer views at 1440, 1024 and 390 with the banner on, the nav no longer pushed off-screen, and the résumé Web-tab seam gone.

The difference is in regressions. Gemini's fix changes two things the prompt said to leave alone:
- The standalone résumé page (`/?view=resume`) loses its solid background.
- Forcing `overflow: hidden` on the page makes the chat input and Send button unreachable on a 320×568 phone (571→617 on a 568px screen; wheel and touch scrolling do nothing).

Astra restored the standalone résumé background and fixed the heights with a flex layout, so nothing becomes unreachable. At 320×568 it leaves a small 100px inner scroll instead of zero scroll.

This is a verifiable Astra advantage on regression avoidance and on small-phone usability, with equal results on the two headline measurements.

## Author Notes
Required: remove the Web-tab seam on /resume, and make the chat and developer views fit the window with no page scroll (banner on), without changing anything else, verified at desktop and 390px.

Both reached 0px page overflow at 1440, 1024 and 390, and both removed the seam (`measurements.json`, `after_*_after_wheel.png`, `after_*_resume_web_tab.png`).

Astra removed `bg-bg-base` from the shared résumé wrapper and restored it on the standalone ResumeView. It used a flex layout, scoped with a `data-viewport-view` attribute, to fill the remaining height after the nav, banner and border.

Gemini removed `bg-bg-base` from the shared wrapper only, and forced `overflow: hidden` on html and body in these views.

Result:
- `/?view=resume` keeps its solid rgb(7, 8, 13) background in Astra and becomes transparent in Gemini (`after_1440x900_view_resume_standalone.png`).
- At 320×568 the chat input is reachable by scrolling in Astra (497→543) and unreachable in Gemini (571→617; `after_320x568_chat_after_user_scroll.png`, `recordings/chat_320x568_try_to_reach_input.webm`).

Why it matters: the prompt said not to change anything else, and on small phones Gemini's version leaves users unable to type a question.

Astra limitations: at 320×568 a 100px inner body scroll remains, and it didn't report checking 320px or the standalone résumé page.

Gemini strengths: the same correct diagnosis (including the 1px border and the phone banner wrap), exact and accurate measurements at 1440 and 390, and broader test runs.

Non-UI note: Astra took about 5.4 minutes and Gemini about 18.9. This isn't used as UI evidence.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

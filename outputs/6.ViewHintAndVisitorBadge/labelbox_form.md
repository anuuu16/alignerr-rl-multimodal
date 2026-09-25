# ViewHintAndVisitorBadge: Labelbox form answers

**Status:** Submitted (2026-09-25)
**Labelbox data row:** https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01o60738h6eo6954

## Task Name
"Try a different view" hint covers content on inner pages, and the footer visitor counter is stuck loading

## Task Description
In the anvilry portfolio (Next.js 16, React 19, Tailwind v4) at commit 14fb806, with the footer visitor counter enabled (NEXT_PUBLIC_VISITOR_COUNTER=true) and no Redis configured (so /api/visit returns a total of 0, as it does in production when Redis is down), there are two problems.

1. The floating "Try a different view" hint, meant only for the home page, also appears on /work, /projects, /articles and the individual work pages. There it covers real content: the page heading at 390px and project cards at desktop width.
2. For a first-time visitor, the footer visitor counter's grey loading placeholder never goes away when no count is available.

The expected behavior:
- when there's no real count, show nothing (never a fake number)
- returning visitors keep seeing their last cached count
- a real count from the API is still shown and remembered

Both models received the same prompt and three screenshots (/work at 390px, /projects at 1440px, and the footer 15 seconds after a first visit). They were asked to find the root causes and fix them without changing anything else about how the pages look, then verify in a browser at 390px and desktop width, including the different visitor-counter cases.

## Task info
- Repo: https://github.com/sairam0424/anvilry
- Commit: 14fb8065c67f51803683f14ccbd29946a103eafc
- Environment: `.env.local` from `.env.example` plus `NEXT_PUBLIC_VISITOR_COUNTER=true`, identical for both models
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same three screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_ViewHintAndVisitorBadge.zip

All "after" evidence was captured by me from both final patches on freshly started dev servers (build caches cleared), with the same script, at the same viewports, using a fresh browser context per visitor-counter case. The /api/visit response for each case was controlled with request interception. Files: `after_screenshots/`, `recordings/` and `measurements.json` in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified that `ViewHint` is mounted in the shared root layout and only checks the view state, so it renders on every route. Both also identified that the counter's `total` stays `null` (the skeleton) for a first-time visitor because the API's 0 or error response never updates it. Both kept the intended behavior: the hint on the home page and the cached count for returning visitors.

## 02. Layout, alignment, and spacing
**Choice:** Tie
**Justification:**
Both perform well. After 8 seconds, the hint no longer appears on /work, /projects, /articles or /work/pensieve at 390 or 1440, so the headings and cards it covered are clear (`after_*_work_after_8s.png`, `after_*_projects_after_8s.png`). It still appears on the home page in the same position as before (`after_*_home_after_8s.png`).

When the counter is hidden, the footer's first block is slightly shorter than when a count shows, in both results (1440: 130px vs 152px; 390: Astra 202px, Gemini 194px vs 226px). Gemini's version is 8px tighter at 390 because it moved the badge's `mt-2` wrapper inside the component, so no empty paragraph remains. When a count is shown, both match the original height exactly.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. The counter text ("↑ 1,234 engineers visited"), footer text and hint copy keep their original fonts and styles. Neither changed any typography.

## 04. Colors and component styling
**Choice:** Tie
**Justification:**
Both perform well. Neither changed the hint card's styling or the skeleton and badge styling. When they're shown, they look the same as in the original.

## 05. Images, icons, and visual assets
**Choice:** Not applicable
**Justification:**
No images or icon assets are involved in either fix. The hint's sparkle and close icons are unchanged, and I checked that the hint still shows on `/` (02).

## 06. Responsive and adaptive behavior
**Choice:** Tie
**Justification:**
Both perform well at both requested widths. The hint is scoped to `/` at 390 and 1440 (its mobile top position and desktop bottom-right position are unchanged there), and the counter behaves the same at both widths in each result. The one counter difference (07) isn't width-specific.

## 07. UI interactions and state behavior
**Choice:** Astra better
**Justification:**
I tested eight counter states at 390 and 1440, each in a fresh browser (`measurements.json` → `badge`). In both results:
- first visit with a 0 response, a 500 response or a network error → hides the placeholder
- cached count with a 0 response, a 500 response or a hung request → keeps showing "1,234"
- a real count (4321) → shown and saved to localStorage

The difference is the case where the request never completes. Gemini's placeholder is still pulsing after 15 seconds (`after_1440_footer_E_first_visit_API_hangs.png`, `recordings/footer_first_visit_api_hangs_14s.webm`). Astra aborts the request after 10 seconds and hides the placeholder. The prompt says the counter "should never be stuck loading", and a hung request to an unreachable Redis is a realistic way to get there. Dismissing the hint on `/` and having that persist after reload works in both.

## 08. Accessibility and usability
**Choice:** Tie
**Justification:**
Both keep the skeleton `aria-hidden`, add no new controls, and produce no console errors across all routes and states. Removing the hint from content pages restores access to the content it covered in both. The stuck placeholder in Gemini's hang case is assessed under 07 and 09, not counted here too.

## 09. UI fix completeness and regression avoidance
**Choice:** Astra better
**Justification:**
Both fix the hint the right way: Astra moves `<ViewHint />` from the root layout into the home page, and Gemini gates it on `usePathname() === "/"`. Both are equally effective, and both keep dismissal working.

For the counter, both fix the reported 0-response case and keep the cached and real-count behavior exactly as before (states B, D, E2 and F are unchanged from the original). Only Astra fully meets "should never be stuck loading": Gemini's fix has no timeout, so a request that never resolves still leaves the placeholder spinning indefinitely, which is the original bug in a different trigger. Neither introduced a regression elsewhere.

## 10. Rendered verification and visual evidence
**Choice:** Tie
**Justification:**
Both verified in a real browser at 390 and 1440 and saved screenshots:
- Astra ran 28 Playwright scenarios, including stalled responses, and added an e2e spec.
- Gemini checked the hint pages and three counter cases in the browser, added 9 hint and 7 footer unit tests, and ran the full unit suite, lint and a production build.

Both reports accurately describe the cases they tested. Gemini didn't test a hung request and didn't claim to, so I don't count that as an inaccurate claim.

---

## Overall UI comparison
Both models fixed the two reported problems correctly in the cases shown in the prompt:
- the "Try a different view" hint now appears only on the home page, and no longer covers content on /work, /projects, /articles or the work pages
- a first-time visitor whose count comes back as 0 or as an error no longer sees a stuck placeholder
- cached counts and real counts behave exactly as before

The difference is one counter state. When the counter request never completes, Gemini's placeholder still pulses indefinitely (still visible at 15 seconds), while Astra's 10-second timeout hides it. The prompt explicitly says the counter should "never be stuck loading", so only Astra fully meets that requirement. It's a narrow advantage, limited to one realistic failure mode. The hint fix and every other counter state are equivalent.

## Author Notes
Required: the hint only on the home page; the counter never stuck loading; nothing shown when there's no real count; cached and real counts unchanged.

Both hint fixes work: Astra moved `<ViewHint />` into the home page, and Gemini added a pathname check. After 8 seconds the hint is absent on 4 content routes at 390 and 1440, present on `/`, and dismissal persists (`measurements.json` → `hint`).

For the counter, both handle a 0 response, a 500 and a network error for first-time visitors (hidden), and keep cached and real counts (8 states tested per width, fresh browser each).

The difference is a request that never completes. Astra aborts after 10 seconds and hides the placeholder. Gemini has no timeout, so the placeholder is still pulsing at 15 seconds (`after_1440_footer_E_first_visit_API_hangs.png`, `recordings/footer_first_visit_api_hangs_14s.webm`).

Why it matters: the prompt says the counter should never be stuck loading, and an unreachable Redis can hang the request.

Astra limitations: when hidden, the footer keeps an empty `mt-2` paragraph (8px more space at 390 than Gemini's version). The 10-second wait is still long before the placeholder clears.

Gemini strengths: an equally correct hint fix, correct handling of every non-hanging counter case, tighter markup when hidden, and more unit tests plus a production build.

Non-UI note: Astra took about 5.6 minutes and Gemini about 13.9. This isn't used as UI evidence.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

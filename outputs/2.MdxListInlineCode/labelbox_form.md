# MdxListInlineCode: Labelbox form answers

**Status:** Submitted (2026-09-24)
**Labelbox data row:** https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz018j07381i5bjoxj

## Task Name
Bullet list items split into columns when they contain bold text or inline code

## Task Description
In the anvilry portfolio (Next.js 16, React 19, Tailwind v4, MDX) at commit 638b594, bullet lists on the project and work pages render each item's text as separate side-by-side columns instead of one wrapped sentence next to its bullet dot. Bold labels and inline code become their own columns, and inline code such as `.trelix/index.db` is stretched into a tall box. On a 390px phone some items become several times taller than they should be. Both models received the same prompt and two screenshots of /projects/trelix (1440px and 390px). They were asked to find the root cause, fix it for every list that renders this way without changing how the bullets otherwise look, and verify the result in a browser at 390px and 1440px on that page and at least one other affected page.

## Task info
- Repo: https://github.com/sairam0424/anvilry
- Commit: 638b5941f35b5a605a7f72e8ea6222511af8accf
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same two screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_MdxListInlineCode.zip
- Comparability note: an earlier Gemini attempt ended before making any edit because `opencode run` without `--auto` auto-rejected a permission request (reading its own dev-server log in /tmp). I discarded it and reran Gemini with `--auto`, which matches Astra's full-access setting. The submitted Gemini run finished normally.

All "after" evidence was captured by me from both final patches on freshly started dev servers (build caches cleared), with the same script, at the same viewports. The bullet-color finding was also checked in a production build (`next build`) of each patch. Files: `after_screenshots/` and `measurements.json` in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified the shared MDX `li` renderer in `src/components/mdx-content.tsx` and the same cause: `display: flex` on the list item makes every text run, `<strong>` and `<code>` a separate flex item, which produces the columns and the stretched code boxes in the screenshots. Both also recognised that bold-only items are affected, not just items containing code, and fixed the shared renderer rather than one page.

## 02. Layout, alignment, and spacing
**Choice:** Tie
**Justification:**
Both perform well. Across all 16 affected pages (99 bullet items), every item has the same rendered height in both results at 390px and 1440px (total list height 9,624px at 390 and 4,920px at 1440, down from 13,416px and 5,664px in the original). Text starts 12px from the item edge and the dot sits 8px from the top in both, matching the original geometry (`measurements.json` → `layoutAllPages`). Paired crops in `after_screenshots/after_{390,1440}px_trelix_list.png` show identical wrapping.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. Bold labels, body text and inline code flow as one sentence in both. Inline code chips return to normal line height (≈22px, and 46px only where a chip itself wraps onto two lines), instead of the 216px tall box at 390px in the prompt screenshot. Font sizes, weights and colors of the text are unchanged in both.

## 04. Colors and component styling
**Choice:** Astra better
**Justification:**
The prompt says to fix the lists "without changing how the bullets otherwise look". In Astra's result every bullet dot keeps its cyan accent color: 99/99 dots are rgb(56, 225, 255) at both widths. In Gemini's result all 99 dots are transparent (rgba(0,0,0,0)), so the bullets disappear on every affected page (`Gemini/after_screenshots/after_390px_trelix_list.png`, `after_1440px_aava-code_list.png`, `after_*_trelix_bullet_closeup.png`). The cause is in Gemini's patch: it rewrote the class list as a template string ending in `before:bg-accent${className ? … : ""}`. Tailwind extracts class names from the source text and doesn't recognise `before:bg-accent` when it's followed by `${`. Since this is the only place the class is used, the rule is not generated. A production build confirms it: Astra's CSS contains `.before\:bg-accent:before{…background-color:var(--accent)}` and Gemini's does not (`measurements.json` → `productionBuildCss`).

## 05. Images, icons, and visual assets
**Choice:** Not applicable
**Justification:**
The task involves no images or icon assets. The only graphic element is the CSS bullet dot drawn with `::before`, and I've assessed it under Colors and component styling (04) and Fix completeness (09) so it isn't counted three times.

## 06. Responsive and adaptive behavior
**Choice:** Tie
**Justification:**
Both perform well on the layout requirement at both requested widths. At 390px and 1440px, items wrap as normal sentences with identical per-item heights on all 16 pages, and there are no columns or stretched code boxes (`measurements.json`). The missing bullet color in Gemini's result is the same at every width and is not a breakpoint-specific defect, so it's assessed under 04 and 09 rather than here.

## 07. UI interactions and state behavior
**Choice:** Not applicable
**Justification:**
The prompt concerns static rendering of list content. No interactive component or state (menus, forms, focus, hover, dialogs) is involved. Links inside list items are unchanged by both patches.

## 08. Accessibility and usability
**Choice:** Tie
**Justification:**
Both keep native `ul > li` semantics and reading order. Neither adds or removes accessible names, and neither produces console errors or DOM-nesting warnings on any of the 16 pages. Gemini's wrapper is a `div`, which is valid inside `li`. The invisible bullets in Gemini's result are a visual regression rather than a change to assistive-technology output, and are assessed under 04 and 09.

## 09. UI fix completeness and regression avoidance
**Choice:** Astra better
**Justification:**
Both fix the root cause in the shared renderer rather than hiding the symptom, and both fix all 99 items on all 16 pages identically. Astra removes `flex` and positions the dot with `relative pl-3` plus `before:absolute before:top-2 before:left-0`. Gemini keeps `flex` and wraps children in `<div className="min-w-0 flex-1">`, which is a sound approach. However, Gemini's patch also introduces a site-wide regression: all 99 bullet dots lose their color and become invisible, in fresh dev servers and in the production build. The prompt explicitly required the bullets to otherwise look the same. Astra's result keeps every dot at the original size, position and color.

## 10. Rendered verification and visual evidence
**Choice:** Astra better
**Justification:**
Both rendered their results in Chrome at 390px and 1440px on /projects/trelix and a second page and saved screenshots. Gemini also ran the unit tests, ESLint, the Playwright suite and a production build, which is broader than Astra's ESLint and `git diff --check`. However, Gemini's visual check was inaccurate. Its transcript shows it started the dev server (`nohup pnpm dev`) before its first edit to `mdx-content.tsx`, and Tailwind's dev server keeps previously generated rules, so its screenshots (`model_screenshots/div_trelix_*.png`) still show cyan dots that a fresh server or production build no longer renders. Its summary claims "the identical 4px cyan circle", which is false for the shipped result. It ran `next build` but never rendered that build. Astra's screenshots and claims (`model_screenshots/after-*`) match what a fresh build renders.

---

## Overall UI comparison
Both models fixed the main layout defect equally well. They diagnosed the same root cause (flex on the list item turning every inline run into a column), fixed the shared MDX renderer, and produced identical text layout on all 99 affected items across 16 pages at 390px and 1440px.

The decisive difference is a regression. Gemini's patch makes every bullet dot on those pages invisible, because the dot's color class is no longer detected by Tailwind. The prompt explicitly asked to keep the bullets looking the same. Gemini's own verification missed this because it screenshotted a dev server that was started before its edit. Astra's result keeps all 99 dots at the original size, position and cyan color, and its verification matches the fresh build.

Gemini did verify more broadly (tests, lint, e2e, build), and its wrapper approach is structurally sound. The failure is limited to the class string, but it is visible on every affected page to every visitor.

## Author Notes
Required: bullet items should read as one wrapped sentence next to their dot, on every affected list, without changing how the bullets otherwise look, verified at 390 and 1440.

Astra removed flex from the MDX `li` and positioned the dot absolutely. All 99 items on 16 pages flow correctly and all 99 dots stay cyan (`Astra/measurements.json`).

Gemini wrapped the children in a `min-w-0 flex-1` div. The layout is identical to Astra's, but it rewrote the class list as a template string, so Tailwind no longer generates `before:bg-accent` and all 99 dots render transparent (`Gemini/measurements.json` → `bulletDots`, `productionBuildCss`).

Evidence: `after_{390,1440}px_trelix_list.png`, `after_{390,1440}px_aava-code_list.png`, `after_*_trelix_bullet_closeup.png` in both folders, next to `before_*` crops of the original.

Why it matters: every bulleted list on the project and work pages loses its markers in production, which the prompt explicitly asked to preserve.

Gemini's check missed it because its screenshots came from a dev server started before the edit.

Astra limitations: narrower automated checks (ESLint and diff check only; no unit tests, e2e or build), and it verified two pages rather than several.

Gemini strengths: same correct diagnosis, identical layout result, broader test and build runs.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

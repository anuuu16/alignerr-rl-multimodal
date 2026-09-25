# MenuTabsStateAndOverflow: Labelbox form answers

**Status:** Submitted (2026-09-25). Honest mixed result: no significant Astra advantage.
**Labelbox data row:** https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxum01nt0738cs9vzt24

## Task Name
Menu category tabs cut off on small phones, and the selected category is lost after going back from a reservation

## Task Description
On the Ember & Oak restaurant site (Next.js 16, React 19, Tailwind v4) at commit c979d4f, the /menu page has two problems.

1. On small phones the category tab row doesn't fit. At 320px the last tab, "Drinks", is cut off at the right edge and stays half off-screen even when it's the selected tab, with no hint that the row scrolls.
2. If a visitor picks a category other than Starters (for example Desserts), taps a dish's "Reserve a table" link, and then presses Back, the menu forgets their place: it shows Starters at the top of the page instead of the category they were browsing. A link to the menu with a specific category open should also work.

Both models received the same prompt and four screenshots:
- the Drinks tab selected at 320px
- the Desserts tab before reserving, at 390px
- the pre-filled reserve page
- the menu after pressing Back, at 390px

They were asked to find the root causes and fix them without changing how the menu looks, keeping the existing tab keyboard behavior (arrow keys, Home, End), and to verify at 320px, 390px and desktop width, including that the site still builds for production.

## Task info
- Repo: https://github.com/junedpathan11/ember-and-oak
- Commit: c979d4f8bd52d8f657971763cb7f6c1fd08eb320
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same four screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_MenuTabsStateAndOverflow.zip

All "after" evidence was captured by me from both final patches, each built with `next build` and served with `next start` (production), using the same script at the same viewports: `after_screenshots/`, `recordings/` and `measurements.json` (which includes the build route table and the prerendered-HTML content counts) in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified that the tab row scrolls horizontally (`overflow-x-auto`) but selecting a tab never scrolls it into view, and that the active category lives only in component state, so Back and links can't restore it. Both kept the tabs' look and their ARIA/keyboard wiring.

## 02. Layout, alignment, and spacing
**Choice:** Tie
**Justification:**
Both perform well on the tab strip. At 320px, after the End key, Drinks sits fully on-screen at x 243→300 in both (the original is cut at 283→340 on a 320px screen), and the same holds at 360px. Switching tabs doesn't move the page vertically in either (0px). The tab strip at 390 and 1440 has identical tab positions and widths to the original in both (`after_*_tabstrip_initial.png`, `measurements.json`). Astra also added subtle edge fades as a scroll cue.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. Tab labels, dish names, prices and descriptions keep their original fonts and hierarchy in both. Neither changes typography.

## 04. Colors and component styling
**Choice:** Tie
**Justification:**
Both keep the existing tab styles, including the active underline and the muted inactive labels. Astra adds edge-fade gradients to the tab row so it's clear it scrolls, which the prompt asked for ("no hint that the row can be scrolled"). Gemini relies on the scroll position alone. The rest of the styling is unchanged in both.

## 05. Images, icons, and visual assets
**Choice:** Tie
**Justification:**
Dish images render the same in both once the page has loaded (dish rows in `after_390_after_back.png`). Neither changes any images or icons. Astra's missing server-rendered content (08/09) also affects images before JavaScript runs, and that's assessed there.

## 06. Responsive and adaptive behavior
**Choice:** Tie
**Justification:**
Both fix the 320px case (and 360px) without changing the 390 or 1440 layout. Back from the reserve page restores Desserts and the previous scroll position at 320, 390 and 1440 in both (`measurements.json` → `back`). Neither introduces a breakpoint-specific defect.

## 07. UI interactions and state behavior
**Choice:** Astra better
**Justification:**
Both handle the requested interactions:
- Arrow, Home and End keys still work, and focus follows the selection
- the selected tab scrolls into view
- Back from the reserve page returns to Desserts
- `/menu?category=desserts` opens Desserts, and an invalid value falls back to Starters

(Gemini also supports `#desserts`.)

The difference is browser history. Gemini records every tab click as a new history entry (`pushState`), so after clicking Mains, Desserts and Drinks, one Back press stays on the menu (URL `?category=desserts`) instead of leaving the page. Astra replaces the URL without adding entries, so one Back leaves the menu, the same as the original. See `recordings/back_after_three_tab_clicks_1440.webm` in both folders.

## 08. Accessibility and usability
**Choice:** Gemini 3.8 Flash better
**Justification:**
Both keep role="tablist" and role="tab", aria-selected, aria-controls and the roving tabindex, with no console errors. However, in Astra's result the whole menu (tabs and dishes) is missing from the server-rendered HTML: the prerendered `/menu` has 0 tabs, 0 dish names and 1 "Reserve a table" link, against 4 tabs, 9 dish names and 33 links in the original. So visitors without JavaScript, assistive tools that read the initial HTML, and search engines get an empty menu section (`after_390_menu_without_javascript.png`). Gemini's result keeps all of it in the HTML.

## 09. UI fix completeness and regression avoidance
**Choice:** Tie
**Justification:**
Both resolve both reported problems, and each introduces a different regression the other avoids:
- **Astra** wraps the tabs in `<Suspense>` with no fallback around `useSearchParams`. /menu stays statically prerendered, but its menu content no longer exists in that HTML, so the menu area is empty until JavaScript loads.
- **Gemini** reads `searchParams` in the page, which keeps the menu in the HTML but turns /menu from static (○) into dynamic (ƒ) rendering on every request, and it adds a history entry per tab click.

Both production builds succeed. Neither result is regression-free, and the regressions are of comparable weight, so I rate this a tie with both partly failing.

## 10. Rendered verification and visual evidence
**Choice:** Tie
**Justification:**
Both checked the result in a real browser at 320, 390 and desktop and saved screenshots:
- Astra verified against the production build, including keyboard, Back, links, an invalid category and reservation pre-fill, and added a repeatable browser test script.
- Gemini checked the same flows and ran lint and a production build.

Neither reported its own regression (Astra didn't check the server-rendered HTML; Gemini didn't check the build's static/dynamic status or Back after several tab clicks). Their positive claims match my measurements.

---

## Overall UI comparison
Both models fixed the two reported problems equally well from a visitor's point of view:
- the selected tab is fully visible at 320px, including with the keyboard
- Back from the reserve page returns to the category and scroll position the visitor left
- category links work
- the 390 and 1440 layouts are unchanged

Each introduced one regression the other avoided:
- **Astra's** menu is missing from the server-rendered HTML (empty for no-JS visitors, crawlers and before hydration).
- **Gemini's** Back button steps back through every tab clicked, and /menu is no longer statically prerendered.

Astra is better on interaction/state and Gemini is better on accessibility/usability; everything else is a tie.

This comparison does not show a significant, verifiable Astra advantage on the main requirement.

## Author Notes
Required:
- at 320px the selected tab must always be fully visible, with a scroll hint, including via the keyboard
- Back from the reserve page must restore the category, and links to a specific category must work
- nothing else may change visually, the keyboard behavior must keep working, and the production build must still work

Both met the core requirements:
- End key at 320 → Drinks at x 243→300 in both (original 283→340)
- Back → Desserts at the same scroll position at 320, 390 and 1440
- `?category=desserts` works, and invalid values fall back to Starters
- tab strip positions at 390 and 1440 identical to the original
- no page jump, keyboard intact, no console errors, and both production builds pass

Differences:
- Astra's prerendered /menu has 0 tabs and 0 dish names in its HTML (original: 4 tabs, 9 dish names), because of `<Suspense>` with no fallback (`after_390_menu_without_javascript.png`, `measurements.json`).
- Gemini's /menu becomes dynamic (ƒ) instead of static (build route table in `measurements.json`).
- Gemini's tab clicks push history entries, so Back stays on the menu after three tab clicks, while Astra leaves the page (`recordings/back_after_three_tab_clicks_1440.webm`).
- Astra adds edge-fade scroll cues. Gemini also supports `#desserts` links.

Conclusion: a mixed result. Each model introduced one regression, so there's no significant Astra advantage.

Non-UI note: Astra took about 8.0 minutes and Gemini about 16.6. This isn't used as UI evidence.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

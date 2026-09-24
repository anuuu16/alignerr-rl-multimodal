# MobileMenuOverlay: Labelbox form answers

**Status:** Submitted (2026-09-24) as an honest tie.
**Labelbox data row:** https://app.labelbox.com/projects/cmu1pcwk402vo07zn6dy3cvpo/data-rows/cmu34rxmz019j073868jbsmen

## Task Name
Mobile menu opens as a thin strip and the WhatsApp button covers it

## Task Description
In the Ember & Oak restaurant site (Next.js 16, React 19, Tailwind v4) at commit c6830c3, tapping the hamburger on a 390px phone should open a full-screen menu. Instead, only the 76px header strip gets a background: the nav links and phone number spill over the hero image where they're nearly unreadable, and the floating WhatsApp button stays on top of the menu. Both models received the same prompt and two screenshots (menu closed and menu open at 390px). They were asked to find the root cause and fix it without changing how the header looks on mobile or desktop, keep the menu closing with X, Escape and link taps, and verify at 390px (open and closed) and at desktop width.

## Task info
- Repo: https://github.com/junedpathan11/ember-and-oak
- Commit: c6830c3921151ada9b3922ea4bb605505369bdba
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same two screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_MobileMenuOverlay.zip

All "after" evidence was captured by me from both final patches on freshly started dev servers (build caches cleared), with the same script, at the same viewports: `after_screenshots/`, `recordings/` and `measurements.json` in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified from the screenshot that the overlay only covers the header strip, that the links and phone number overflow onto the hero, and that the WhatsApp button paints over the menu. Both traced both symptoms to the same cause: the header's `backdrop-blur` makes it the containing block for the `fixed inset-0` overlay (limiting it to about 76px) and creates a stacking context that keeps the overlay's z-50 under the FAB's z-40. Neither changed the header's styling.

## 02. Layout, alignment, and spacing
**Choice:** Tie
**Justification:**
Both perform well. The open menu fills the viewport in both at 390×844, 320×568 and 390×480 (overlay top 0, height equal to the viewport, parent BODY), with the links centered and the phone number pinned at the bottom. Nothing sits outside the viewport (`measurements.json`). Astra's and Gemini's `after_390x844_menu_open.png` are byte-identical files.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. The menu's existing typography is untouched in both: uppercase label-caps links, the active "Home" in the primary color, the display-font phone number and the "Concept demo website" eyebrow. On a solid background all of it is readable, instead of overlapping the hero heading as in the prompt screenshot.

## 04. Colors and component styling
**Choice:** Tie
**Justification:**
Both perform well. The overlay uses the existing solid `bg-bg` (rgb(250, 247, 242)), the link dividers and borders are unchanged, and the header keeps `bg-bg/95`, `backdrop-filter: blur(2px)`, its bottom border, sticky positioning and z-30 at 390px and 1440px in both (`measurements.json` → header).

## 05. Images, icons, and visual assets
**Choice:** Tie
**Justification:**
Both perform well. The close (X) icon and the hamburger icon render unchanged, and the WhatsApp button icon is unaffected. When the menu is open, the FAB is correctly covered in both (the element at the FAB's centre is the overlay). The hero image stays behind the solid overlay.

## 06. Responsive and adaptive behavior
**Choice:** Tie
**Justification:**
Both perform well. The menu fills the screen at 320×568, 390×480 and 390×844. At 1440×900 the desktop navigation shows, the hamburger is hidden, and the header height (70px) and blur are unchanged. Both also close the menu and release the scroll lock when the viewport is widened to 1024px while the menu is open (Astra uses a `matchMedia` listener, Gemini a `resize` listener). Astra also added `overflow-y-auto` to the overlay so it can scroll on very short screens, but at every size I tested all items already fit, so there's no visible difference.

## 07. UI interactions and state behavior
**Choice:** Tie
**Justification:**
Both perform well, as shown in `recordings/interaction_390px_open_tab_escape_x_links_resize.webm` for each model. The hamburger opens the menu, and X, Escape, tapping "Home" while on the home page (which did not close the menu in the original), and tapping "Menu" (which navigates to /menu) all close it. The body scroll lock is released after each close. Both added explicit `onClick` close handlers to the menu links.

## 08. Accessibility and usability
**Choice:** Tie
**Justification:**
Comparable in both. The close button receives focus when the menu opens, and the dialog keeps role="dialog", aria-modal="true" and its label. Neither model adds a focus trap, so in both, Tab moves past the last menu item (the phone link) to content behind the modal: Astra's reaches the "Skip to content" link, and Gemini's reaches "Reserve a Table" in the page. That's the same limitation as the original, and the prompt didn't ask for it to change.

## 09. UI fix completeness and regression avoidance
**Choice:** Tie
**Justification:**
Both perform well. Each fixes the cause rather than hiding the symptom: Astra renders the overlay into document.body with `createPortal`, and Gemini moves it out of `<header>` as a sibling in a fragment. Neither raises z-index, hard-codes heights or removes the header blur. Every prompt requirement is met in both, and I found no regressions on mobile or desktop, with no console errors in either.

## 10. Rendered verification and visual evidence
**Choice:** Tie
**Justification:**
Both rendered and checked the result in headless Chrome: 390px open and closed, plus desktop (Astra at 1440×900, Gemini at 1280px). Both tested closing with X, Escape and a link, and checked that the scroll lock was restored. Astra also compared header screenshots before and after (`model_screenshots/before-*-header.png` / `after-*-header.png`). Gemini also ran `npm run build`. Their reported results match what I measured on fresh servers.

---

## Overall UI comparison
There is no significant UI difference between the two results. Both models diagnosed the same root cause (the header's backdrop-filter acting as the containing block and stacking context for the fixed overlay), fixed it without touching the header's appearance, and produced the same rendered menu. The 390×844 open-menu captures are byte-identical, and every interaction and responsive check gives the same result. I rate every dimension a Tie.

Two differences appear in the transcripts but aren't UI outcomes, so they're not counted in any dimension above:
1. **Process safety.** While setting up its browser check, Gemini ran `pkill -f "Google Chrome"` twice (13:58:13 and 14:06:03), which force-closed the user's own open Chrome browser. Astra launched a separate headless Chrome instance through Playwright and never closed any user application.
2. **Efficiency.** Astra finished in about 4.3 minutes (13:43:06–13:47:23). Gemini took about 17.6 minutes (13:50:25–14:07:59) over 64 turns, much of it spent driving Chrome's debugging port by hand after its first attempts timed out.

Given identical UI results, this comparison does not establish a significant UI advantage for Astra.

## Author Notes
Required: at 390px, the hamburger should open a full-screen menu with a solid background, the links and phone number readable, and the WhatsApp button covered. The header must look the same on mobile and desktop, and the menu must still close with X, Escape and link taps.

Astra rendered the overlay into document.body with `createPortal`, added close-on-link-tap and close-on-desktop-resize, and made the overlay scrollable.

Gemini moved the overlay out of `<header>` as a sibling in a fragment and added the same two close behaviors.

Result: identical rendered UI. The overlay fills the viewport at 390×844, 320×568 and 390×480, the FAB is covered, and the header is unchanged at 390 and 1440. All close paths work and restore scrolling, and there are no console errors (`after_screenshots/`, `recordings/`, `measurements.json` in both folders; the 390×844 open captures are byte-identical).

Neither model traps focus inside the aria-modal menu (same as the original).

Non-UI observations from the transcripts: Gemini force-closed the user's Chrome browser twice with `pkill -f "Google Chrome"` during its verification setup, and it took about 17.6 minutes against Astra's 4.3. These are recorded for completeness and are not used as UI evidence.

Conclusion: a tie on all 10 UI dimensions. There is no significant UI advantage for Astra.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

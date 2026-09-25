# MobileAuditFixes: Labelbox form answers

**Status:** Ready to submit (not yet submitted)
**Labelbox data row:** _(add after submitting)_

## Task Name
Floating buttons cover content, mobile menu backdrop missing, and chat header row clipped on phones

## Task Description
In the anvilry portfolio (Next.js 16, React 19, Tailwind v4) at commit 1beefe1, three mobile problems were reported with screenshots from a 390px phone:
1. The fixed "Ask my portfolio" and ⌘K buttons cover real content: the footer's "Subscribe", "RSS" and copyright at the bottom of every page, and the small print under the chat composer.
2. The mobile menu's dimming backdrop has zero height, so the page behind it isn't dimmed and tapping outside doesn't close the menu.
3. In the chat view, the "Back to Classic / Résumé / Talk / AI Concierge" row doesn't fit and "AI Concierge" is cut off at the right edge.

Both models received the same prompt and three screenshots. They were asked to find and fix the root cause of each without changing the desktop appearance, and to verify at 390px, 320px and desktop width.

## Task info
- Repo: https://github.com/sairam0424/anvilry
- Commit: 1beefe1303e9e562e47a33ed654d322f99a99a30
- Astra: gpt-6-astra, reasoning medium, Codex CLI (`codex exec`), full access
- Gemini 3.8 Flash: google/gemini-3.8-flash, OpenCode (`opencode run --auto`), full access
- Same prompt text, same three screenshots, single turn, no follow-ups
- Attachment: RL Multimodal_MobileAuditFixes.zip

All "after" evidence was captured by me from both final patches on freshly started dev servers (build caches cleared), with the same script, at the same viewports: `after_screenshots/`, `recordings/` and `measurements.json` in each model folder.

---

## 01. Understanding the UI request and screenshot
**Choice:** Tie
**Justification:**
Both perform well. Both identified all three issues from the screenshots and traced each to a real cause:
- the fixed buttons reserve no space at the bottom of pages or in the height-bounded chat `<main>`
- the header's backdrop-filter makes it the containing block for the fixed backdrop, which collapses to 0px
- the chat top row is a non-wrapping flex row wider than the phone's content width

Gemini also noted that `view-transition-name` on the header has the same containing-block effect.

## 02. Layout, alignment, and spacing
**Choice:** Astra better
**Justification:**
The three reported layout problems are fixed in both:
- no footer text or links under the floating buttons at the bottom of 7 pages at 390 and 320
- the chat caption is clear of ⌘K
- "AI Concierge" is fully visible on a wrapped second row

The difference is in the chat composer at 320×568, one of the widths the prompt asked to verify. In Gemini's result the Send button extends past the right edge of the screen (x 305→321 on a 320px viewport, cut roughly in half), exactly as in the original. In Astra's result the input narrows and Send sits fully inside the card (x 231→275). Evidence: `after_320x568_chat_view.png` and `after_320x568_chat_composer_typed.png` in both folders, and `measurements.json` → `chat_320x568_send_button`. Both results let the empty-state content scroll inside its container, and each shows one item cut at that scroll edge at 390 (Astra: a suggestion chip; Gemini: the "11 open-source repos" card), so that part is comparable.

## 03. Typography and visual hierarchy
**Choice:** Tie
**Justification:**
Both perform well. The chat row labels keep their fonts and styles ("Back to Classic" now fits on one line in both, and "AI CONCIERGE" keeps its mono, uppercase accent style). The footer text, chat heading, suggestion chips and caption keep their existing typography at 390 and 320 in both.

## 04. Colors and component styling
**Choice:** Tie
**Justification:**
Both keep the existing styling. The one styling difference is the menu backdrop: Astra keeps the original `bg-bg-base/70`, and Gemini changed it to `/80`, a slightly darker dim. Both satisfy "dim the page behind it" (`after_390x844_menu_open.png`). Button, card and chip styles are unchanged in both.

## 05. Images, icons, and visual assets
**Choice:** Tie
**Justification:**
Both perform well. The nav, drawer, floating-button, chat-row (Talk, sparkle) and composer (mic, send) icons are all present and unchanged in both. Gemini's Send icon is partly off-screen at 320, but that's a layout issue and is assessed under 02 and 06, not as a missing or distorted asset.

## 06. Responsive and adaptive behavior
**Choice:** Astra better
**Justification:**
At 390px both results are equivalent across all three issues. At 1440px both leave the desktop unchanged: every element position on /about, /?view=chat, /?view=developer and /projects matches the original in both (`measurements.json` notes). At 320×568, which the prompt explicitly asked to check, only Astra's chat view fits the screen: Gemini's Send button is cut off at the right edge (305→321 of 320) while Astra's is fully visible (231→275). Both recordings (`recordings/chat_320px_row_scroll_composer.webm`) show this while typing a question. This defect existed in the original; Astra found and fixed it while verifying at 320, and Gemini did not.

## 07. UI interactions and state behavior
**Choice:** Tie
**Justification:**
Both perform well, as shown in `recordings/menu_390px_open_tap_outside_escape.webm` for each model. The hamburger opens the menu, the backdrop covers the page below the nav (788px tall at 390, 512px at 320), tapping outside closes the menu, Escape closes it, and page scroll is locked while it's open. In the chat view both keep the chips scrollable and the input usable.

## 08. Accessibility and usability
**Choice:** Tie
**Justification:**
Comparable. Both keep the drawer's existing semantics and Escape handling, add backdrop tap-to-dismiss and a scroll lock, and produce no console errors. Both keep the floating buttons clear of the footer links so "Subscribe" and "RSS" can be tapped. The partly off-screen Send button in Gemini's 320px result also affects usability, but it's counted under 02 and 06, not twice.

## 09. UI fix completeness and regression avoidance
**Choice:** Tie
**Justification:**
Both resolve all three reported issues and fix causes rather than symptoms:
- Astra adds shared bottom clearance plus a chat height adjustment.
- Gemini pads the footer strip, chat and developer views.
- Both render the backdrop and drawer outside the blurred header.
- Both wrap the chat row on phones.

Neither changes desktop layout or removes features. The Send-button difference at 320 is a pre-existing defect that Gemini left in place, not a regression it introduced, so I've assessed it under 02, 06 and 10 rather than as a missed requirement here.

## 10. Rendered verification and visual evidence
**Choice:** Astra better
**Justification:**
Both verified at 390, 320 and desktop in a headless browser and saved screenshots. Astra covered Chromium and WebKit (16 screenshots, 8 browser tests, 8 component tests). Gemini ran 597 unit tests and a production build, and added a drawer unit test.

The difference is accuracy. Gemini's own `model_screenshots/320px_chat_view.png` shows the Send button cut off at the right edge, yet its report states the 320px chat view is clear and doesn't mention the Send button. Astra's report says it "also fixed input overflow at 320px", and its screenshots (`model_screenshots/chromium-320-chat.png`) and my fresh-server measurements confirm it.

---

## Overall UI comparison
Both models fixed all three reported problems equally well at 390px and left the desktop layout untouched:
- the floating buttons no longer cover content at the bottom of pages or in the chat view
- the menu backdrop dims the page and closes on tap outside
- "AI Concierge" is no longer cut off

The difference is at 320px, a width the prompt explicitly asked to check. In the chat view, Gemini's Send button, the main action of that view, is still cut roughly in half by the right edge of the screen. Astra's composer fits, with Send fully visible. Gemini's own 320px screenshot shows the problem, but its report calls the 320px view clear. Astra noticed it and fixed it.

This is a real, verifiable advantage on a required viewport, but it's narrow. Everything else is equivalent, and the Send defect existed before either model ran. A reviewer who treats the Send button as outside the three listed issues could reasonably see this as a small advantage rather than a decisive one.

## Author Notes
Required: fix three mobile issues (floating buttons covering content, a 0px menu backdrop, the clipped chat row) without changing desktop, verified at 390px, 320px and desktop.

Both models fixed all three at 390px, and desktop element positions match the original in both (`measurements.json`, `after_1440x900_*.png`).

The difference is at 320×568 in the chat view. Gemini's Send button spans x 305→321 on a 320px screen and is cut in half. Astra's spans x 231→275 and is fully visible (`after_320x568_chat_view.png`, `after_320x568_chat_composer_typed.png`, `recordings/chat_320px_row_scroll_composer.webm`).

Gemini's own `model_screenshots/320px_chat_view.png` shows the cut-off button, but its summary reports the 320px chat view as clear. Astra's summary states it fixed the 320px input overflow, and that matches the rendered result.

Why it matters: at the smallest phone width the user asked about, the main action of the chat view is still partly off-screen in Gemini's version.

Astra limitations: its empty-state area now scrolls, and at 390 one suggestion chip is cut at that scroll edge (Gemini's metric card is cut the same way). It also ran fewer unit tests than Gemini (no full unit suite or production build).

Gemini strengths: complete and correct fixes for all three listed issues, broader scope (it also padded the developer view and wrapped the game view's top row), a new drawer unit test, and a passing production build.

Non-UI note: Astra took about 7.1 minutes and Gemini about 18.4. This isn't used as UI evidence.

The Send-button defect existed in the original. Astra fixed it and Gemini didn't.

## Reviewer Notes
(Filled in by a different person. Leave blank.)

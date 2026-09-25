# MenuTabsStateAndOverflow: Labelbox form answers

**Status:** In progress. Task name and description are final; the ratings will be filled in after both models run.
**Labelbox data row:** _(add after submitting)_

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

---

## 01. Understanding the UI request and screenshot
**Choice:** _pending_
**Justification:**

## 02. Layout, alignment, and spacing
**Choice:** _pending_
**Justification:**

## 03. Typography and visual hierarchy
**Choice:** _pending_
**Justification:**

## 04. Colors and component styling
**Choice:** _pending_
**Justification:**

## 05. Images, icons, and visual assets
**Choice:** _pending_
**Justification:**

## 06. Responsive and adaptive behavior
**Choice:** _pending_
**Justification:**

## 07. UI interactions and state behavior
**Choice:** _pending_
**Justification:**

## 08. Accessibility and usability
**Choice:** _pending_
**Justification:**

## 09. UI fix completeness and regression avoidance
**Choice:** _pending_
**Justification:**

## 10. Rendered verification and visual evidence
**Choice:** _pending_
**Justification:**

---

## Overall UI comparison
_pending_

## Author Notes
_pending_

## Reviewer Notes
(Filled in by a different person. Leave blank.)

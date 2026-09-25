# Browser verification

Checked in Chromium using Playwright against `pnpm dev`, with `NEXT_PUBLIC_OPEN_TO_WORK=true`.

The Web résumé wrapper is transparent; the site grid remains visible through the résumé, including at the bottom. PDF/Web switching still works. The standalone `?view=resume` background and print styles are preserved.

## Viewport measurements (CSS pixels)

| View | Viewport | Nav height | Banner height | Main top | Main height | Document clientHeight | Document scrollHeight | Document scrollWidth | scrollY after wheel | Nav top after wheel |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Chat | 1440 × 900 | 57 | 37 | 94 | 806 | 900 | 900 | 1440 | 0 | 0 |
| Developer | 1440 × 900 | 57 | 37 | 94 | 806 | 900 | 900 | 1440 | 0 | 0 |
| Chat | 390 × 844 | 57 | 79 | 136 | 708 | 844 | 844 | 390 | 0 | 0 |
| Developer | 390 × 844 | 57 | 79 | 136 | 708 | 844 | 844 | 390 | 0 | 0 |

A 1200px wheel gesture over the page margin did not move the document. After populating chat with a deterministic long mocked response and the terminal with five `ls work` commands, a 300px wheel gesture moved only the inner scroller:

| View | Width | Inner clientHeight | Inner scrollHeight | Inner scrollTop after wheel | Page scrollY |
|---|---:|---:|---:|---:|---:|
| Chat | 1440 | 472 | 3763 | 300 | 0 |
| Developer | 1440 | 462 | 866 | 300 | 0 |
| Chat | 390 | 264 | 9223 | 300 | 0 |
| Developer | 390 | 254 | 1010 | 300 | 0 |

The composer/terminal input stays in the viewport. Returning to Classic restores normal document scrolling. Mobile toolbars wrap and the chat input can shrink to fit the available width. The existing scrollable empty-chat greeting remains scrollable when height is constrained.

Playwright: 9 passed; 3 existing résumé-variant tests skipped because their feature flag is off. Targeted ESLint passed.

## Screenshots

- [Desktop chat](chat-1440.png) · [390px chat](chat-390.png)
- [Desktop developer](developer-1440.png) · [390px developer](developer-390.png)
- [Desktop résumé](resume-1440.png) · [390px résumé](resume-390.png)
- [Résumé bottom, showing the grid](resume-bottom-1440.png)
- [Desktop chat after inner scrolling](chat-1440-scrolled.png) · [390px chat after inner scrolling](chat-390-scrolled.png)
- [Desktop terminal after inner scrolling](developer-1440-scrolled.png) · [390px terminal after inner scrolling](developer-390-scrolled.png)

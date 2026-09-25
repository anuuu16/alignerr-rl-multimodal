# Mobile layout verification

The regression suite is `e2e/mobile-layout.spec.ts` and runs against `pnpm dev`.

## Root causes and fixes

- Fixed launchers had no corresponding layout space. A shared mobile CSS clearance (80px plus the bottom safe-area inset) now reserves space at the end of every page. The bounded chat console subtracts that same clearance from its height. Desktop clearance remains zero and launcher offsets remain 20px.
- The mobile backdrop was a fixed descendant of a header with `backdrop-filter`, so its containing block was the header rather than the viewport. The backdrop and drawer now render through a body portal. Opening locks background scrolling; outside click, Escape, navigation, and resizing to desktop dismiss it.
- The chat toolbar used a non-wrapping flex row. It now wraps below 640px. The 320px check additionally exposed the input's intrinsic minimum width and excessive pressure from the suggestion list: the input can now shrink, and mobile empty-state suggestions scroll with the greeting.
- Machine-readable footer links wrap on phones so all links remain accessible at 320px.

## Browser checks

Chromium and WebKit: 390×844, 320×720, and 1440×900.

Assertions cover footer link visibility and hit testing, clearance above launchers, viewport-height menu backdrop, scroll lock, outside dismissal, Escape, restored focus, link navigation, chat toolbar bounds, greeting visibility, composer bounds, and small-print clearance. Additional route checks cover home, work, projects, articles, résumé, Play, and Developer.

Desktop checks confirm zero additional body padding and original launcher offsets. Desktop screenshots were visually reviewed.

## Screenshots

| View | 390px | 320px | Desktop |
| --- | --- | --- | --- |
| About footer | [390](chromium-390-about.png) | [320](chromium-320-about.png) | [1440](chromium-1440-about.png) |
| Menu | [390](chromium-390-menu.png) | [320](chromium-320-menu.png) | — |
| Chat | [390](chromium-390-chat.png) | [320](chromium-320-chat.png) | [1440](chromium-1440-chat.png) |

The matching `mobile-safari-*.png` files contain WebKit captures. These are browser-emulated viewport checks, not physical-device tests. The Next.js development indicator is visible in the captures.

# Task 2: candidate bugs

Rules learned from task 1 (see `../submissions_tracker.md` → Lessons):
- The same repo is allowed. Each task just needs a public repo and a specific commit, which can be earlier.
- Prefer bugs where the obvious fix fails. In task 1 both models found the same root cause.
- Run both models with full access. Top up Gemini prepay credits first.

## A. anvilry #173: flex list items break inline code into boxes (preferred: same repo)
- Repo: https://github.com/sairam0424/anvilry. Base commit `638b5941f35b5a605a7f72e8ea6222511af8accf` (before PR #173, merged 2026-09-03)
- Symptom: on /projects/* pages (9 of 11 pages, 77 cases), a list item with inline `code` renders as disjointed stacked boxes instead of one flowing sentence
- File: `src/components/mdx-content.tsx`. The `li` has class `flex gap-2 before:…` (the bullet dot is a ::before flex item)
- Root cause: a flex container blockifies every child, including anonymous text runs and `<code>`, so text / code / text become separate flex items
- Upstream fix: `<li …><span>{children}</span></li>` (the PR also has an unrelated resume padding change, ignore it)
- Traps for a weak fix: `inline` or `whitespace-nowrap` on code (no effect), `flex-wrap` (still broken), dropping `flex` (the bullet misaligns or disappears), styling only one page
- Edge cases to test: a `<p>` inside the `li` for loose lists (a `<p>` inside a `<span>` is invalid, so check for React DOM-nesting warnings), nested `ul` inside `li`, links and bold inside `li`, `code` inside `<p>` must stay unchanged, 320px wrapping
- Setup: reuse the anvilry workflow from task 1 (pnpm, `.env.local`, shallow fetch)

## B. junedpathan11/ember-and-oak #3: mobile menu trapped by the header's backdrop-blur (backup)
- Repo: https://github.com/junedpathan11/ember-and-oak. Base commit `c6830c3921151ada9b3922ea4bb605505369bdba`
- Stack: Next 16, React 19, Tailwind 4, npm. No agent instruction files in the repo
- Symptom: at mobile width, the hamburger opens a thin ~65px strip instead of a full-screen menu, and the WhatsApp FAB paints over it
- Root cause: `backdrop-blur` on the sticky header gives it a containing block for fixed children and a stacking context (z-30), and the overlay's z-50 is trapped inside it
- Upstream fix: `createPortal(overlay, document.body)` in `components/blocks/Navbar.tsx`
- Traps: raising z-index (no effect), removing the blur (visual regression), a hard-coded height
- Workspaces already cloned and installed: `RL Multimodal instructions/workspaces/{repro,astra,gemini}-ember`

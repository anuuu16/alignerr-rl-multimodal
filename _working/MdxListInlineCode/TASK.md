# Task 2: MdxListInlineCode (private notes, never uploaded)

- Repo: https://github.com/sairam0424/anvilry. Base commit `638b5941f35b5a605a7f72e8ea6222511af8accf` (before PR #173)
- Prompt: `prompt.txt`. Screenshots: `Prompt_Screenshots/before_{1440,390}px_list_with_inline_code.png` (from /projects/trelix)
- Workspaces: `RL Multimodal instructions/workspaces/{repro2,astra2,gemini2}-anvilry`. Shallow history (1 commit), deps installed, `.env.local` present
- Note: this commit pins an older Playwright (browser build 1228), which is **not downloaded**. Both models start equal. A model that wants a browser must run `npx playwright install chromium` itself. My evaluator scripts run from `workspaces/repro-anvilry` (task 1), which has a working browser.

## Ground truth (keep away from the models)
- `src/components/mdx-content.tsx`: `li` = `flex gap-2 before:…` (the bullet is a ::before flex item). A flex container blockifies EVERY child, so text runs, `<strong>`, `<code>` and `<a>` each become separate flex items laid out side by side.
- Upstream fix (PR #173): `li: ({children, ...props}) => <li className="…" {...props}><span>{children}</span></li>`
- Scope measured on the original at 1440: **132 broken `li` on 16 pages** (11 /projects/*, 5 /work/*). Only 54 contain `code`; the rest are split by `<strong>` labels alone (e.g. "Contextual chunking | — LLM-generated…").

## What separates a strong fix from a weak one
| Check | How |
|---|---|
| Every mixed-inline `li` flows as one sentence, not just the ones containing `code` | Count flex `li` with >1 flex item after the fix, which should be 0. The "Contextual chunking" and "MCP server" rows (bold only) must be fixed |
| Bullet dot still present and aligned with the first text line | Compare dot `top` with the first line box, same as before |
| Spacing, colors, code chip style unchanged | Compare screenshots with `li` markup that has a single child |
| No invalid nesting or hydration warnings | Console on page load (a `<p>` inside a `<span>` warns; no `p` in `li` in current content, but check) |
| Code inside `<p>` unchanged | Any /projects page paragraph containing `code` |
| Works at 390 and 1440, and on a /work page too | Paired screenshots |
| Traps | `inline`/`nowrap` on `code` (no effect), `flex-wrap` (still columns), `display:block` on `li` without re-adding the bullet (dot lost or on its own line), fixing only pages with code |

## Run log
- Astra: `codex exec … --dangerously-bypass-approvals-and-sandbox`, session `rollout-2026-09-24T11-51-29-01a0d213…` (submitted)
- Gemini attempt 1 (`ses_f2de6755bffeXCd80K0qt0f7J7`, 12:03): ended with no edits. `opencode run` auto-rejected an `external_directory (/tmp/*)` permission request, and the rejection ended the run. It was a harness permission problem, not a model failure. Archived in `gemini_attempt1_incomplete/`, NOT submitted.
- Gemini attempt 2: rerun with `opencode run --auto` (auto-approve, equivalent to Astra's full access)

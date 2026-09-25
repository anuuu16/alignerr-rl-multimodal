# RL Multimodal: token and cost tracker

Not part of any submission. Update after every model run.

## Money spent (actual)
| Item | Amount | Type |
|---|---|---|
| Google AI Studio (Gemini 3.8 Flash API) | **₹301.04** | Prepaid credits, pay per token |
| ChatGPT plan (Astra via Codex, ChatGPT sign-in) | **₹1,999** | Flat subscription (package) |
| **Total** | **₹2,300.04** | |

## Cost per task
The Gemini share is split by each session's metered cost (from OpenCode). The ChatGPT share is split by Astra tokens used.
The ChatGPT plan is a flat fee, so its split is only indicative: the same ₹1,999 would have been paid for fewer tokens, and it may still have unused capacity.

| Task | Gemini (₹) | Astra share of ₹1,999 | Task total (₹) |
|---|---|---|---|
| Setup tests (ASTRA_OK / GEMINI_OK) | 0.25 | 16.61 | 16.86 |
| 1. CmdPaletteMobileClip | 164.13 | 1,410.53 | 1,574.66 |
| 2. MdxListInlineCode | 136.67 | 571.86 | 708.53 |
| **Total** | **301.04** | **1,999.00** | **2,300.04** |

## Tokens: Astra (gpt-6-astra, medium, Codex)
| Run | Session file | Input | of which cached | Output | Reasoning | Total |
|---|---|---|---|---|---|---|
| Setup test | `rollout-2026-09-23T23-25-40-01a0cf68…` | 14,245 | 12,160 | 7 | 0 | 14,252 |
| T1 attempt 1 (sandboxed, not submitted) | `rollout-2026-09-23T23-28-14-01a0cf6b…` | 532,780 | 494,080 | 4,049 | 405 | 536,829 |
| T1 submitted | `rollout-2026-09-23T23-39-03-01a0cf74…` | 668,535 | 630,528 | 5,051 | 464 | 673,586 |
| T2 submitted | `rollout-2026-09-24T11-51-29-01a0d213…` | 488,043 | 439,808 | 2,687 | 273 | 490,730 |
| T3 (MobileMenuOverlay, tie, not submitted) | `rollout-2026-09-24T13-43-05-01a0d279…` | 751,982 | 683,392 | 4,516 | 321 | 756,498 |
| T4 (MobileAuditFixes) | `rollout-2026-09-25T11-10-57-01a0d714…` | 1,581,363 | 1,521,920 | 8,753 | 1,706 | 1,590,116 |
| T5 (ScrollbarAndResumeSeam) | `rollout-2026-09-25T19-19-06-01a0d8d3…` | 1,089,489 | 1,029,120 | 6,297 | 477 | 1,095,786 |
| **Total** | | **5,126,437** | **4,811,008** | **31,360** | **3,646** | **5,157,797** |

## Tokens: Gemini (gemini-3.8-flash, OpenCode)
The metered cost ($) is OpenCode's estimate. The actual bill of ₹301.04 for $3.1847 of usage works out to about ₹94.5 per $, including tax and currency conversion.

| Run | Session | Input | Cache read | Output | Reasoning | Est. cost ($) | ≈ ₹ |
|---|---|---|---|---|---|---|---|
| Setup test | `ses_f30972ea7ffeZYH6Ph56mW2rsc` | 2,426 | 8,132 | 4 | 45 | 0.0026 | 0.25 |
| T1 failed attempts (free-tier quota, prepay empty) ×9 | `ses_f3083a2…`, `ses_f3081a65…`, `ses_f307133c…`, `ses_f305f3f4…` + 5 empty | 45,793 | 12,266 | 279 | 562 | 0.0384 | 3.63 |
| T1 submitted | `ses_f2e1fc42fffe3Yy42xRFofjIYP` | 612,498 | 12,609,348 | 20,822 | 57,276 | 1.6979 | 160.50 |
| T2 attempt 1 (permission auto-rejected, not submitted) | `ses_f2de6755bffeXCd80K0qt0f7J7` | 276,851 | 1,519,886 | 1,321 | 10,262 | 0.3651 | 34.51 |
| T2 submitted | `ses_f2ddc120fffeUF6ZlSU1tUabvp` | 461,208 | 7,523,989 | 10,162 | 35,304 | 1.0807 | 102.16 |
| **Subtotal (billed ₹301.04)** | | **1,398,776** | **21,673,621** | **32,588** | **103,449** | **3.1847** | **301.04** |
| T3 (tie, submitted) | `ses_f2d7f98dcffexuD7u2SCooRgy2` | 469,228 | 3,361,496 | 16,183 | 26,607 | 0.7645 | ≈72.27 (est.) |
| T4 (MobileAuditFixes) | `ses_f28c78291ffeYn4hoQB7kELFER` | 524,330 | 13,365,240 | 17,187 | 66,924 | 1.7111 | ≈161.75 (est.) |
| T5 (ScrollbarAndResumeSeam) | `ses_f27261929ffe6EstkBKcqBnQw2` | — | — | — | — | 1.8088 | ≈170.99 (est.) |

## Wasted spend (failed or discarded runs)
- Task 3 (MobileMenuOverlay): both runs, a tie (submitted anyway as an honest tie). Gemini ≈ ₹72.27 (estimate, not yet in the bill) and 756,498 Astra tokens.
- Astra T1 sandboxed attempt: 536,829 tokens. The Codex sandbox blocked the browser.
- Gemini T1 failed attempts: ≈ ₹3.63 (quota and billing errors).
- Gemini T2 attempt 1: ≈ ₹34.51. The permission request was auto-rejected because `--auto` was missing.
- Total avoidable Gemini spend: **≈ ₹38.14 (13% of the Gemini bill)**. See the lessons in `submissions_tracker.md`.

## How to update
- Astra: the last `token_count` event in the session `.jsonl` → `info.total_token_usage`
- Gemini: `opencode export <session>` → sum `messages[].info.tokens` and `messages[].info.cost` over assistant messages
- After a top-up or a new bill, update the "Money spent" table and re-split the Gemini cost by each session's metered cost

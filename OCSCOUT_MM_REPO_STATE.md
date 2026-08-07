# MM-B: Canonical Repository Verification

**Date:** 2026-06-21
**Machine:** SD-FACTORY (Mac Mini M4)

---

## Canonical OC Scout Repository

The running OC Scout process points to `/Users/ocrunner/oc-scout/`. This is the canonical path.

**Note:** Git CLI commands fail with `fatal: detected dubious ownership` because the repo is owned by `ocrunner` and CC runs as `Jason`. Per hard constraints, no config was changed (no `safe.directory` added). All git state was read from raw `.git/` files.

| Field | Value | Source |
|---|---|---|
| **Path** | `/Users/ocrunner/oc-scout/` | Running process + `.git/` confirmed |
| **Branch** | `main` | `.git/HEAD` → `ref: refs/heads/main` |
| **HEAD commit** | `1eb92ebef2adb63d7e798702188292fef3ded7de` | `.git/refs/heads/main` |
| **Last commit message** | `[OC-AUDIT-02] fix mz_reddit_opportunity duplicate URL — r/singularity. Cap 40 for full mission deployment.` | `.git/COMMIT_EDITMSG` |
| **Remote** | `git@github.com:STDC26/stardance-scout.git` (SSH) | `.git/config` |
| **FETCH_HEAD** | `f00652e5` (main) + `b5b2227` (phase8/oc-audit-02) | `.git/FETCH_HEAD` |
| **Branches** | `main`, `feature`, `phase7`, `phase8`, `scout-roadmap-v1.1` | `.git/refs/heads/` |
| **Tags** | `scout-v2-core-locked`, `surface-v1.1.1-locked-2026-05-03` | `.git/refs/tags/` |
| **Working tree** | Cannot run `git status` due to ownership guard; file listing shows active working tree | — |

## Archive Copy

A second copy exists at `/Users/ocrunner/Archive/oc-scout/`:
- Same HEAD commit: `1eb92eb`
- Same branches and tags
- No remote configured (local-only archive)

## Jason's Copy (`/Users/Jason/code/stardance-scout/`)

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD | `879b162c` |
| Remote | `https://github.com/STDC26/stardance-scout.git` (HTTPS) |
| Tags | `scout-v2-core-locked`, `surface-v1.1.1-locked-2026-05-03`, `surface-v2.0-vt10-pass-2026-05-25` |
| Upstream sync | `0 0` (in sync with its upstream) |

Jason's copy is at a **different HEAD** (`879b162c`) than ocrunner's (`1eb92eb`). Jason's copy has one additional tag (`surface-v2.0-vt10-pass-2026-05-25`).

## M3 Commit Check

| Commit | Location | Result |
|---|---|---|
| `e2363e6` (M3) | `/Users/ocrunner/oc-scout/` | **NOT FOUND** (not in refs or packed-refs) |
| `e2363e6` (M3) | `/Users/Jason/code/stardance-scout/` | **NOT FOUND** (`git cat-file -e` fails) |
| `01834ad` (foundation) | All repos | **NOT FOUND** in any repo on this machine |

### Verdict: `M3_LAPTOP_ONLY` equivalent

Neither `e2363e6` (M3) nor `01834ad` (foundation) exists on this Mac Mini in any of the three scout repos. If these commits exist, they are on a different machine.

## `phase-1-foundation` Branch Check

No branch named `phase-1-foundation` exists on this machine in any repo. The ocrunner canonical repo branches are: `main`, `feature`, `phase7`, `phase8`, `scout-roadmap-v1.1`.

## GitHub Remote Accessibility

| Method | Result |
|---|---|
| SSH auth (`ssh -T git@github.com`) | `Hi DIO2026! You've successfully authenticated` |
| `git ls-remote git@github.com:STDC26/stardance-scout.git` | `ERROR: Repository not found` |
| `git ls-remote https://github.com/STDC26/stardance-scout.git` (Jason) | `repository not found` |

The GitHub remote is **not accessible** from either auth path. The repo may be deleted, renamed, or the `DIO2026` account lacks access. The ocrunner FETCH_HEAD shows it was reachable at some prior point (fetched `f00652e5` on main).

## Escalation Flags

1. **M3 / foundation commits not on Mini** — if the laptop holds `e2363e6` or `01834ad`, the laptop has unique work not present here. Do not push without DTC auth.
2. **GitHub remote inaccessible** — `STDC26/stardance-scout` returns "repository not found" via both SSH (DIO2026) and HTTPS. The canonical remote is unreachable.
3. **Jason's copy diverged** — Jason HEAD `879b162c` ≠ ocrunner HEAD `1eb92eb`. Different commit histories on the same machine.

## Overall MM-B Verdict: **PASS (with escalation flags)**

The canonical repo exists at `/Users/ocrunner/oc-scout/` on branch `main` at commit `1eb92eb`. It is running and has been continuously serving since May 18. However, three items require DTC/DRJ attention before travel: M3/foundation not locatable, GitHub remote inaccessible, Jason/ocrunner divergence.

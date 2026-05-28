# Backup Verification Report — LiteQDS Full GitHub Backup

**Per:** PTC directive `FULL_GITHUB_BACKUP_DIRECTIVE`
**Generated:** 2026-05-17
**Result:** PASS

## 1 · Working tree — `git status`

```
On branch xas-controlled-integration
nothing to commit, working tree clean
```

Working tree was clean before the backup commit; no uncommitted documentation,
evidence, manifests, or UAT artifacts were outstanding. The backup commit adds
only `BACKUP_MANIFEST.md` and `BACKUP_VERIFICATION_REPORT.md`.

## 2 · Branches — `git branch -a` summary

| Branch | Local tip | Remote |
|---|---|---|
| `rebuild/liteqds-g1-recovery-v1` | `7d19fb9` | in sync |
| `xas-xx-validation-prep` | `a4cd39f` | in sync |
| `xas-controlled-integration` | backup commit | pushed |

All three LiteQDS branches exist locally and on `origin`. No `U1 UAT` branch
exists (U1 UAT not started). `git push origin --all` executed.

## 3 · Tags — `git tag --list` summary

| Tag | Points to |
|---|---|
| `liteqds-g1-recovered-v1` | `7d19fb9` (certification) |
| `liteqds-full-backup-pre-u1-uat-v1` | backup commit (this backup) |

`git push origin --tags` executed.

## 4 · Remote verification — `git remote -v`

```
origin  git@github.com:STDC26/stardance-liteqds.git (fetch)
origin  git@github.com:STDC26/stardance-liteqds.git (push)
```

## 5 · Fresh clone replay

A fresh clone was taken from `origin` into a throwaway directory and validated:

- **Cloned branch:** `xas-controlled-integration`
- **Cloned HEAD SHA:** `2621e04ba4a1d7aea320225ae6cd86cca27fcdaa`
- **Integrity:** cloned `package.json` and `package-lock.json` are
  byte-identical to the repository state.
- **Replay:** `npm install` → `npx playwright install chromium` →
  `npm run test:all`.
- **Dependency warnings:** 5 moderate-severity advisories (`npm audit`) — no
  change from prior phases; not introduced by this backup.
- **Isolation:** the throwaway clone had `core.hooksPath` set to `/dev/null`;
  validation-only — no commits, pushes, or merges from it.

The fresh-clone replay validated the code state at `2621e04`. The backup commit
adds two Markdown documents only and does not affect any test suite.

## 6 · Test results (fresh clone replay)

| Suite | Result | Timing |
|---|---|---|
| Vitest (18 files) | 129 / 129 | ~0.5s |
| Harness Playwright (G1) | 138 / 138 (18 skipped) | ~11.3s |
| XAS Playwright (XAS-XX) | 90 / 90 (18 skipped) | ~7.8s |
| Integration Playwright (XAS-INT) | 40 / 40 (2 skipped) | ~4.2s |
| **Total** | **397 passed, 0 failed** | — |

Skips are intentional cross-project (desktop/mobile) gates.

## 7 · Evidence paths verified

All evidence artifacts listed in `BACKUP_MANIFEST.md` are present and tracked:
`harness/evidence/` (manifest + 12 screenshots), `xas/evidence/` (manifest +
12 screenshots), `xas/evidence/integration/` (IG-0 manifest + 7 screenshots),
`xas/evidence/integration-events.jsonl`, `xas/evidence/ig1/` (IG1-PREP
manifest, dry-run-insertion, rollback-drill).

## 8 · Baseline immutability confirmation

`git diff --quiet 7d19fb9 -- src fixtures harness/src harness/tests harness/evidence`
→ **clean**. The certified renderer, generator, fixtures, and certified harness
are byte-identical to the certified baseline `7d19fb9`. The
`rebuild/liteqds-g1-recovery-v1` branch remains protected and unchanged.

## 9 · Backup tag confirmation

`liteqds-full-backup-pre-u1-uat-v1` is an annotated tag pointing at the latest
committed state on `xas-controlled-integration` (the backup commit that adds
this report and `BACKUP_MANIFEST.md`).

## Verdict

**PASS.** A complete GitHub-backed recovery state exists: all branches and tags
pushed, the backup tag created and pushed, the certified baseline intact, and
the state replayable from a fresh clone.

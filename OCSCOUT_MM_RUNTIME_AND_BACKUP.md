# MM-C: Runtime & Backup Validation

**Date:** 2026-06-21
**Machine:** SD-FACTORY (Mac Mini M4)

---

## Runtime Database

**No SQLite database files found** in `/Users/ocrunner/oc-scout/`. Search covered `*.db`, `*.sqlite`, `*.sqlite3` recursively.

The running OC Scout process is a Streamlit dashboard (`streamlit run dashboard/app.py`), which may use flat files, JSON exports, or external data sources rather than a local SQLite DB. The `exports/` directory contains signal brief JSON files (date-stamped, 2026-03 through 2026-04 observed).

| Check | Result |
|---|---|
| SQLite DB files | **NONE FOUND** |
| Integrity check | N/A (no DB) |
| Table listing | N/A (no DB) |
| Export files | Present in `/Users/ocrunner/oc-scout/exports/` (signal briefs, JSON) |

## Backup Posture

### Backup locations found

| Location | Type | Contents | Age |
|---|---|---|---|
| `/Users/ocrunner/oc-scout/backups/` | Config + code snapshots | 8 config YAML snapshots, 8 runner.py snapshots, 8 llm_adapter.py snapshots, `lock_phase3_calib_v0_1/` dir, `system_state/` dir | Feb 24–26, 2026 |
| `/Users/ocrunner/oc-scout-backups/` | Git bundle | `scout_phase8_g8_2026-05-17_062439.bundle` (9.3 MB) | May 17, 2026 |
| `/Users/ocrunner/scout_migration_backup_20260503_174052/` | Migration backup | `oc_scout_full_backup.tar.gz` (80.6 MB), 2 launchd plists, `pre_migration_state.txt` | May 3, 2026 |
| `/Users/ocrunner/Archive/oc-scout/` | Full repo clone | Complete git repo at same HEAD `1eb92eb` | (git archive) |

### Off-Mini backup assessment

| Backup | Leaves the Mini? | Verdict |
|---|---|---|
| `/Users/ocrunner/oc-scout/backups/` | **No** — Mini-local | FAIL |
| `/Users/ocrunner/oc-scout-backups/` (bundle) | **No** — Mini-local | FAIL |
| `/Users/ocrunner/scout_migration_backup_20260503_174052/` | **No** — Mini-local | FAIL |
| `/Users/ocrunner/Archive/oc-scout/` | **No** — Mini-local | FAIL |
| GitHub remote `STDC26/stardance-scout` | **Unreachable** — "repository not found" | UNKNOWN |
| Time Machine | Destination `My Book Studio` configured but **not mounted** (`/Volumes/` shows no external volumes). Local snapshots only. | FAIL |

### Time Machine Status

- Destination configured: `My Book Studio` (local disk)
- Currently mounted: **No** (not in `/Volumes/`)
- Local snapshots: Present (`com.apple.TimeMachine.localsnapshots` in `/Volumes/`)
- Latest backup: Could not query (permission error)

## Source-of-Truth Classification

Per DTC ruling:
- **MAC_MINI_ONLY** → FAIL (just relocates the single point of failure)

All four backup copies (code backups, git bundle, migration backup, archive clone) are on the Mac Mini's local disk. The Time Machine external drive is not mounted. The GitHub remote is unreachable.

## Overall MM-C Verdict: **FAIL**

**Classification: `MAC_MINI_ONLY`**

All backups are Mini-local. No verified off-Mini copy exists. The git bundle (`scout_phase8_g8_2026-05-17_062439.bundle`, 9.3 MB) is the most portable backup artifact but it has not left the Mini. The Time Machine drive (`My Book Studio`) is not connected.

**Pre-departure action required:** Push to GitHub (restore remote access), connect Time Machine drive, or copy the bundle to the laptop / external storage.

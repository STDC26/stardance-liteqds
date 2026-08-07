# P1-A: Off-Machine Backup Verification

**Date:** 2026-06-21
**Machine:** SD-FACTORY (Mac Mini M4)
**Context:** This check was specified to run on the traveling laptop. CC is running on the Mac Mini. Laptop-local backup verification cannot be performed from the Mini.

---

## Execution Context Mismatch

P1-A requires verifying that backups **left the laptop** and arrived at an off-machine destination. Since CC is running on the Mac Mini (not the laptop), this check cannot be performed as specified.

## What Can Be Verified From the Mini

### External / Off-Mini Backup Destinations

| Destination | Status | Evidence |
|---|---|---|
| Time Machine (`My Book Studio`) | Configured but **NOT MOUNTED** | `tmutil destinationinfo` shows the destination; `/Volumes/` shows no external disk |
| GitHub remote (`STDC26/stardance-scout`) | **UNREACHABLE** | `git ls-remote` returns "repository not found" via both SSH and HTTPS |
| External drive / NAS | **NONE DETECTED** | `/Volumes/` shows only `Macintosh HD` and TM local snapshots |
| Cloud sync | **NONE DETECTED** | No iCloud Drive, Dropbox, or sync agent evidence in running processes |
| Travel backup directory | **NOT FOUND** | `find /Users -maxdepth 4 -name 'travel-backups'` returns nothing |
| Git bundles on Mini | 1 found: `scout_phase8_g8_2026-05-17_062439.bundle` (9.3 MB) — **Mini-local only** |

### Bundle Inventory (Mini-local, not verified off-machine)

| Bundle | Path | Size | Date |
|---|---|---|---|
| `scout_phase8_g8_2026-05-17_062439.bundle` | `/Users/ocrunner/oc-scout-backups/` | 9.3 MB | May 17, 2026 |

No `hey-mojo` bundle or any other git bundle found on this machine.

## Verdict: **BLOCKED**

P1-A cannot be completed from the Mac Mini. The check requires:
1. Running on the **laptop** (to verify backups left the laptop)
2. Access to the **off-machine destination** (mounted drive, NAS, cloud, or second machine)

Neither condition is met from this execution context.

**What is known:** No off-Mini backup copy of OC Scout has been verified. The Time Machine drive is not connected. The GitHub remote is unreachable. All backup artifacts found are Mini-local.

**Required action:** Run P1-A from the traveling laptop with the backup destination accessible, or connect the Time Machine drive to the Mini and verify its contents.

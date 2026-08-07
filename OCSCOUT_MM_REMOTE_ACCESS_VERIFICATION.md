# MM-A: Mac Mini Remote Access Verification

**Date:** 2026-06-21
**Machine:** Mac mini (M4, Model Mac16,10)
**Hostname:** SD-FACTORY
**Uptime:** 77 days, 20 hours
**Current user:** Jason
**Execution context:** CC is running locally on the Mac Mini, not remotely from a laptop.

---

## Discovery

CC is executing directly on the Mac Mini (`SD-FACTORY`), confirmed by `system_profiler SPHardwareDataType` → `Model Name: Mac mini`, `Chip: Apple M4`. The prompt assumed a laptop-to-Mini remote scenario, but the session is local.

## Remote Access Path Verification

These paths were verified from the Mini itself (confirming they are listening and available for remote access from the traveling laptop):

| Path | Check | Result | Verdict |
|---|---|---|---|
| **SSH** | `nc -z -G 2 localhost 22` | `Connection to localhost port 22 [tcp/ssh] succeeded!` | **PASS** |
| **VNC / Screen Sharing** | `nc -z -G 2 localhost 5900` | `Connection to localhost port 5900 [tcp/rfb] succeeded!` | **PASS** |
| **Tailscale** | `tailscale status` | CLI not installed (not in PATH, not in /Applications, not found via mdfind) | **FAIL** |

## OC Scout Service Status

| Check | Result |
|---|---|
| Running process | `ocrunner 27623 ... /Users/ocrunner/oc-scout/.venv/bin/python3 .venv/bin/streamlit run dashboard/app.py --server.headless true --server.address 127.0.0.1 --server.port 8501` |
| Running since | May 18 (33+ days continuous) |
| Running as user | `ocrunner` (not Jason) |
| Canonical path | `/Users/ocrunner/oc-scout/` |

## Tailscale Absence

Tailscale is not installed on this Mac Mini. No Tailscale daemon is running (`launchctl list` and `ps aux` show no matches). Network services are: Ethernet, Thunderbolt Bridge, Wi-Fi only.

**Impact on remote access from a traveling laptop:** Without Tailscale, remote SSH/VNC requires either:
1. Direct LAN access (same network)
2. Port forwarding on the router
3. A different VPN/mesh solution

This is a **gap for travel readiness** — if the laptop is on a different network (hotel, airport), there is no mesh path back to the Mini.

## Verdict

| Path | Verdict |
|---|---|
| Local session | **PASS** (CC is on the Mini) |
| SSH listening | **PASS** |
| VNC listening | **PASS** |
| Tailscale mesh | **FAIL** (not installed) |
| Remote reachability from off-network laptop | **UNKNOWN** — depends on router config, which is out of scope to inspect or change |

**Overall MM-A: PASS (with caveat)**
At least one remote path is PASS (SSH + VNC are listening). A real session is established (we are on the machine). However, the **off-network remote path is unproven** — Tailscale is absent and no alternative mesh is visible. This is flagged as a travel-readiness gap but does not block MM-B/C/D since we have a live session.

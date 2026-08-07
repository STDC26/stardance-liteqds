# MM-D: Infrastructure Resilience

**Date:** 2026-06-21
**Machine:** SD-FACTORY (Mac Mini M4)

---

## Power Management

```
System-wide power settings:
Currently in use:
 standby              0
 Sleep On Power Button 1
 autorestart          0
 powernap             1
 networkoversleep     0
 disksleep            0
 sleep                0 (sleep prevented by caffeinate, powerd)
 ttyskeepawake        1
 displaysleep         0
 tcpkeepalive         1
 lowpowermode         0
 womp                 1
```

| Setting | Value | Assessment |
|---|---|---|
| `sleep` | `0` (prevented by caffeinate, powerd) | **GOOD** — will not sleep |
| `autorestart` | `0` | **CONCERN** — will NOT auto-restart after power failure |
| `womp` (Wake on LAN) | `1` | **GOOD** — can be woken remotely on LAN |
| `disksleep` | `0` | **GOOD** — disks stay active |
| `powernap` | `1` | OK — background tasks during display sleep |
| `tcpkeepalive` | `1` | **GOOD** — maintains network connections |

### Power Recovery Posture: **PARTIAL**

The Mini will not sleep (good) and keeps TCP connections alive (good), but `autorestart=0` means a power outage will leave it off until someone physically presses the power button. No UPS detected (no external volumes suggesting UPS software, `system_profiler SPPowerDataType` not queried to avoid sudo).

**Risk:** A power outage during travel leaves the Mini offline with no auto-recovery.

## FileVault

```
FileVault is On.
```

| Check | Result |
|---|---|
| FileVault status | **ON** |
| Recovery key | NOT PRINTED (per hard constraint) |

**Impact:** FileVault is on, which means after a reboot the Mini requires a password at the login screen before any services (including SSH) start. Combined with `autorestart=0`, this creates a **double lock-out risk**: power failure → no auto-restart → even if manually powered on, FileVault login screen blocks SSH until a user logs in locally or via Screen Sharing.

## Network Recovery / Tailscale

| Check | Result |
|---|---|
| Tailscale installed | **NO** — not found anywhere on the system |
| Tailscale daemon | Not running |
| Tailscale auto-start | N/A |
| SSH listening | Yes (port 22) |
| VNC listening | Yes (port 5900) |
| Network after reboot | SSH + VNC depend on user login (FileVault blocks pre-login network services) |

### Network Recovery Posture: **PARTIAL**

SSH and VNC are listening, but after a reboot, FileVault will block all network services until someone logs in at the physical console. There is no mesh network (Tailscale) to provide an off-network path.

## OC Scout Service Recovery

| Check | Result |
|---|---|
| Running process | `ocrunner 27623` — Streamlit dashboard, running since May 18 |
| LaunchAgent plists | Found in `/Users/ocrunner/Archive/oc-scout/launchd/` (com.ocscout.daily, com.ocscout.competitive) |
| Active LaunchAgents | Not found in `/Users/ocrunner/Library/LaunchAgents/` — plists are in Archive only |
| RunAtLoad | `false` in the daily plist |

The Scout process appears to be running from a manual start (not launchd-managed), since the launchd plists are in the Archive, not in the active LaunchAgents directory, and `RunAtLoad` is `false`. After a reboot, the Scout dashboard would **not auto-start**.

## Secondary Access Path

If SSH fails:
1. **VNC / Screen Sharing** — listening on port 5900, but same FileVault/network constraints
2. **Physical access** — requires someone at the office to press power button and log in
3. **Wake on LAN** — enabled (`womp=1`), but only works if the Mini is asleep, not powered off

## Summary

| Dimension | Status | Risk |
|---|---|---|
| Power recovery (auto-restart) | `autorestart=0` | **HIGH** — power outage = offline until physical intervention |
| FileVault | ON | **MODERATE** — blocks network services after reboot until login |
| Sleep prevention | Active (caffeinate) | **GOOD** — won't sleep on its own |
| Network persistence | TCP keepalive + WoL | **GOOD** for sleep; **POOR** for power loss |
| Tailscale mesh | Not installed | **FAIL** — no off-network remote path |
| Scout auto-start | No active launchd plist | **FAIL** — Scout won't restart after reboot |
| Secondary access | VNC (same constraints as SSH) | **PARTIAL** |

## Overall MM-D Verdict: **FAIL**

The Mini is stable while running (77 days uptime, no sleep) but has no resilience against power loss or reboot. `autorestart=0` + FileVault + no launchd Scout service = a power outage during travel leaves the Mini offline and Scout dead with no remote recovery path.

**Pre-departure recommendations (observe-only, no changes made):**
1. Set `autorestart` to 1 (`sudo pmset -a autorestart 1`)
2. Install Tailscale for off-network remote access
3. Move Scout launchd plists from Archive to active LaunchAgents with `RunAtLoad true`
4. Connect and verify Time Machine drive

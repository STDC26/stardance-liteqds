# U1-S1-T1 · internal_review_surface Access Verification

**Per:** PTC directive `PTC-U1-S1-T1-ACCESS-CERTIFICATION-v0.1`
**Branch:** `u1-uat` · **Surface:** `internal_review_surface` (staging-equivalent, IG-0)
**Status:** certified deterministic local access — evidence persisted in-repo

> Canonical access record for the LiteQDS `internal_review_surface` used in
> U1-S1-T1 operator-cognition UAT. Resolves PTC blocker
> `INTERNAL_REVIEW_SURFACE_ACCESS_FAILURE` (a DRJ attempt against port `5173`
> with an invented path; the surface has never run on `5173`).

## 1 · Exact startup command

```bash
npm install                       # first run only
npx playwright install chromium   # first run only
npm run integration:dev           # serves internal_review_surface on :4319
```

Served by `vite.integration.config.ts` — `server.port: 4319`, `strictPort: true`
(Vite fails rather than silently choosing another port). The built-and-served
equivalent is `npm run integration:build && npm run integration:preview` (also
`:4319`, `strictPort`).

## 2 · Exact URL

| Purpose | URL |
|---|---|
| Canonical valid card (primary) | `http://localhost:4319/?flag=on&fixture=qds-learn` |
| Alternate path form (equivalent) | `http://localhost:4319/internal-review/liteqds?flag=on&fixture=qds-learn` |
| Rollback / detached | `http://localhost:4319/?flag=off&fixture=qds-learn` |
| F-WIRE refusal surface | `http://localhost:4319/?flag=on&variant=malformed` |
| Variation A / B | `…?flag=on&fixture=qds-mo` · `…?flag=on&fixture=qds-signal` |

The surface is a single-page app: state is driven by query parameters, not by
path routing. The alternate path form resolves via the Vite SPA fallback
(HTTP 200, identical render) — no path route was added; no IG-0 surface code
was modified.

## 3 · Feature-flag activation method

The flag key is `xas.liteqds.internal_review.enabled`, read by
`flagProviderFromQuery` into an in-memory `LocalFeatureFlagProvider`.

| State | Method | Result |
|---|---|---|
| ON | append `?flag=on` to the URL | panel mounts, card renders |
| OFF (default) | omit `flag`, or append `?flag=off` | fail-closed — panel not mounted |

Fail-closed is verified: any key not explicitly set reports disabled.

## 4 · Rollback method (single-step detach)

Change `?flag=on` → `?flag=off` (or remove the parameter). The surface renders
*"LiteQDS panel not mounted — Feature flag `xas.liteqds.internal_review.enabled`
is OFF."* This mirrors the certified single-step feature-flag detach
(`ROLLBACK_PROCEDURE.md` Procedure C). No restart, no rebuild, reproducible.

## 5 · Verification summary

| Verification | Result |
|---|---|
| Surface accessible locally on `:4319` | PASS — `/`, query-param URLs, and the alternate path all HTTP 200 |
| Feature-flag fail-closed behavior | PASS — default OFF; `?flag=off` → `not_mounted` |
| Single-step detach | PASS — `flag=on`→`flag=off` detaches with no restart |
| XAS adapter path preserved | PASS — render flows through `mountLiteQDSOnInternalReviewSurface` + the certified adapter; `envelopeFrozen: true` |
| No runtime authorization | PASS — mounted card reports `runtime_authorization: not_authorized`; `promotion_blocked: true` |
| No production endpoint usage | PASS — `localhost:4319` only; no remote/public endpoint |
| F-WIRE behavior preserved | PASS — `variant=malformed` → component-owned refusal `F-WIRE-01_MALFORMED_ENVELOPE` |
| Certified baseline immutability | PASS — `git diff 7d19fb9 -- src fixtures harness` clean |

### Evidence files (this directory)

| File | Shows |
|---|---|
| `t1-mounted.png` | flag ON — card rendered; `review_only`, `Not authorized for runtime`, `Human review required`, `TRUST SURFACE LIMITATIONS` all visible |
| `t1-detached.png` | flag OFF — "LiteQDS panel not mounted" |
| `t1-malformed.png` | F-WIRE — component-owned `LITEQDS REFUSAL` surface, `F-WIRE-01_MALFORMED_ENVELOPE` |
| `irs-startup.log` | Vite startup, `localhost:4319`, `strictPort` |

`window.__XAS_INT__` at capture time — mounted: `outcome: rendered`,
`runtimeAuthorization: not_authorized`, `promotionBlocked: true`,
`envelopeFrozen: true`; detached: `outcome: not_mounted`, `mounted: false`;
malformed: `outcome: refused`, `fwireCode: F-WIRE-01_MALFORMED_ENVELOPE`.

## 6 · Governance posture

| Field | Value |
|---|---|
| `surface_type` | `internal_review_surface` |
| `execution_mode` | `review_only` |
| `runtime_authorization` | `not_authorized` |
| `deployment_state` | `localhost_only` |
| `promotion_state` | `blocked` |

## 7 · Known constraints

- Localhost only — no public exposure, no production deployment.
- No renderer / generator / fixture mutation; certified `src/`, `fixtures/`,
  `harness/` byte-identical to `7d19fb9`.
- No path route was created — the SPA fallback already resolves the alternate
  path; adding a router would mutate the IG-0 surface unnecessarily.
- `runtime_authorization` remains `not_authorized`; no runtime activation, no
  Proto-QDS promotion.
- Evidence is persisted in-repo under `xas/evidence/u1-s1-t1/`.
- The DRJ-reported failure was an out-of-protocol URL (port `5173` + a
  path the surface does not use). The certified access above is the only
  supported access path for U1-S1-T1.

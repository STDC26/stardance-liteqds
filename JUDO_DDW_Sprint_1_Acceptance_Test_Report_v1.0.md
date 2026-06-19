# JUDO DDW Sprint 1 Acceptance Test Report v1.0

**Date:** 2026-06-18
**Test file:** `tests/decision-design-workspace.test.ts`
**Framework:** Vitest 2.1.9 (globals, node environment)
**Total tests:** 20 | **Passed:** 20 | **Failed:** 0
**Execution time:** 4ms (tests) / 264ms (total with transform)

---

## Spec v1.1 §14 Tests (T1–T12)

| # | Test | Expectation | Result |
|---|---|---|---|
| T1 | Fixture loads | prompt = "Should we expand into healthcare?" | PASS |
| T2 | SHAPE frame exists | context, type, uncertainty types (4), desired outcome, framing notes present | PASS |
| T3 | ALIGN ≥5 questions | 7 qualification questions (≥5 required) | PASS |
| T4 | Candidate design generates | `generateDesign()` yields design; status = DESIGN_GENERATED | PASS |
| T5 | Required design structure | 6 criteria (≥5), 8 evidence (≥7), 8 questions (≥8), confidence model, directional mapping (4 reads), governance notes | PASS |
| T6 | Human approval required | pre-approval `ready=false`, blocker present, `requiredHumanApproval=true` | PASS |
| T7 | Approval enables handoff (Gate 1→2) | `ready=true`, `blockers=[]`, `approvedBy="DRJ"`, `SEND_TO_QDS_REVIEW` not blocked | PASS |
| T8 | Rejection blocks handoff | status=REJECTED, `ready=false`, design status=REJECTED | PASS |
| T9 | Calibration band | `calibration.confidenceBand` = "MEDIUM" | PASS |
| T10 | Governed activation | pre-approval `SEND_TO_QDS_REVIEW` ∈ `blockedActions` | PASS |
| T11 | LEARN placeholder | `learn.status` = "PENDING_QDS_EXECUTION" | PASS |
| T12 | No autonomous decision | no "decision complete" or "approved automatically"; directional mapping contains "Illustrative" | PASS |

## Addendum Conformance Tests (8 tests)

| Rule | Test | Result |
|---|---|---|
| §1 Single source of truth | Session status is authoritative; design status is derived (DESIGN_GENERATED→DRAFT, UNDER_REVIEW→UNDER_REVIEW, APPROVED→APPROVED) | PASS |
| §2 Transitions | NEEDS_REFINEMENT → generateDesign() → DESIGN_GENERATED | PASS |
| §2 Approval revocation | APPROVED → requestRefinement clears approvedBy/approvedAt, resets ready=false | PASS |
| §2 Reset | resetSession() from any state → DRAFT, clears design/calibration/activation | PASS |
| §2 Rejection terminal | REJECTED allows only resetSession() | PASS |
| §3 Calibration gates | calibration.confidenceBand=MEDIUM, governanceStatus=CAUTION, qdsReadinessStatus=READY_WITH_REVIEW; activation blocked | PASS |
| §5 Illustrative mapping | All 4 directional read values contain "illustrative" | PASS |
| §7.1 Policy flag | requiredHumanApproval=true in both pre- and post-approval; ready+approvedBy carry pending/granted | PASS |

## Regression Confirmation

All 129 existing Vitest tests pass across 17 pre-existing test files:

| Suite | Tests | Result |
|---|---|---|
| panel-generator.spec.ts | 14 | PASS |
| fixtures.spec.ts | 10 | PASS |
| evidence-manifest.spec.ts | 5 | PASS |
| LiteQDSXASAdapter.spec.ts | 17 | PASS |
| liteqds.registration.spec.ts | 6 | PASS |
| hostEligibility.spec.ts | 4 | PASS |
| integrationTelemetry.spec.ts | 6 | PASS |
| internalReviewSurfaceMount.spec.ts | 5 | PASS |
| XASFeatureFlagProvider.spec.ts | 4 | PASS |
| featureFlagProviders.spec.ts | 6 | PASS |
| registryInsertionManifest.spec.ts | 8 | PASS |
| IXASRegistryProvider.spec.ts | 5 | PASS |
| IXASTelemetryProvider.spec.ts | 4 | PASS |
| reviewerGroupConfig.spec.ts | 4 | PASS |
| rollbackBeforeAttach.spec.ts | 3 | PASS |
| dryRunInsertion.spec.ts | 7 | PASS |
| rollbackDrill.spec.ts | 6 | PASS |
| ig1-preflight.spec.ts | 15 | PASS |

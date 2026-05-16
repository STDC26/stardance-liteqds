// XAS insertion adapter for LiteQDS.
//
// Additive integration layer. The adapter accepts an existing, certified
// LiteQDS envelope and prepares it for render handoff. It does NOT modify the
// renderer, the generator, or the envelope schema.
//
// Guarantees:
//   - the caller's envelope is never mutated;
//   - the envelope is deep-frozen before render handoff;
//   - host_context is carried separately from the envelope payload;
//   - the certified ImmutabilityGuard is reused, not forked.

import { validateEnvelope, type FWireCode, type LiteQDSEnvelope } from "../../src/index";
import { deepFreeze, isDeeplyFrozen } from "../../harness/src/ImmutabilityGuard";
import { checkHostEligibility } from "../host/hostEligibility";

// Host routing data — passed alongside the envelope, never folded into it.
export interface XASHostContext {
  host_surface: string;
}

export type XASInsertionResult =
  | {
      status: "ready_to_render";
      // The component to render is the certified QualificationCard.
      render_target: "QualificationCard";
      frozenEnvelope: Readonly<LiteQDSEnvelope>;
      host_context: XASHostContext;
      envelope_frozen: boolean;
    }
  | {
      status: "refused";
      // The component to render is the certified FWireFailureSurface.
      render_target: "FWireFailureSurface";
      code: FWireCode;
      detail: string;
    };

export class LiteQDSXASAdapter {
  /**
   * Accept an envelope + host context and produce a render handoff.
   *
   * `rawEnvelope` is validated but never mutated — validateEnvelope returns a
   * fresh parsed object, and only that copy is frozen.
   */
  insert(rawEnvelope: unknown, host_context: XASHostContext): XASInsertionResult {
    const validation = validateEnvelope(rawEnvelope);
    if (!validation.ok) {
      return {
        status: "refused",
        render_target: "FWireFailureSurface",
        code: validation.code,
        detail: validation.detail,
      };
    }

    const hostFailure = checkHostEligibility(
      host_context.host_surface,
      "insertion_time",
    );
    if (hostFailure) {
      return {
        status: "refused",
        render_target: "FWireFailureSurface",
        code: hostFailure.code,
        detail: hostFailure.detail,
      };
    }

    // Deep-freeze before render handoff. Reuses the certified harness guard.
    const frozenEnvelope = deepFreeze(validation.envelope);
    return {
      status: "ready_to_render",
      render_target: "QualificationCard",
      frozenEnvelope,
      host_context,
      envelope_frozen: isDeeplyFrozen(frozenEnvelope),
    };
  }
}

export const liteQDSXASAdapter = new LiteQDSXASAdapter();

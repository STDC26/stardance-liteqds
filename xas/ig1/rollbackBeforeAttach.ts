// IG-1 PREPARATION — rollback-before-attach protocol.
//
// Operational safety invariant: a detach (rollback) path must exist and be
// verified BEFORE any attach path is prepared. There is no code path by which
// an attach can be prepared without a registered single-step detach.

export interface DetachStep {
  id: string;
  description: string;
  // The detach must be a single step (single-step detach requirement).
  single_step: boolean;
}

export interface AttachStep {
  id: string;
  description: string;
}

export interface AttachPreparation {
  attach: AttachStep;
  detach: DetachStep;
  rollback_verified_before_attach: true;
}

export class RollbackBeforeAttachViolation extends Error {
  constructor(detail: string) {
    super(`ROLLBACK-BEFORE-ATTACH VIOLATION: ${detail}`);
    this.name = "RollbackBeforeAttachViolation";
  }
}

/**
 * Enforces the rollback-before-attach invariant.
 *
 * registerDetach() must be called — with a single-step detach — before
 * prepareAttach() will succeed. prepareAttach() throws if no detach path has
 * been registered, so an attach can never be prepared without rollback.
 */
export class RollbackBeforeAttachProtocol {
  private detach: DetachStep | null = null;

  registerDetach(detach: DetachStep): void {
    if (!detach.single_step) {
      throw new RollbackBeforeAttachViolation(
        `detach step '${detach.id}' must be single-step`,
      );
    }
    this.detach = detach;
  }

  get hasDetachPath(): boolean {
    return this.detach !== null;
  }

  prepareAttach(attach: AttachStep): AttachPreparation {
    if (this.detach === null) {
      throw new RollbackBeforeAttachViolation(
        `attach '${attach.id}' is forbidden — no detach path has been ` +
          `registered; rollback must exist before attach`,
      );
    }
    return {
      attach,
      detach: this.detach,
      rollback_verified_before_attach: true,
    };
  }
}

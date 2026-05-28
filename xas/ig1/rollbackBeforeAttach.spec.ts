import { describe, expect, it } from "vitest";
import {
  RollbackBeforeAttachProtocol,
  RollbackBeforeAttachViolation,
} from "./rollbackBeforeAttach";

const singleStepDetach = {
  id: "detach.flag-off",
  description: "set the feature flag OFF",
  single_step: true,
};

describe("rollback-before-attach protocol", () => {
  it("forbids prepareAttach when no detach path is registered", () => {
    const protocol = new RollbackBeforeAttachProtocol();
    expect(protocol.hasDetachPath).toBe(false);
    expect(() =>
      protocol.prepareAttach({ id: "attach.x", description: "x" }),
    ).toThrow(RollbackBeforeAttachViolation);
  });

  it("allows prepareAttach once a detach path is registered first", () => {
    const protocol = new RollbackBeforeAttachProtocol();
    protocol.registerDetach(singleStepDetach);
    expect(protocol.hasDetachPath).toBe(true);
    const prep = protocol.prepareAttach({
      id: "attach.registry-insert",
      description: "dry-run registry insertion",
    });
    expect(prep.rollback_verified_before_attach).toBe(true);
    expect(prep.detach).toEqual(singleStepDetach);
  });

  it("rejects a detach step that is not single-step", () => {
    const protocol = new RollbackBeforeAttachProtocol();
    expect(() =>
      protocol.registerDetach({
        id: "detach.multi",
        description: "multi-step teardown",
        single_step: false,
      }),
    ).toThrow(RollbackBeforeAttachViolation);
    // A rejected detach leaves no detach path — attach stays forbidden.
    expect(protocol.hasDetachPath).toBe(false);
  });
});

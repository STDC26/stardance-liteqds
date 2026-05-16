import { describe, expect, it } from "vitest";
import {
  PLACEHOLDER_REVIEWER_GROUP,
  ReviewerGroupConfigError,
  assertNoHardcodedIdentities,
  bindReviewerGroup,
} from "./reviewerGroupConfig";

describe("reviewer-group binding via configuration", () => {
  it("returns the placeholder group when no config is supplied", () => {
    const binding = bindReviewerGroup();
    expect(binding.group_id).toBe(PLACEHOLDER_REVIEWER_GROUP);
    expect(binding.is_placeholder).toBe(true);
    expect(binding.injected_via).toBe("config");
  });

  it("binds a real group id supplied via config", () => {
    const binding = bindReviewerGroup({
      group_id: "internal_review_pod_b",
      member_ref_count: 4,
    });
    expect(binding.group_id).toBe("internal_review_pod_b");
    expect(binding.is_placeholder).toBe(false);
    expect(binding.member_ref_count).toBe(4);
  });

  it("rejects an identity-like group_id (email / name / dotted handle)", () => {
    for (const bad of [
      "jane@example.com",
      "Jane Doe",
      "jane.doe",
      "user_42",
    ]) {
      expect(() => bindReviewerGroup({ group_id: bad })).toThrow(
        ReviewerGroupConfigError,
      );
    }
  });

  it("never embeds individual identities — binding carries only a group + count", () => {
    const binding = bindReviewerGroup({ group_id: "internal_review_pod_b" });
    expect(Object.keys(binding).sort()).toEqual([
      "group_id",
      "injected_via",
      "is_placeholder",
      "member_ref_count",
    ]);
    expect(() => assertNoHardcodedIdentities(binding)).not.toThrow();
  });
});

// IG-1 PREPARATION — reviewer-group binding via configuration only.
//
// The reviewer group is injected through configuration. No individual reviewer
// identity is ever hardcoded here — identities are supplied by DRJ at IG-1
// execution time. The binding carries a group id and an abstract member-ref
// count, never names or contact details.

export const PLACEHOLDER_REVIEWER_GROUP = "liteqds_internal_review_alpha";

// Heuristics for strings that look like an individual identity rather than a
// group id (emails, full names, dotted user handles, user-prefixed handles).
const IDENTITY_LIKE_PATTERNS = [
  /@/,
  /\s/,
  /^user[-_]/i,
  /^[a-z]+\.[a-z]+$/i,
];

export interface ReviewerGroupConfigInput {
  group_id?: string;
  member_ref_count?: number;
}

export interface ReviewerGroupBinding {
  group_id: string;
  injected_via: "config";
  member_ref_count: number;
  is_placeholder: boolean;
}

export class ReviewerGroupConfigError extends Error {
  constructor(detail: string) {
    super(`REVIEWER-GROUP-CONFIG: ${detail}`);
    this.name = "ReviewerGroupConfigError";
  }
}

function rejectIdentityLike(groupId: string): void {
  for (const pattern of IDENTITY_LIKE_PATTERNS) {
    if (pattern.test(groupId)) {
      throw new ReviewerGroupConfigError(
        `group_id '${groupId}' looks like an individual identity; ` +
          `supply a reviewer GROUP id, never a person`,
      );
    }
  }
}

/**
 * Bind a reviewer group from configuration.
 *
 * With no config, returns the placeholder group binding (is_placeholder true)
 * — IG-1 execution must supply a real group_id via config. Throws if the
 * supplied group_id looks like an individual identity.
 */
export function bindReviewerGroup(
  input: ReviewerGroupConfigInput = {},
): ReviewerGroupBinding {
  const group_id = input.group_id ?? PLACEHOLDER_REVIEWER_GROUP;
  rejectIdentityLike(group_id);
  return {
    group_id,
    injected_via: "config",
    member_ref_count: input.member_ref_count ?? 0,
    is_placeholder: input.group_id === undefined,
  };
}

/** Re-assert a binding carries no hardcoded individual identity. */
export function assertNoHardcodedIdentities(
  binding: ReviewerGroupBinding,
): void {
  rejectIdentityLike(binding.group_id);
}

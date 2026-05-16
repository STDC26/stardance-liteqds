// IG-1 PREPARATION — registry insertion manifest schema.
//
// The manifest is the declarative description of an IG-1 registry insertion:
// what component, under what governance, onto what surface, behind what flag,
// with what telemetry / reviewer / rollback bindings. It is validated before
// any (future, separately authorized) insertion is attempted.
//
// The schema makes the governance and rollback guarantees structural: a
// manifest without a rollback protocol, or with runtime authorization, or with
// outbound telemetry, cannot validate.

import { z } from "zod";

export const RegistryInsertionManifestSchema = z
  .object({
    manifest_version: z.literal("ig1.v0.1"),
    component_id: z.literal("liteqds-panel-v0.1"),
    certified_commit: z.string().min(1),
    certification_tag: z.literal("liteqds-g1-recovered-v1"),

    governance: z
      .object({
        governance_class: z.literal("lite_experimental"),
        runtime_authorization: z.literal("not_authorized"),
        human_review_required: z.literal(true),
        promotion_blocking_status: z.literal(true),
      })
      .strict(),

    host_binding: z
      .object({
        target_host_surface: z.literal("internal_review_surface"),
        integration_mode: z.literal("review_only"),
        deployment_posture: z.literal("non_production"),
        eligible_host_surfaces: z.array(z.string().min(1)).min(1),
        forbidden_host_surfaces: z.array(z.string().min(1)).min(1),
      })
      .strict(),

    feature_flag: z
      .object({
        key: z.string().min(1),
        default_state: z.literal("off"),
        // Abstraction name (e.g. "XASFeatureFlagProvider"), never a vendor.
        provider_kind: z.string().min(1),
      })
      .strict(),

    telemetry: z
      .object({
        provider_mode: z.enum(["dry_run", "local"]),
        outbound: z.literal(false),
        append_only: z.literal(true),
      })
      .strict(),

    reviewer_group: z
      .object({
        group_id: z.string().min(1),
        injected_via: z.literal("config"),
      })
      .strict(),

    // Required. A manifest without a rollback protocol cannot validate.
    rollback_protocol: z
      .object({
        rollback_before_attach: z.literal(true),
        detach_step: z.string().min(1),
        single_step_detach: z.literal(true),
      })
      .strict(),
  })
  .strict();

export type RegistryInsertionManifest = z.infer<
  typeof RegistryInsertionManifestSchema
>;

export type ManifestValidation =
  | { ok: true; manifest: RegistryInsertionManifest }
  | { ok: false; detail: string };

export function validateRegistryInsertionManifest(
  raw: unknown,
): ManifestValidation {
  const parsed = RegistryInsertionManifestSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      detail: `${issue?.path.join(".") || "(root)"}: ${issue?.message ?? "invalid"}`,
    };
  }
  return { ok: true, manifest: parsed.data };
}

// The canonical IG-1 registry insertion manifest for the internal_review_surface
// integration. Pure data — produces no side effect.
export function buildRegistryInsertionManifest(opts: {
  reviewer_group_id: string;
}): RegistryInsertionManifest {
  return {
    manifest_version: "ig1.v0.1",
    component_id: "liteqds-panel-v0.1",
    certified_commit: "7d19fb9",
    certification_tag: "liteqds-g1-recovered-v1",
    governance: {
      governance_class: "lite_experimental",
      runtime_authorization: "not_authorized",
      human_review_required: true,
      promotion_blocking_status: true,
    },
    host_binding: {
      target_host_surface: "internal_review_surface",
      integration_mode: "review_only",
      deployment_posture: "non_production",
      eligible_host_surfaces: [
        "uxc_activation_surface",
        "experimental_sandbox",
        "internal_review_surface",
      ],
      forbidden_host_surfaces: [
        "production_runtime_surface",
        "customer_facing_surface",
        "governed_decision_surface",
      ],
    },
    feature_flag: {
      key: "xas.liteqds.internal_review.enabled",
      default_state: "off",
      provider_kind: "XASFeatureFlagProvider",
    },
    telemetry: {
      provider_mode: "dry_run",
      outbound: false,
      append_only: true,
    },
    reviewer_group: {
      group_id: opts.reviewer_group_id,
      injected_via: "config",
    },
    rollback_protocol: {
      rollback_before_attach: true,
      detach_step: "set xas.liteqds.internal_review.enabled = OFF",
      single_step_detach: true,
    },
  };
}

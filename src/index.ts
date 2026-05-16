// Public API — LiteQDS canonical (controlled rebuild).

export {
  GOVERNANCE_CLASS,
  RUNTIME_AUTHORIZATION,
  DIRECTIONAL_CONFIDENCE,
  DIRECTIONAL_CONFIDENCE_LABEL,
} from "./types";
export type {
  GovernanceClass,
  RuntimeAuthorization,
  DirectionalConfidence,
  VerdictOption,
  LiteQDSPanelSpec,
  LiteQDSInsertionBrief,
  LiteQDSEnvelope,
  LiteQDSGeneratorInput,
} from "./types";

export { F_WIRE_CODES, F_WIRE_OPERATOR_MESSAGES } from "./f-wire";
export type { FWireCode } from "./f-wire";

export { generateLiteQDSPanel } from "./generator";

export {
  LiteQDSGenerationError,
  validateGeneratorInput,
  validateEnvelope,
  GeneratorInputSchema,
  PanelSpecSchema,
  InsertionBriefSchema,
  EnvelopeSchema,
  FORBIDDEN_OUTPUT_FIELD_PATTERNS,
} from "./validation";
export type { EnvelopeValidation } from "./validation";

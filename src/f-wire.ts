// F-WIRE failure codes — shared by the Panel Generator and the Render Harness.
// F-WIRE-01..03 are detectable at generation / envelope-receipt time.
// F-WIRE-04..06 are detectable at render / insertion time.

export const F_WIRE_CODES = [
  "F-WIRE-01_MALFORMED_ENVELOPE",
  "F-WIRE-02_REQUIRED_FIELD_MISSING",
  "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS",
  "F-WIRE-04_VIEWPORT_TOO_SMALL",
  "F-WIRE-05_BAND_RENDERING_VIOLATION",
  "F-WIRE-06_FORBIDDEN_HOST_SURFACE",
] as const;

export type FWireCode = (typeof F_WIRE_CODES)[number];

// Operator-readable messages. The component owns the refusal surface; these
// strings are surfaced *through* the component, never an XAS-branded error page.
export const F_WIRE_OPERATOR_MESSAGES: Record<FWireCode, string> = {
  "F-WIRE-01_MALFORMED_ENVELOPE":
    "Cannot render Card — payload envelope is malformed.",
  "F-WIRE-02_REQUIRED_FIELD_MISSING":
    "Cannot render Card — a required field is missing.",
  "F-WIRE-03_NON_LITE_GOVERNANCE_CLASS":
    "This Card is not a Lite QDS output; use the Proto rendering path instead.",
  "F-WIRE-04_VIEWPORT_TOO_SMALL":
    "Cannot render Card at this viewport — minimum trust-signal set cannot be shown.",
  "F-WIRE-05_BAND_RENDERING_VIOLATION":
    "Band rendering rule violation detected.",
  "F-WIRE-06_FORBIDDEN_HOST_SURFACE":
    "Lite QDS Card cannot render in this host surface.",
};

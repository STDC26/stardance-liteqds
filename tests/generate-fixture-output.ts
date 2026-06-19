// Generate the Sprint 1 fixture output (Addendum §7.1 end-state)
import {
  initializeFixtureSession,
  generateDesign,
  markUnderReview,
  approveForQdsHandoff,
  getSession,
} from "../product/src/judo/decision-design-store";
import { writeFileSync } from "fs";

initializeFixtureSession();
generateDesign();
markUnderReview();
approveForQdsHandoff();

const session = getSession();
if (!session) throw new Error("No session");

writeFileSync(
  "JUDO_DDW_Healthcare_Expansion_Fixture_Output_v1.0.json",
  JSON.stringify(session, null, 2) + "\n"
);

console.log("Fixture output written.");
console.log("Status:", session.status);
console.log("Design status:", session.design?.status);
console.log("Handoff ready:", session.design?.qdsHandoffReadiness.ready);
console.log("Approved by:", session.design?.qdsHandoffReadiness.approvedBy);

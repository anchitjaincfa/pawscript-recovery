import test from "node:test";
import assert from "node:assert/strict";
import { buildPlan } from "./plan.js";

const intake = {
  patientName: "Milo", surgeryType: "orthopedic", dischargeDate: "2026-07-17",
  activityLevel: "high", stairs: "inside", spaceType: "small", crateTolerance: "refuses",
  otherPets: "playful", caretakerMobility: "limitedLifting", caretakerName: "Sam"
};

test("generates an approval-gated, home-specific plan", () => {
  const plan = buildPlan(intake);
  assert.equal(plan.status, "DRAFT - CLINICIAN REVIEW REQUIRED");
  assert.equal(plan.timeline.length, 3);
  assert.match(plan.homeSetup.join(" "), /Stairs are a home-specific risk/);
  assert.match(plan.homeSetup.join(" "), /Crate use may be difficult/);
  assert.match(plan.homeSetup.join(" "), /lifting or mobility constraints/);
  assert.match(plan.escalation.join(" "), /Do not change medication/);
});

test("requires the key intake facts", () => {
  assert.throws(() => buildPlan({ patientName: "Milo" }), error => error.code === "INVALID_INTAKE" && error.missing.includes("surgeryType"));
});

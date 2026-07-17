const required = ["patientName","surgeryType","dischargeDate","activityLevel","stairs","spaceType","crateTolerance","otherPets","caretakerMobility"];

const labels = {
  surgery: { orthopedic: "orthopedic procedure", softTissue: "soft-tissue procedure", dental: "dental procedure", other: "procedure" },
  activity: { low: "low-energy", medium: "moderate-energy", high: "high-energy" }
};

const text = (v, max = 180) => typeof v === "string" ? v.trim().slice(0, max) : "";
const choice = (v, allowed, fallback) => allowed.includes(v) ? v : fallback;

export function normalize(input = {}) {
  const x = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, text(value)]));
  x.patientName = text(x.patientName, 80);
  x.surgeryType = choice(x.surgeryType, Object.keys(labels.surgery), "other");
  x.activityLevel = choice(x.activityLevel, Object.keys(labels.activity), "medium");
  x.stairs = choice(x.stairs, ["none","inside","outside","both"], "none");
  x.spaceType = choice(x.spaceType, ["open","small","multiLevel","yard"], "open");
  x.crateTolerance = choice(x.crateTolerance, ["comfortable","refuses","anxious","unknown"], "unknown");
  x.otherPets = choice(x.otherPets, ["none","calm","playful","unknown"], "unknown");
  x.caretakerMobility = choice(x.caretakerMobility, ["noLimits","limitedLifting","limitedMobility","needsHelp"], "noLimits");
  return x;
}

function homeSetup(x) {
  const list = [
    "Use the treating clinic's discharge instructions as the source of truth for medication, feeding, wound care, and activity limits.",
    "Set up one quiet, non-slip recovery zone with bedding, water, and essentials within reach. Limit furniture, rough play, and household traffic unless the clinic specifically approves otherwise.",
    "Keep the clinic phone number, after-hours number, discharge paperwork, and this reviewed plan together for every caretaker."
  ];
  if (x.stairs !== "none") list.push("Stairs are a home-specific risk. Block them with a gate or closed door and ask the treating team exactly when, whether, and how they may be used. Do not improvise a lift or carry.");
  if (x.spaceType === "small") list.push("In a small home, clear cords, loose rugs, and low obstacles from the recovery path. Keep routine care on one level when possible.");
  if (x.spaceType === "multiLevel") list.push("Choose one primary level for recovery and place food, water, bedding, and supplies there before arrival.");
  if (x.crateTolerance === "refuses" || x.crateTolerance === "anxious") list.push("Crate use may be difficult. Before discharge, ask the clinic to approve a specific alternative setup, such as an exercise pen or gated room. Do not force a distressed patient into a new setup without guidance.");
  if (x.crateTolerance === "comfortable") list.push("If a crate is part of the clinician-approved plan, set it up before arrival and keep it quiet and stable.");
  if (x.otherPets === "playful") list.push("Use doors, gates, and caretaker handoffs to physically separate playful pets. Never rely on the recovering patient to avoid a high-energy housemate.");
  if (x.otherPets === "calm") list.push("Allow contact with calm pets only if the clinic permits it and a caretaker can supervise. Separate during meals, rest, and any rising activity.");
  if (x.caretakerMobility !== "noLimits") list.push("The main caretaker has lifting or mobility constraints. Arrange a second capable adult and clinic-approved support plan before discharge. Never attempt a transfer that feels unsafe.");
  return list;
}

function timeline(x) {
  const n = x.patientName;
  const procedure = labels.surgery[x.surgeryType];
  return [
    { window: "Arrival through day 2", goal: "Stabilize the first routine", actions: [
      "Follow the treating team's written instructions for the first meal, medication, elimination, incision observation, and movement.",
      "Keep " + n + " in the approved recovery zone. Log each medication, meal, bathroom break, and concern so caretakers do not guess.",
      "Use only movement, support equipment, and confinement the clinic approved for this " + procedure + "."
    ] },
    { window: "Days 3 to 7", goal: "Make restrictions sustainable at home", actions: [
      "Keep the same home setup and activity boundaries unless the treating team changes them.",
      "For a " + labels.activity[x.activityLevel] + " patient, ask the clinic which low-motion enrichment is safe before adding an activity.",
      "Review the plan with every caretaker and write down changes or questions for the clinic."
    ] },
    { window: "Days 8 to 14 and recheck", goal: "Prepare for clinical reassessment", actions: [
      "Do not advance exercise, stairs, play, grooming, bathing, or medication because the patient appears better. Wait for clinician guidance.",
      "Bring the home log, unanswered questions, and any requested photos or observations to the recheck.",
      "Ask for the next specific milestone and update this plan only after the treating team confirms it."
    ] }
  ];
}

export function buildPlan(raw = {}) {
  const missing = required.filter(key => !text(raw[key]));
  if (missing.length) {
    const error = new Error("Complete the required intake fields before generating a plan.");
    error.code = "INVALID_INTAKE";
    error.missing = missing;
    throw error;
  }
  const x = normalize(raw);
  const clinicQuestions = [
    "What exact movement, confinement, and toileting limits apply today?",
    "Which changes need a same-day call versus an emergency visit?",
    "When is the next recheck, and what must be true before activity changes?"
  ];
  if (x.stairs !== "none") clinicQuestions.push("Are stairs allowed at all? If yes, what method and frequency do you approve for this home?");
  if (x.crateTolerance !== "comfortable") clinicQuestions.push("What confinement alternative do you approve if crate use is not tolerated?");
  if (x.caretakerMobility !== "noLimits") clinicQuestions.push("What support equipment or additional help do you recommend for this caretaker?");
  if (x.otherPets !== "none") clinicQuestions.push("What separation plan do you recommend around other pets?");
  const escalation = [
    "Contact the treating hospital promptly for any concern that conflicts with the discharge instructions, new or worsening pain, repeated vomiting, inability to rest, unexpected incision changes, or a missed medication decision.",
    "Seek urgent veterinary guidance for collapse, trouble breathing, uncontrolled bleeding, pale or blue gums, an incision that opens, inability to urinate, or any sudden severe change. This list is not complete; use the hospital's emergency instructions.",
    "Do not change medication, confinement, or activity restrictions based on an automated plan. The treating veterinary team must make those decisions."
  ];
  if (x.stairs !== "none") escalation.push("If stairs become unavoidable, pause and call the clinic rather than attempting an unsafe transfer.");
  if (x.caretakerMobility !== "noLimits") escalation.push("If the planned caretaker cannot safely complete a task, call the clinic or support person before trying to lift, restrain, or move the patient.");
  return {
    planVersion: "0.1",
    generatedAt: new Date().toISOString(),
    status: "DRAFT - CLINICIAN REVIEW REQUIRED",
    patient: { name: x.patientName, procedure: labels.surgery[x.surgeryType], dischargeDate: x.dischargeDate, clinician: x.clinicianName || "Not yet assigned" },
    safety: {
      headline: "This is a home-setup and communication aid, not medical advice or a replacement for the treating veterinary team.",
      approvalChecklist: [
        "Treating clinician has reviewed recovery restrictions.",
        "Caretaker has confirmed the home setup is feasible.",
        "Clinic emergency and recheck instructions are attached.",
        "No medication or activity instruction was created or changed by this tool."
      ]
    },
    homeSetup: homeSetup(x),
    timeline: timeline(x),
    escalation,
    clinicQuestions,
    handoffScript: "Hello, this is " + (x.caretakerName || "the caretaker") + " calling about " + x.patientName + ", discharged after a " + labels.surgery[x.surgeryType] + " on " + x.dischargeDate + ". At home we have " + (x.homeNotes || "the setup described in the intake") + ". I am concerned about [describe the specific change]. Can you tell me whether we should be seen now and what to do until then?"
  };
}

export default function handler(req, res) {
  if (req.method === "OPTIONS") { res.setHeader("Allow", "POST, OPTIONS"); return res.status(204).end(); }
  if (req.method !== "POST") { res.setHeader("Allow", "POST, OPTIONS"); return res.status(405).json({ error: "Method not allowed. Use POST." }); }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const plan = buildPlan(body);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(plan);
  } catch (error) {
    if (error.code === "INVALID_INTAKE") return res.status(400).json({ error: error.message, missing: error.missing });
    return res.status(400).json({ error: "We could not generate the plan. Check the intake and try again." });
  }
}

# Pawscript agent operating guide

Pawscript is a clinic-facing recovery-plan draft generator. It must never create, alter, or imply medical instructions without treating-clinician review.

## Operating constraints

- Treat veterinary discharge instructions as the source of truth.
- Never put patient or client information in prompts, issues, logs, screenshots, or fixtures.
- Prefer deterministic home-setup and communication guidance in the MVP.
- A veterinarian and security reviewer must approve changes involving medication, exercise restrictions, wound care, triage, or data handling.

## Parallel lanes

The orchestrator creates bounded, independently testable work items. Each lane uses its own branch or worktree and lands a reviewed pull request.

1. Discovery and clinician advocate: interviews the first five clinic pilots and owns acceptance criteria.
2. Safety and policy reviewer: checks medical-boundary copy, escalation language, privacy, and state-practice implications.
3. Product and UX engineer: owns the intake, approval handoff, accessibility, and print experience.
4. Rules-engine engineer: owns deterministic plan generation and fixtures; never invents a clinical protocol.
5. Quality reviewer: adds adversarial inputs, runs tests, inspects deployment, and rejects unsafe claims.

The orchestrator limits active implementation to three to five agents, records decisions in issues, and requires a testable acceptance condition before merge.

## Definition of done

A change is done only when acceptance criteria, automated checks, reviewer notes, and deployment verification are attached to its issue or PR. Safety-sensitive changes also require clinician approval.

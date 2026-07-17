# Pawscript

**Clinician-reviewed, home-specific post-operative recovery-plan drafts for veterinary practices.**

Pawscript began with a simple discharge problem: generic recovery sheets assume a calm patient, an easy home, and a caretaker who can lift or confine them. The clinic protocol may be sound while the handoff fails in a small apartment, on stairs, around other pets, or with a caretaker who needs help.

> This repository is a deliberately bounded **clinic-pilot prototype**, not a veterinary-care product. It does not diagnose, prescribe, calculate doses, interpret photos, or replace the treating veterinary team.

## Live demo

[https://pawscript-recovery.vercel.app](https://pawscript-recovery.vercel.app)

## What is live in this MVP

- A polished four-step intake for patient context, home conditions, and caretaker constraints.
- A Vercel serverless plan compiler at `POST /api/plan`.
- A deterministic, home-specific draft covering setup, staged recovery, escalation, clinic questions, and a call script.
- A mandatory clinician-review state and printable owner-facing draft.
- Remote CI via GitHub Actions.

The generator intentionally offers **communication and setup prompts only**. The clinician's written discharge instructions remain the source of truth for medication, activity, feeding, wound care, recheck, and emergency decisions.

## Architecture

```text
Clinic/tech intake -> /api/plan deterministic compiler -> review-required recovery draft -> clinician approval -> owner handoff
```

The first release has no database, client portal, EHR/PIMS integration, or AI model call. That is intentional: it keeps the validation surface small and prevents any pretense of autonomous clinical judgement.

## Safety and compliance posture

- A vet must review and approve every patient-facing plan.
- No changes to medication, activity restrictions, or clinical triage can originate in Pawscript.
- Do not enter live client data until the clinic has completed privacy, consent, retention, security, and applicable veterinary-practice review.
- Any future photo workflow routes a photo to a human clinic queue; it must not diagnose or classify a complication.
- Work only under an appropriate veterinarian-client-patient relationship and state-specific guidance.

Relevant primary guidance: [AAHA discharge protocol](https://eval.aaha.org/View_Protocol.aspx?key=411d742c-2afc-49eb-b735-1e25388a294f&type=outline), [AAHA VCPR position](https://www.aaha.org/vcpr/), [AAVSB AI guidance](https://www.aavsb.org/wp-content/uploads/2026/02/AAVSB-AI-Guidance-Whitepaper01122026-2.pdf), and [FDA VCPR/telemedicine guidance](https://www.fda.gov/animal-veterinary/product-safety-information/veterinarian-client-patient-relationships-prescribingdispensing-animal-drugs-and-telemedicine).

## YC-shaped validation plan

This is not a product to scale before it earns the right to exist.

1. Recruit 5-10 veterinary clinicians or technicians who create post-op instructions today.
2. Run a concierge pilot: produce plans manually from their own approved templates for one or two clinics.
3. Measure time to clinician-approved discharge, edit/correction rate, clinician confidence, owner clarification calls, and recheck adherence.
4. Automate only the repeated bottleneck that those pilots reveal.
5. Keep the initial wedge to routine, clinician-defined cases with a named clinic and a named human escalation route.

That follows YC's advice to launch, talk to users, do things that do not scale, and find the 90/10 solution: [YC Essential Startup Advice](https://www.ycombinator.com/blog/ycs-essential-startup-advice), [Paul Graham: Do Things that Don't Scale](https://www.paulgraham.com/ds.html).

## AI-native engineering model

Pawscript borrows the useful discipline of Steve Yegge's Gas Town rather than copying its infrastructure. Gas Town's local worktrees, daemon, and session model do not fit a GitHub-only build. The repository uses the equivalent durable state: GitHub Issues/PRs, CI, code history, and explicit acceptance criteria.

| Role | Independent lane | Quality gate |
| --- | --- | --- |
| Orchestrator | Splits work into dependency-linked issues | No unbounded work, owner and acceptance tests named |
| Clinician advocate | Pilot interviews and template requirements | Evidence attached to issue |
| Safety reviewer | Medical boundary, escalation, privacy | Vet approval for clinical-content change |
| UX engineer | Intake, review handoff, accessibility, print | Usability and accessibility review |
| Rules engineer | Deterministic compiler and fixtures | Unit tests and no clinical invention |
| QA/red team | Adversarial inputs and deployment checks | CI and visual/API verification |
| Integrator | Merge order and Vercel release | All gates green before main |

Run only 3-5 non-overlapping implementation agents in parallel. Each agent owns one issue/branch, persists its decisions in GitHub, and proves its work with a test or review artifact. See [AGENTS.md](./AGENTS.md). Background: [Yegge's Gas Town introduction](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04), [Gas Town](https://github.com/gastownhall/gastown), and [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c).

## Verification

GitHub Actions runs `npm test` remotely on every push and pull request. No package install is needed for the current zero-dependency implementation.

## Before a production pilot

- Replace generic wording with clinic-authored procedure templates.
- Add authenticated clinic accounts, role-based approval, audit history, encrypted storage, and signed data-processing agreements.
- Obtain veterinary and privacy counsel for target states and actual workflow.
- Add exact clinic contacts, emergency routing, recheck scheduling, and retention controls.
- Test with de-identified data first, then conduct a supervised clinical pilot.

## License

This is an early product prototype. Do not use it for patient care without the required clinician, legal, privacy, and security approvals.

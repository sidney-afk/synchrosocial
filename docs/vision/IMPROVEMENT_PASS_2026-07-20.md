# Enterprise improvement pass — 2026-07-20

> **Status:** proposal for owner ratification. This document changes no current
> state and authorizes no implementation.
>
> **Owner pin P4:** “After the atlas documents current state: the improvement
> pass — company angle and software-craft angle — is it the best we can do?”
>
> **Scope:** quality evaluation, not an accuracy audit. Evidence comes from the
> current Enterprise Atlas and the master documents it routes to. Recommendations
> are public-safe patterns; private client, financial, credential, and personnel
> particulars do not belong here.

## Verdict

The company has built an unusually capable operating system for its size. It is
not yet the best it can be because capability and resilience are distributed
unevenly: software and automation knowledge concentrate in one role; commercial
and client knowledge concentrate in another; much reporting describes work
without reliably steering it; and several recovery arrangements preserve data
without proving that the business can resume.

The software has the same shape. Strong safety work surrounds a high-change core,
but the core remains structurally expensive: a very large single-file application,
an integration hub with broad blast radius, several overlapping data authorities,
and operational state spread across hosted services. The right response is not a
rewrite. It is a staged reduction of concentration, ambiguity, and recovery time.

The highest-value program is therefore **operational independence**: make the
business operable by more than one person, make client outcomes visible early,
and make recovery a demonstrated capability. Modularization and platform
consolidation should support that program, not compete with it.

## Evaluation principles

1. **Remove a failure mode before adding a capability.**
2. **Prove recovery, not merely backup.**
3. **Create one authority per business concept.**
4. **Turn tacit judgment into a bounded playbook, not a giant manual.**
5. **Use software where it shortens a measured loop; do not automate ambiguity.**
6. **Prefer reversible extraction over a rewrite.**

## Ranked improvement register

Effort is the focused implementation burden after owner ratification:
**S** (days), **M** (a few weeks), **L** (multi-phase). Impact is the expected
business leverage: **critical**, **high**, or **medium**.

| Rank | Axis | Finding | Proposed move | Effort | Impact |
|---:|---|---|---|:---:|:---:|
| 1 | Company | The software/automation layer has operational access redundancy but little demonstrated capability redundancy. An outage of its principal operator can become an indefinite business interruption. | Create a **minimum viable operator** program: name a secondary operator, define the ten most consequential interventions, pair through each one, and require quarterly restore/failover drills with evidence. Start with alerts, deployments, workflow disable/restore, credential rotation, and data recovery. | M | Critical |
| 2 | Company | Client acquisition, strategy, approval, and first-hand feedback concentrate in a second role. The business cannot see or relieve that queue systematically. | Instrument the **commercial/client bottleneck**: a weekly exception queue for overdue calls, plans, approvals, and escalations; delegate bounded decisions; record short decision rubrics; and route recurring client feedback into a private categorized ledger. | M | Critical |
| 3 | Company | Results shortfall is the known retention risk, while client health and early value are not governed by a common operating loop. Reporting is more descriptive than decisional. | Establish a **client outcome operating system**: define leading indicators by offer, baseline them at onboarding, run 30/60/90-day checkpoints, assign an owner and next action to every red signal, and review cohort retention privately. Pilot before building software. | M | Critical |
| 4 | Company | Backups exist, but some recovery paths share a provider or have incomplete restore proof. Data preservation and business resumption are being treated as the same thing. | Define recovery objectives by data class; add an independent encrypted destination for irreplaceable assets and critical exports; run sampled restore drills; and record the exact time from incident to usable service. | M | High |
| 5 | Company | The first month is improvised even though it sets expectations and establishes whether the service is working. | Productize a **first-30-days playbook** with milestones, owner/client responsibilities, sample-approval limits, first-value definition, and an explicit rescue path. Measure time-to-first-approved and time-to-first-published. | S | High |
| 6 | Software craft | SyncView’s single-file application makes unrelated change domains share review, regression, and ownership boundaries. Tests reduce risk but do not remove the structural coupling. | Adopt a **strangler modularization** plan: freeze new cross-surface globals, publish module seams, then extract one low-coupling surface at a time behind characterization tests. Preserve URLs, storage keys, and rollback behavior. No ground-up rewrite. | L | High |
| 7 | Software craft | The integration hub remains a broad control plane for sales, delivery, reporting, and monitoring. A platform incident or quota issue crosses business domains. | Partition workflows by business domain and criticality; establish per-domain failure queues, idempotency keys, replay procedures, and an external heartbeat. Continue moving synchronous user writes to narrow owned APIs where the independence plan already justifies it. | L | High |
| 8 | Software craft | Several systems can represent roster, production, metrics, and client state. Compatibility is useful, but unclear authority creates reconciliation work and hidden divergence. | Publish a **data authority matrix** for each business entity and field: system of record, replicas, allowed writers, freshness target, conflict rule, and retirement condition. Make new integrations consume the authority rather than another replica. | M | High |
| 9 | Company | Operating knowledge is documented richly, but business decisions and client learning lack an equally durable private home. Public-repo hygiene also limits useful specificity. | Create a **private management vault** for decision records, client-learning themes, unit economics, vendor ownership, and continuity contacts. Keep the public atlas as the structural index with sanitized conclusions and opaque references only. | S | High |
| 10 | Software craft | Deployments from default branches are fast but couple merge, release, and documentation changes to production timing. | Introduce a release boundary proportionate to each property: immutable build artifacts, protected environments, deploy concurrency control, post-deploy smoke checks, and a one-action rollback to a known artifact. Keep docs-only paths from triggering unnecessary production deploys where hosting permits. | M | Medium |
| 11 | Company | Tool usage and labor allocation are only partially connected to offer value, so simplification and pricing decisions lack a cost-to-serve view. | Build a private quarterly **offer economics scorecard**: delivery hours by role, variable vendor cost, rework, retention, and realized outcome. Use ranges until data quality improves; use it to stop low-value automation and simplify the tool estate. | M | Medium |
| 12 | Software craft | The human+AI operating model is powerful but relies on conventions and a standing reviewer for retrieval, scope, and verification. | Give every substantial change a compact evidence manifest: intent, authority, touched systems, tests, deployment/readback, rollback, and vault deposit. Automate checks for fields a machine can prove; keep semantic ratification human. | S | Medium |

## Why this order

Ranks 1–5 improve continuity, retention, and time-to-value without waiting for a
platform redesign. Ranks 6–8 reduce the engineering tax that makes continuity
hard. Ranks 9–12 make decisions, releases, economics, and AI-assisted work more
durable. Starting with a rewrite would spend the scarcest capability while
leaving the two largest business dependencies intact.

## Recommended 90-day sequence

### Days 0–30 — define and observe

- Name the secondary operator and choose the ten minimum interventions.
- Start the weekly commercial/client exception review.
- Define client-health indicators and the first-30-days milestones.
- Classify data by recovery objective and identify provider-coupled copies.
- Produce the data-authority matrix and choose one extraction candidate.

**Exit evidence:** named owners, first exception review, first health baseline,
one witnessed operator intervention, and one sampled restore.

### Days 31–60 — rehearse and pilot

- Run two secondary-operator drills without the principal operator driving.
- Pilot the first-30-days playbook on a bounded cohort.
- Restore one critical dataset into an isolated environment.
- Add domain-level failure/replay receipts to one critical automation chain.
- Characterize and extract the first low-coupling application module.

**Exit evidence:** drill receipts, measured onboarding lead times, recovery time,
replay proof, and unchanged user behavior around the extracted seam.

### Days 61–90 — decide from evidence

- Compare pilot client health and time-to-value with the prior cohort.
- Expand, revise, or stop the playbook based on outcomes.
- Ratify retirement targets in the authority matrix.
- Choose the next module only if the first extraction reduced change cost.
- Record a private quarterly offer-economics and continuity review.

**Exit evidence:** an owner decision for every pilot, not merely a completion
report.

## Ratification gates

The owner can ratify these independently:

1. **Operational independence** — ranks 1, 2, and 4.
2. **Client outcome system** — ranks 3 and 5.
3. **Architecture evolution** — ranks 6, 7, 8, and 10.
4. **Management memory and economics** — ranks 9 and 11.
5. **AI/session evidence contract** — rank 12.

Ratification should name an owner, a bounded pilot, and a success measure. It
should not authorize a broad rewrite, vendor migration, live-system mutation,
or disclosure of private operating data.

## What “best we can do” would look like

The target is not a perfect stack. It is a company that can keep serving clients
when either principal is unavailable; detects weak outcomes before renewal;
restores critical work from an independent copy within an explicit objective;
knows which system owns each fact; changes one product area without destabilizing
the rest; and turns each AI-assisted intervention into inspectable, reusable
organizational knowledge.

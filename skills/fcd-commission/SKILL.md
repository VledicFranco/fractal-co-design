---
name: fcd-commission
description: >
  Implementation skill with port-freeze pre-check. Before writing any code, verifies that
  all consumed ports are defined and frozen. Two modes: solo (single-agent, single-domain)
  and orchestrated (multi-agent, multi-domain via sub-agents). The ECD addition: a mandatory
  Phase 0 gate that refuses to implement against unfrozen or undefined surfaces.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-commission [task or PRD path]" or "/fcd-commission --orchestrate [PRD path]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[task description or PRD path] [--orchestrate for multi-agent mode]"
fcd-lifecycle: execute
fcd-order: 6
---

# fcd-commission — Implementation with Port-Freeze Pre-Check

> *"Never implement against a surface that hasn't been co-designed."*

Full-lifecycle implementation agent — spec to clean PR. The key FCD addition over forge-commission: **Phase 0 verifies that all consumed ports are defined and frozen before any code is written.** If a surface is missing, the commission stops and routes to `/fcd-surface`.

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

## Two Modes

### Solo Mode (default)
Single-agent implementation within FCA boundaries. One domain, one commission, one PR.

### Orchestrated Mode (`--orchestrate`)
Multi-agent PRD realization. Decomposes PRD into commissions along FCA boundaries, spawns parallel sub-agents, manages shared surfaces between waves.

---

## Phase 0 — Port-Freeze Pre-Check (NEW — the FCD gate)

> This phase does not exist in forge-commission. It is the ECD enforcement point: no implementation starts against an undefined or unfrozen surface.

### 0.1 — Load Task Spec

Read the task description, PRD, or commission card. Extract:
- Which domain this commission operates in
- What ports it consumes (dependencies on other domains)
- What ports it produces (interfaces it exposes)

### 0.2 — Verify Consumed Ports

For each consumed port:

1. **Does the port interface file exist?** Check `ports/` or the project's port directory.
2. **Is there a co-design record?** Check `.method/sessions/fcd-surface-*/record.md` for a frozen record.
3. **Does the gate assertion exist?** Check `architecture.test.ts` for the corresponding G-BOUNDARY assertion.

**Classification:**

| Port Status | Action |
|-------------|--------|
| Interface file exists + frozen record + gate assertion | **PASS** — proceed |
| Interface file exists but no frozen record | **WARN** — proceed with caution, flag for co-design |
| Working dependency exists in code (imports resolve, types exist) but no formal port/record | **WARN-LEGACY** — proceed, add surface formalization to tech debt backlog. This enables incremental FCD adoption on legacy codebases. |
| Interface file exists but unfrozen (status: draft) | **BLOCK** — cannot implement against a draft surface. Route to `/fcd-surface` to freeze. |
| No interface file and no working code dependency | **BLOCK** — surface doesn't exist. Route to `/fcd-surface` to define it. |

### 0.3 — Verify Produced Ports

For each port this commission exposes:

1. Is the interface already defined? (It should be — from Wave 0 or a prior `/fcd-surface` session)
2. If not, produce a minimal interface definition before implementation begins.

### 0.4 — Decision Gate

**If any consumed port is BLOCKED:**
> *"Commission blocked. The following surfaces are not defined or not frozen:*
> *- `{PortName}`: {reason}*
> *Invoke `/fcd-surface {domainA} {domainB}` to define and freeze before proceeding."*

Write a block record to `.method/sessions/fcd-commission-{slug}/blocked.md` listing the blocking surfaces. After `/fcd-surface` completes, re-invoke `/fcd-commission` with the same arguments — Phase 0 detects the block record, re-checks only previously-blocked ports, and resumes if all pass.

**If all ports PASS, WARN, or WARN-LEGACY:**
> *"Port-freeze pre-check passed. {N} consumed ports verified ({W} WARN-LEGACY for formalization backlog). Proceeding with implementation."*

For WARN/WARN-LEGACY ports, note them in the mandate card as tech debt.

**Exit gate (sigma_0):** All consumed ports are defined and frozen (or explicitly warned). No BLOCKED ports remain.

### 0.5 — Session Setup

Create session directory: `.method/sessions/fcd-commission-{slug}/`

Write `mandate.md` with: task spec summary, domain, consumed ports (with status), produced ports, iteration count (0). Read `.method/project-card.yaml` and extract: `build_command`, `test_command`, `lint_command`, essence, delivery rules, layer stack. These determine how Phase B validation and Phase C hygiene are executed.

On resumption: detect existing session, read mandate, continue from last checkpoint.

---

## Phase A — Confidence Raising

> Matches the existing `/com` Phase A. Understand the spec fully before designing.

### A.1 — Inventory

Read all files referenced in the spec. Identify:
- What exists already (files, functions, tests)
- What needs to be created
- What needs to be modified

### A.2 — Cross-Reference

Cross-reference the spec against:
- The port interfaces this commission consumes and produces
- The project's existing domain structure
- Any prior commission work in adjacent domains

### A.3 — Ambiguity Resolution

If the spec has ambiguities, resolve them:
- Check co-design records for surface-level decisions
- Check the PRD for architectural context
- Ask the PO only for genuinely unresolvable ambiguities

### A.4 — Confidence Decision

Rate confidence against these criteria:

| Level | Criteria | Action |
|-------|----------|--------|
| **High** | All consumed ports exist, all referenced files exist, spec has zero ambiguities | Proceed to Phase A+ |
| **Medium** | 1-2 ambiguities resolvable from context, or spec references files that don't exist yet but can be created | Note risks, proceed |
| **Low** | 3+ ambiguities, or consumed ports are WARN-LEGACY, or spec contradicts existing code | Stop, clarify with PO before designing |

**Exit gate (sigma_A):** Spec understood, ambiguities resolved, confidence sufficient.

---

## Phase A+ — Design (FCA-Grounded)

### A+.1 — Scoped Boundary Map

Map only the boundaries this commission touches:
- Which domain directory
- Which port interfaces (consumed and produced)
- Which shared types are imported

### A+.2 — Domain Mapping & Layer Placement

For each new component:
- Which domain? (must match the commission's domain scope)
- Which FCA layer? (L0-L4)
- Co-located with what?

### A+.3 — Design Artifact

Produce a brief design (not a PRD — the PRD already exists):
- File-level plan (what files created/modified)
- Port implementation approach (how consumed ports are injected)
- Verification plan (what tests, what gates)

### A+.4 — FCA Compliance Pre-Check

Before writing code:
- [ ] All consumed ports accessed through injection, not direct imports
- [ ] No cross-domain runtime imports planned
- [ ] No upward layer dependencies planned
- [ ] Shared types imported from canonical package, not redefined locally

**Exit gate (sigma_A+):** Design artifact produced, FCA compliance pre-checked.

---

## Phase B — Implementation Loop

> Bounded by `nu_B` iterations (default: 5).

### B.1 — Per-Task Implementation

For each task in the design:
1. **Orient** — read the target file, understand context
2. **Implement** — write the code, respecting port boundaries. If you write a function
   signature, you write the complete body. No stubs, no TODOs, no placeholder returns.
   If a dependency is missing, escalate to the orchestrator — do not stub it out.
   If you discover a bug in a file you opened, fix it now.
3. **Validate** — run tests, check gates
4. **Record** — note what was done

> *Empirical finding (exp-spl-design): Concrete format examples in prompts produce dramatically better output than abstract instructions alone. When implementing a new domain, follow the project's existing patterns — read an adjacent domain's structure and mirror it. The existing code IS the format example.*

### B.2 — Self-Review

After each implementation chunk:
- Does the code respect the frozen port contracts?
- Are shared types imported, not redefined?
- Are external dependencies accessed through ports?
- Is observability instrumented?

### B.3 — Composition Theorem Check

Per the FCD priority hierarchy, review in this order:
1. **Port compliance** — do we respect the frozen interfaces?
2. **Interface quality** — are our exposed APIs clear and non-leaking?
3. **Architecture quality** — is the internal structure clean?

If Port compliance fails, fix it before touching Architecture. A clean Architecture that violates a frozen port is worse than a messy Architecture that respects it.

### B.4 — Checkpoint & Push

At natural breakpoints:

**Pre-commit completeness check** — before committing, verify:
- [ ] `grep -rn "TODO\|FIXME\|STUB\|placeholder\|not yet implemented" <changed files>` returns no matches in code you wrote
- [ ] Every function signature has a complete body
- [ ] Bugs discovered in files you opened are fixed
If any check fails, fix before committing. Incomplete work must not be checkpointed.

- Commit with descriptive message
- Push to feature branch (create on first push: `feat/{domain}-{short-desc}` for solo mode, or use branch name from commission card for orchestrated mode)
- Update `.method/sessions/fcd-commission-{slug}/mandate.md` with completed tasks and iteration count

### B.6 — Iteration Guard

After each B.1-B.4 cycle, increment the iteration counter. If counter > `nu_B` (default: 5): **STOP.** Present progress to PO with remaining tasks. PO decides: extend (set new `nu_B`), descope (drop remaining tasks), or abort (discard commission). Never silently exceed the iteration bound.

### B.5 — Scope Guard

If implementation reveals the need to:
- **Modify a frozen port** → STOP. This requires a new `/fcd-surface` session. Do not modify the port unilaterally.
- **Add a new cross-domain dependency** → STOP. This needs a port definition. Route to `/fcd-surface`.
- **Create a local type that duplicates a canonical one** → STOP. Import from the shared package.

**Exit gate (sigma_B):** All tasks implemented, all gates passing, no scope violations.

---

## Phase C — Hygiene & Finalization

### C.1 — Gate Re-Verification

Run all architecture gates:
- G-PORT: no direct external deps in domain code
- G-BOUNDARY: no cross-domain runtime imports
- G-LAYER: no upward layer deps
- G-ENTITY: no local redefinitions of canonical types (if applicable)

### C.2 — Algorithmic Gate Checks

> *Empirical finding (exp-spl-design): Simple deterministic checks catch real issues at 100% reliability — no LLM judgment needed. These gates are the "hard floor" that prevents the most common implementation defects.*

Run these checks on all files created or modified by this commission. Each is pass/fail with confidence 1.0:

**G-NO-ANY** — No `any` types in port implementations or domain code:
```bash
grep -rn '\bany\b' {changed files} --include='*.ts' | grep -v '// eslint-disable' | grep -v '\.test\.'
```
Strip comments and string literals before matching. `any` in a port interface defeats typed contracts.

**G-NO-TODOS** — No TODO/FIXME/STUB/placeholder markers in committed code:
```bash
grep -rn '\b\(TODO\|FIXME\|STUB\|HACK\|XXX\)\b' {changed files} --include='*.ts'
```
Case-sensitive — matches `TODO` but not `todo` (which may be a valid domain term like a task state).

**G-PORT-SUBSTANCE** — Port interface files have actual typed members (not empty interfaces):
For each port file, verify at least one method/property with a type annotation exists. An empty `export interface FooPort {}` is not a port — it's a placeholder.

**G-STRUCTURE** — Expected artifacts present per FCA conventions:
- Implementation files exist for the domain
- Port files exist for any produced ports
- Index file re-exports public surface

If any gate fails, fix before proceeding. These are non-negotiable.

Additionally:
- [ ] Observability instrumented (structured logging, correlation IDs)
- [ ] Documentation updated (README, decision records if architectural choices were made)
- [ ] Tests cover the port contract (not just internal logic)

### C.3 — FCA Sweep

Verify co-location:
- Implementation, types, tests, config, docs all within the domain directory
- No files placed in artifact-type directories (`tests/`, `types/` at root)

### C.4 — PR Preparation

- Clean commit history
- PR description references:
  - Commission card or task spec
  - Co-design records for any ports implemented
  - Layer stack card (if new component)
- Request review from domain lead(s) on both sides of any implemented port

**Exit gate (sigma_C):** All gates green, hygiene clean, PR ready.

---

## Orchestrated Mode Additions

When running with `--orchestrate`:

### Wave Management

1. **Wave 0 (mandatory):** Apply all shared surface changes before spawning any implementation commissions.
   - Write port interface files
   - Update shared types package
   - Add gate assertions to architecture test
   - Commit and push Wave 0 as a standalone PR or commit

2. **Per-wave:** Spawn one `/fcd-commission` sub-agent per commission in the wave. Each runs in a worktree. Each has the Phase 0 port-freeze pre-check — which should trivially pass because Wave 0 already defined the surfaces.

3. **Between waves:** Merge completed commissions. Run integration gates. If a surface needs revision, invoke `/fcd-surface` before the next wave.

### Scope Enforcement

Each sub-agent commission has:
- **Allowed paths** — only files within its domain
- **Forbidden paths** — files in other domains (enforced by the orchestrator)
- **Port interfaces** — read-only (the commission consumes but never modifies)

### Mandatory Sub-Agent Prompt Boilerplate

When dispatching a sub-agent, the prompt MUST include the following checklist items if the relevant condition is true. Both prevent specific failure modes that are mechanical to anticipate but easy to miss when assembling the dispatch prompt.

**B-1: Per-component attestation regen** — if the project enforces per-component test attestation (cryptographically signed proofs that test suites passed against a specific tree state — common in monorepos that gate deploys per-app) AND the commission's `allowed_paths` intersect an attested component, the prompt MUST include guidance equivalent to:

> *"After committing your code, regenerate the attestation for the affected component(s) using the project's documented procedure (e.g., `make attest COMPONENT=<name> TESTS=N PASSED=N FAILED=0 SKIPPED=N`). Commit the regen as a separate commit. Attestation generators typically read `git rev-parse HEAD:<path>` for tree hashes, so you MUST commit code first, then attest, then commit the regen — pre-commit attest captures main's pre-change tree and CI fails on tree-hash mismatch."*

Detect by reading the project's CLAUDE.md / CONTRIBUTING for an "attestation" / "attest" rule, or by looking for `.attestations/` (or equivalent) at the repo root. If neither exists, skip B-1.

**B-2: Diff-against-base requires `fetch-depth: 0`** — if the commission adds a CI step that runs `git diff origin/<base>...HEAD` or any equivalent pattern (`git log <base>..HEAD`, `git rev-list <base>..HEAD`), the prompt MUST include:

> *"The default `actions/checkout` clone is shallow (`fetch-depth: 1`). `origin/<base>` does not exist in that ref space, and `git diff origin/<base>...HEAD` fails with 'cannot resolve base ref'. Set `fetch-depth: 0` on the corresponding checkout step. Verify locally with `git fetch --depth=1 && git diff origin/<base>...HEAD` to reproduce the failure mode before pushing."*

These two items are mechanical to apply — the orchestrator runs them as a pre-flight check on every prompt before dispatch:

1. Does the project have a per-component attestation regime AND does `allowed_paths` intersect an attested tree? → include B-1.
2. Does the commission add a CI step that diffs against base? → include B-2.

Skipping either has been observed to add ~10-30 min of post-CI-failure debug time per occurrence. The boilerplate is ~15 lines of prompt; the savings compound over a multi-commission orchestrated session.

---

## Anti-Capitulation Rules

1. **Never implement against an undefined port.** If Phase 0 identifies a missing surface, the commission stops. No exceptions. *"Implementing against an assumption produces coupling that's invisible until integration time."*

2. **Never modify a frozen port unilaterally.** If the implementation requires a port change, invoke `/fcd-surface` with both sides present. *"The port was co-designed. Changing it unilaterally breaks the contract with the other side."*

3. **Never redefine canonical types locally.** Import from the shared types package. *"A local `interface Order` when `@org/types` already defines `Order` is how drift starts."*

4. **Never skip Phase 0 "because it's a small change."** Small changes that cross domain boundaries produce the same category of surface debt as large ones. The pre-check takes 2 minutes. *"The size of the change doesn't determine whether it needs a co-designed surface. The boundary does."*

5. **Port compliance before Architecture quality.** If time is short, ensure port contracts are satisfied before refining internal structure. *"A clean Architecture behind a broken port is net-negative for the system."*

6. **Never allow "temporary" boundary violations.** A "temporary" cross-domain import is a permanent coupling with a TODO comment. If the import crosses a domain boundary, it needs a port. No exceptions for time pressure. *"There is no such thing as a temporary boundary violation."*

7. **Never leave stubs or TODOs.** Every function you write must be fully implemented. If you write a function signature, you write the body. If you can't implement it, don't write the signature — escalate instead. The only exception is when the human EXPLICITLY asks for a stub. *"A stub is a lie to the compiler. It says 'this works' when it doesn't."*

8. **Never defer bugs you discover.** If you encounter a bug in code you're working with — in any file you opened for this commission — fix it. Do not classify it as "out of scope" and move on. Bugs in files you touched are your bugs. *"If you saw it and you're in the file, it's your responsibility."*

9. **Never leave PRs unmerged (orchestrated mode).** When orchestrating, merge each commission's PR as soon as it passes scope verification and CI. Do not accumulate floating PRs. Do not proceed to the next wave with unmerged PRs from the current wave. If human approval is needed, stop and ask. *"A floating PR is technical debt accruing interest."*

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation — behavioral discipline and reference |
| `fcd-surface` | Invoked by Phase 0 when consumed ports are missing or unfrozen |
| `fcd-card` | Cards are prerequisites — new components need cards before commissions |
| `fcd-design` | PRDs from fcd-design are the input for orchestrated mode |
| `fcd-plan` | Plans from fcd-plan define the commission cards and wave structure |
| `fcd-review` | Downstream — reviews check port compliance and surface integrity |
| `fcd-health` | Post-commission health check to verify domain completeness (planned) |

**Lifecycle position:**

```
... ──→ fcd-plan ──→ [fcd-commission] ──→ fcd-review ──→ ...
```

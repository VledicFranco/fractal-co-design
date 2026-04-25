---
title: "FCA Advice: Recursive Semantic Algorithms"
scope: fractal-component-architecture/advice
status: draft
evidence_tier: Theoretical — derived from FCA self-similarity + F1-FTH methodology formalism. No empirical validation yet.
origin: Design session (2026-04-02), synthesis of FCA recursion, ECD co-design, and F1-FTH formal methodology theory
---

# Recursive Semantic Algorithms

Guidance for using FCA's self-similar level structure as the **recursion scheme** for
LLM agent decomposition — scoping one agent to one FCA level, with the same prompt
template instantiated at every level, producing context-efficient semantic computation
that is logarithmic in codebase size.

## Domain Context

LLM agents operating on real codebases face a fundamental resource constraint: the
context window. A single agent trying to design, implement, or explore a large system
must load the entire structure into context — or make ad-hoc decisions about what to
skip. This produces either context saturation (quality degrades as context fills) or
context starvation (agent misses critical information it didn't load).

FCA's self-similar structure offers a different approach. Because the component pattern
repeats identically at every level (L0–L5), the *algorithm* for operating on a component
is the same at every level. The only thing that changes is the concrete artifacts:

| Level | Interface artifact | Port artifact | Documentation artifact |
|-------|-------------------|---------------|----------------------|
| L0 | Type signature | Function parameter | JSDoc |
| L1 | Exported symbols | Constructor injection | Module comment |
| L2 | `index.ts` re-exports | Provider interface | `README.md` |
| L3 | `package.json` + public API | Exported provider | `documentation/` |
| L4 | HTTP endpoints / OpenAPI | HTTP client, env vars | API docs |
| L5 | Public SDK | API gateway, OAuth | Developer portal |

The artifacts change. The structural roles don't. This is the property that makes
FCA a valid recursion scheme for agent decomposition.

**The core insight:** Just as functional programming uses list recursion to scope
algorithms to `(head, tail)` — never needing the full list in memory — FCA recursion
scopes each agent to `(this_level, ports_to_adjacent)` — never needing the full
codebase in context.

> **Connection to F1-FTH:** This is a methodology Φ whose domain theory D_Φ has
> FCA levels as sorts, whose transition function δ_Φ routes by level, and whose
> methods M are parameterized by level. The recursion is domain retraction
> (F1-FTH Definition 9): a step at level N embeds into a method at level N-1,
> executes, and projects the result back up.

---

## The Recursion Scheme

### Two Axes

FCA components compose in two directions, producing two recursion axes:

**Deep recursion (architecture decomposition):**
A component at level N has its Architecture composed of components at level N-1.
The agent at level N defines the N-1 sub-components, then spawns a sub-agent for
each one.

```
agent@L3 (package)
  ├── agent@L2 (domain-A)
  │     ├── agent@L1 (module-X)
  │     │     └── agent@L0 (functions) ← base case
  │     └── agent@L1 (module-Y)
  └── agent@L2 (domain-B)
        └── ...
```

**Lateral recursion (port composition):**
When component A at level N needs component B at the same level, the parent defines
the Port between them, mocks B's interface, gives A the mock, and spawns a separate
agent to implement B against the frozen Port.

```
agent@L3 defines Port(domain-A ↔ domain-B)
  ├── agent@L2(domain-A) implements against Port (has mock of B)
  └── agent@L2(domain-B) implements Port's interface (+ its own deep recursion)
```

**The parent IS the co-design event.** The parent agent holds the context of all
sibling sub-components — it is the only entity that sees both sides of a Port. The
parent defines and freezes the Port before spawning sub-agents. This satisfies ECD
Rule 3 (both sides present) because the parent represents both sides.

### Base Case

At L0 (pure functions), there is nothing to recurse into. The agent reads the type
signature (Interface), implements the function body (Architecture), and returns. No
sub-agents spawned. This is clean because FCA's boundary at L0 is total — a pure
function's type signature IS its complete interface.

**Size threshold optimization:** At L1 (module with 2-3 functions), spawning L0
sub-agents per function is overhead. The recursion should inline when the sub-level
is small enough for the current agent to handle directly — like switching from
recursive to iterative sort for small arrays.

### Template

Every agent at every level executes the same template:

```
receive(level_context, port_contracts, constraints)

1. READ    — this level's context (README, existing ports, parent's contract)
2. DEFINE  — this level's documentation-as-design (draft)
3. SURFACE — interface + ports to sub-components (Tier 1: definitional)
4. MOCK    — architecture skeleton with stubs (Tier 2: structural)
5. VERIFY  — ports compose correctly with mocks (gate before spawning)
6. SPAWN   — N sub-agents for N sub-components (recurse deep + lateral)
7. COLLECT — sub-agent results
8. VERIFY  — composition of real results against ports (gate before returning)
9. REPORT  — structured output to parent (data + truths)
```

Steps 1-5 are the **downward phase** (design + decompose).
Steps 6-8 are the **recursive phase** (delegate + verify).
Step 9 is the **upward phase** (report).

> **F1-FTH mapping:** Each numbered step is a step σ with pre_σ and post_σ.
> The template is a step DAG Γ (Definition 5). The whole template is a
> method M (Definition 6) parameterized by FCA level. The level-routing
> is a methodology Φ whose δ_Φ selects the method based on current level.

---

## Prompt Templates as Typed Functions

### The Problem

Current LLM agent prompts are unstructured text. They work, but they don't compose.
You can't type-check a prompt. You can't verify that one agent's output satisfies
another agent's input requirements. You can't state invariants that must hold across
a recursion. Every agent is a bespoke program.

### The Proposal

A **prompt template** is a typed function in a semantic programming language:

```
PromptTemplate<Input, Output, Constraints, Truths>
```

Where:
- **Input** — typed data schema (what the agent receives)
- **Output** — typed data schema (what the agent must produce)
- **Constraints** — invariants that must hold during execution
- **Truths** — postconditions proven by execution (quality gates)

This is not metaphorical. Each component has a concrete structure:

### Data Section (Types)

Defines the input and output schemas. These are the "types" of the semantic function.

```yaml
data:
  input:
    level: enum[L0, L1, L2, L3, L4, L5]
    context:
      readme: string              # This level's README content
      ports: list[PortDefinition] # Frozen ports from parent
      constraints: list[string]   # Cross-cutting requirements from parent
    parent_contract:
      interface: TypeDefinition   # What parent expects this component to expose
      postconditions: list[Predicate]
  output:
    documentation: string         # Draft docs for this level (the design artifact)
    interfaces_defined: list[TypeDefinition]
    ports_defined: list[PortDefinition]
    sub_components: list[SubComponentSpec]
    truths: list[Predicate]       # Proven postconditions
    status: enum[complete, needs_revision, blocked]
```

### Protocol Section (Behavioral Rules)

Defines the execution protocol — what the agent does with the data. In FP terms,
functions are data; in prompt templates, protocols are the "function body" of the
semantic function. They are expressed as structured instructions, not free-form text.

```yaml
protocol:
  phases:
    - name: read
      action: "Load level_context. Identify existing artifacts."
      postcondition: "All referenced files read. No assumptions about unread files."

    - name: define
      action: "Write documentation as if component is already implemented. Label DRAFT."
      postcondition: "Documentation artifact exists. All sub-components named."
      artifacts:
        - path: "{component_dir}/README.md"  # L2
        - path: "{module_file}"              # L1 — JSDoc comments
        - path: "{function_file}"            # L0 — type signatures

    - name: surface
      action: "Define typed interfaces and ports for each sub-component."
      postcondition: "Every sub-component has a typed interface. Every cross-component interaction has a port."
      ecd_rule: "Both sides of every port are represented (parent holds both sides)."

    - name: mock
      action: "Create stub implementations for all sub-components."
      postcondition: "Stubs satisfy the defined interfaces. Composition compiles."

    - name: verify
      action: "Type-check mocks against interfaces. Run gate tests."
      postcondition: "All mocks satisfy port contracts. G-PORT, G-BOUNDARY pass."
      gate: true  # Must pass before spawning sub-agents

    - name: spawn
      action: "For each sub-component, instantiate this template at level N-1."
      recursion: deep
      base_case: "level == L0 or sub_component_size < threshold"

    - name: collect_and_verify
      action: "Replace mocks with real implementations. Verify composition."
      postcondition: "All port contracts satisfied with real implementations."
      gate: true  # Must pass before reporting to parent

    - name: report
      action: "Return (output_data, proven_truths) to parent."
      postcondition: "parent_contract.postconditions all satisfied."
```

### Invariant Section (What Must Hold at Every Level)

These propagate downward through the recursion — like the accumulator in a fold.
They are constraints inherited from the parent plus level-specific additions.

```yaml
invariants:
  inherited:
    - "All cross-domain imports go through ports (G-PORT)"
    - "No circular dependencies in the component DAG"
    - "Shared types use canonical definitions (G-ENTITY)"
  level_specific:
    L3: "Every domain has a README.md with frontmatter"
    L2: "Every module re-exports through index.ts"
    L1: "Every exported function has JSDoc"
    L0: "Functions are pure (no side effects without Effect type)"
```

### Gate Section (Preconditions for Recursion Boundaries)

Gates are checked at two points:
1. **Before spawning** — verify the decomposition is correct
2. **Before returning** — verify the composition satisfies the parent's contract

```yaml
gates:
  pre_spawn:
    - "All sub-component interfaces are typed and frozen"
    - "Mock implementations satisfy port contracts"
    - "No sub-component exceeds the size threshold for its level"
  pre_return:
    - "All sub-agent outputs satisfy their port contracts"
    - "Composition of real implementations passes gate tests"
    - "parent_contract.postconditions are satisfied"
    - "No BLOCKED sub-components remain"
```

> **F1-FTH mapping:**
> - Data section = domain theory D (sorts + function symbols)
> - Protocol section = step DAG Γ (ordered steps with pre/post)
> - Invariant section = axioms Ax in the domain theory
> - Gate section = pre_σ and post_σ on the spawn/return steps
> - The whole template = method M = (D, Roles, Γ, O, μ⃗) parameterized by level

---

## Semantic vs Algorithmic Execution

Each step in the protocol has an execution mode:

| Mode | What it means | F1-FTH analog |
|------|--------------|---------------|
| **Algorithmic** | Deterministic code. Type-checking, file operations, gate tests, mock generation. | Script execution (TypeScript) |
| **Semantic** | LLM-computed. Design decisions, documentation writing, domain reasoning, port negotiation. | Agent execution (guidance_σ) |

The recursion template has both:

```
1. READ       — algorithmic (file I/O)
2. DEFINE     — semantic (write documentation as design)
3. SURFACE    — semantic (define interfaces) → algorithmic (type-check them)
4. MOCK       — algorithmic (generate stubs from interfaces)
5. VERIFY     — algorithmic (run gate tests)
6. SPAWN      — algorithmic (instantiate sub-agents)
7. COLLECT    — algorithmic (gather results)
8. VERIFY     — algorithmic (run composition gates)
9. REPORT     — algorithmic (structured output)
```

Steps 2 and 3 are the only semantic steps — where the LLM's judgment matters.
Everything else is deterministic. This means the "semantic surface area" of each
recursive call is small and bounded — most of the work is mechanical.

**Implication for reliability:** The semantic steps produce artifacts (documentation,
type definitions) that are then verified by algorithmic steps (type-checking, gate
tests). The verification is deterministic. This means each recursion level has a
**deterministic quality floor** — even if the semantic steps are imperfect, the
algorithmic gates catch violations before they propagate.

> **Connection to multiagent advice (01):** The probabilistic compliance issue
> (Interface compliance is statistical, not binary) is mitigated by the algorithmic
> gates. The semantic steps may produce imperfect output, but the gates are
> deterministic. Composition reliability is: `Pr[semantic_correct] * 1.0[gate_correct]`
> rather than `Pr[step1] * Pr[step2] * ... * Pr[stepN]`.

---

## State and Coordination

### Recursion State as Files

Each recursive call produces artifacts at its level. These serve as both the
**output** of that call and the **state** for resumption if interrupted:

| Level | State artifacts |
|-------|----------------|
| L3 | `documentation/README.md` (DRAFT), `ports/*.ts`, `package.json` |
| L2 | `{domain}/README.md` (DRAFT), `{domain}/index.ts` |
| L1 | Module file with JSDoc (DRAFT), exported type signatures |
| L0 | Function signatures with JSDoc (DRAFT) |

Because FCA co-locates everything, the state of the recursion IS the codebase
in its partially-designed state. A "DRAFT" label on a README means "this level
has been designed but not yet implemented by sub-agents." Removing "DRAFT" means
"sub-agents completed and composition verified."

### Coordination via `.method/algo/`

For cross-cutting coordination state that doesn't belong in source files:

```
.method/algo/{algorithm-run-id}/
  manifest.yaml          # Algorithm type, root level, parameters, status
  tree.yaml              # The recursion tree — which agents spawned which
  constraints.yaml       # Inherited constraints propagating downward
  L3/
    {package}/
      status.yaml        # This node's status (designing, spawning, collecting, done)
      ports-frozen.yaml  # Frozen port definitions for this level
      sub-agents.yaml    # Sub-agent IDs and their target sub-components
  L2/
    {domain}/
      status.yaml
      ports-frozen.yaml
      ...
```

This directory is the **call stack** of the recursion. Each YAML file is a
stack frame. The tree structure mirrors the FCA component tree. Any agent can
resume from any point by reading its node's status and the frozen ports.

### Report Templates

Sub-agents report back to parents using a structured template:

```yaml
report:
  agent_id: "{id}"
  level: L2
  component: "sessions"
  status: complete | needs_revision | blocked
  data:
    files_created: [...]
    files_modified: [...]
    interfaces_implemented: [...]
  truths:
    - predicate: "All exported functions have JSDoc"
      verified: true
      method: algorithmic  # gate test
    - predicate: "Session lifecycle handles all state transitions"
      verified: true
      method: semantic     # LLM judgment — lower confidence
  issues:
    - type: port_revision_needed
      port: "SessionStoragePort"
      reason: "Port assumes synchronous writes but domain requires async"
      severity: blocking
  metrics:
    context_tokens_used: 12400
    sub_agents_spawned: 3
    gates_passed: 7
    gates_failed: 0
```

The report is both **data** (what was done) and **truths** (what was proven).
The parent can distinguish algorithmic truths (high confidence — gate tests) from
semantic truths (variable confidence — LLM judgment).

---

## The Algorithm Family

The recursion scheme is fixed. The body function varies. This produces a family
of semantic algorithms — all sharing the same recursive skeleton, differing in
what each level does:

### `explore(component) → summary`

Navigate the FCA tree to find or understand something.

```
At each level:
  1. Read this level's README (progressive disclosure — Principle 10)
  2. Summarize what this level contains
  3. Decide which children are relevant to the query
  4. Recurse into only the relevant children
  5. Synthesize child summaries into level summary
  6. Report to parent
```

**Complexity:** O(d × b_relevant) where d = depth (≤ 6) and b_relevant = relevant
branching factor at each level. For targeted searches, b_relevant ≈ 1-2, making
this effectively O(d) — constant in codebase size.

### `design(component) → (draft_docs, port_definitions)`

Design a component by writing its documentation as if already implemented.

```
At each level:
  1. Read existing context
  2. Write this level's documentation (DRAFT) — the PRD IS the documentation
  3. Define typed ports to sub-components
  4. Mock sub-component architecture (stubs)
  5. Verify mocks satisfy ports (gate)
  6. Spawn sub-agents for each sub-component (recurse)
  7. Collect sub-designs
  8. Verify composition
  9. Report (draft_docs, port_definitions, truths)
```

**Key insight:** The design artifact IS the future documentation, co-located per
Principle 8. Removing "DRAFT" labels is the only step between design and shipped docs.

### `implement(component) → (code, test_results)`

Implement against existing port contracts (from a prior `design` pass or `fcd-surface`).

```
At each level:
  1. Read port contracts (frozen — from design phase or .method/algo/)
  2. Implement this level's code against the contracts
  3. Write co-located tests
  4. Run tests (gate)
  5. Spawn sub-agents for sub-component implementation (recurse)
  6. Collect implementations
  7. Run integration gate tests
  8. Report (code, test_results, truths)
```

### `review(component) → (findings, action_plan)`

Review following composition theorem priority: ports first, interfaces second,
architecture third.

```
At each level:
  1. Read co-design records and frozen ports
  2. Check port compliance (Priority 1 — multiplicative)
  3. Check interface quality (Priority 2 — multiplicative)
  4. Check architecture quality (Priority 3 — additive)
  5. Recurse into children with findings (only children with issues)
  6. Collect child findings
  7. Synthesize into prioritized action plan
  8. Report (findings, action_plan)
```

### `verify(component) → (pass/fail, coverage)`

Run verification at every level, recursively.

```
At each level:
  1. Run this level's co-located tests
  2. Run this level's gate tests (G-PORT, G-BOUNDARY, G-LAYER)
  3. Spawn sub-agents for sub-component verification (recurse)
  4. Collect results
  5. Report (pass/fail, coverage, failed_gates)
```

### The Generalization

All five algorithms are instances of `foldTree`:

```
foldTree : (LevelContext → [ChildResult] → Result) → FCATree → Result
```

The combining function changes. The recursion scheme is fixed. New algorithms
can be defined by providing a new combining function without touching the
recursion machinery.

---

## Toward a Semantic Programming Language

### The Observation

The pattern above — typed inputs, typed outputs, invariants, gates, algorithmic
vs semantic steps, recursive composition — is a programming language. Not a
general-purpose one, but a domain-specific language for orchestrating LLM agents
over structured codebases.

### Types

**Data types** define the schemas that flow between agents:

```
type PortDefinition = {
  name: string,
  owner: DomainId,
  interface: TypeDefinition,
  producer: ComponentRef,
  consumer: ComponentRef,
  status: frozen | draft
}

type ComponentSpec = {
  level: FCALevel,
  domain: string,
  interfaces: list[TypeDefinition],
  ports: list[PortDefinition],
  documentation: string
}

type AgentResult<T> = {
  data: T,
  truths: list[{ predicate: Predicate, verified: bool, method: semantic | algorithmic }],
  status: complete | needs_revision | blocked
}
```

### Functions (Semantic Functions)

A **semantic function** is a prompt template that receives typed data, produces
typed output, and also returns truths (proven postconditions):

```
semantic_function : Input → AgentResult<Output>
```

Unlike algorithmic functions which return only data, semantic functions return
`(data, truths)`. The truths are postconditions that the agent asserts hold after
execution. Some truths are algorithmically verified (gate tests — high confidence).
Some are semantically verified (LLM judgment — variable confidence).

### Composition

Semantic functions compose like methods in F1-FTH:

**Sequential (M ; M'):** Output of f feeds input of g. Requires interface retraction
(C1 condition): f's output type must embed into g's input type.

**Recursive (domain retraction):** A semantic function at level N can embed a step
into a method at level N-1 (spawn sub-agent), execute it, and project the result
back up. This is the FCA recursion.

**Parallel (spawn N):** When sub-components are independent (no shared ports), their
semantic functions run in parallel. The parent collects results. This is safe because
FCA guarantees: domains that communicate only through ports can be implemented in
parallel without coordination overhead.

### Invariant Propagation

Invariants flow downward through the recursion — like an accumulator in a fold:

```
spawn(child, child_context, child_ports, parent_invariants + level_invariants)
```

Each child inherits all parent invariants plus any level-specific additions. A child
cannot weaken an inherited invariant. This ensures cross-cutting concerns (correlation
IDs, error handling conventions, security requirements) propagate automatically.

### Confidence Tracking

Because semantic functions are probabilistic, composition must track confidence:

```
type Truth = {
  predicate: Predicate,
  confidence: float,       # 1.0 for algorithmic, < 1.0 for semantic
  method: algorithmic | semantic
}
```

Algorithmic truths (gate tests) have confidence 1.0. Semantic truths (LLM judgment)
have confidence < 1.0. The parent can compute composition confidence:

- Sequential: multiply confidences
- Parallel: independent
- Verified by gate: confidence elevated to 1.0

This means **gates are confidence amplifiers** — they convert semantic (probabilistic)
truths into algorithmic (deterministic) ones. The more gates in the recursion, the
higher the end-to-end reliability.

### Semantic vs Algorithmic Partitioning

A program in this language has two parts:

| Part | Executed by | Properties |
|------|-----------|------------|
| **Algorithmic** | Deterministic code (TypeScript, shell) | Repeatable, verifiable, fast |
| **Semantic** | LLM agent (prompt template instantiation) | Creative, judgment-based, probabilistic |

The language's type system distinguishes them. A semantic function that claims to
return an algorithmic truth is a type error — you can't claim deterministic confidence
from probabilistic execution. An algorithmic function that performs semantic work
(calls an LLM) is also a type error — it should be typed as semantic.

This distinction is operationally important: when optimizing or debugging a recursive
algorithm, you know exactly which steps are deterministic (check the code) and which
are probabilistic (check the prompt template and the LLM's output).

---

## Connection to Methodology Formalism

This proposal is a specific instantiation of the F1-FTH framework:

| F1-FTH Concept | Instantiation |
|----------------|--------------|
| Domain Theory D | FCA level schemas (what artifacts exist at each level) |
| Sorts | FCA levels: L0, L1, L2, L3, L4, L5 |
| Axioms Ax | FCA principles (10) + ECD rules + inherited invariants |
| Role ρ | The recursive agent at a given level |
| Step σ | Each phase of the template (READ, DEFINE, SURFACE, ...) |
| Step DAG Γ | The template's phase ordering (with gates as edges) |
| Objective O | Parent's contract (what this level must produce) |
| Measures μ⃗ | Truths proven, gates passed, confidence score |
| Method M | The template instantiated at a specific level |
| Methodology Φ | The level-routing function: δ_Φ selects method by FCA level |
| Domain Retraction | FCA level transition: embed step at L_N into method at L_{N-1} |
| Hoare State Monad | `AgentResult<T>` = (data: T, truths: [...]) = HST[pre, post] |

The methodology coalgebra Φ = (D_Φ, δ_Φ, O_Φ) becomes:

- **D_Φ** = the FCA domain theory (levels, artifacts, principles)
- **δ_Φ** = route by level: if L0 → base case; if L1-L5 → instantiate template at this level
- **O_Φ** = root component fully designed/implemented/reviewed with all gates passing

The transition function δ_Φ has one arm per algorithm in the family (explore, design,
implement, review, verify), selected by the initial invocation. Within each arm, the
method is the same template parameterized by level.

---

## Open Questions

### 1. What is the right serialization for prompt templates?

Options: YAML (readable, schemaless), XML (structured, validated), TypeScript types
(compile-time checked), or a custom DSL. The F1-FTH Prompt<A> algebra uses TypeScript.
The `.method/algo/` state files use YAML. Should the template definition itself be
YAML, TypeScript, or something new?

**Consideration:** YAML is good for data (state files, port definitions). TypeScript is
good for behavior (the existing Prompt<A> functor). The template has both data and
behavior. A hybrid may be natural: YAML for the data/invariant/gate sections, TypeScript
for the protocol/execution sections.

### 2. What is the right threshold for inlining vs spawning?

At what size does a sub-component warrant its own sub-agent vs being handled inline by
the parent? Too low → excessive agent overhead. Too high → context saturation. The
threshold likely depends on the algorithm (explore has lower threshold than implement)
and the level (L0-L1 should almost always inline).

### 3. How does revision cascade work?

When a sub-agent discovers that a parent-defined port can't be implemented as specified,
it must signal the parent for revision. The parent then re-co-designs the port (possibly
affecting sibling agents) and re-spawns. What's the protocol? How many revision rounds
before escalating to the human?

**F1-FTH pointer:** This may map to the methodology's termination certificate ν_Φ —
the recursion must provably terminate, and revision cascades need bounds.

### 4. Does this generalize beyond FCA?

FCA is one recursion scheme (self-similar components at 6 levels). Other recursive
structures (ASTs, organizational hierarchies, document outlines) might support the
same pattern. Is the "one agent per node, same template, recursive spawning" approach
general, or does it depend on FCA-specific properties (co-location, boundary enforcement,
port discipline)?

### 5. Parallel composition of methods

F1-FTH explicitly blocks parallel method composition (F.005-MCOM, open problem P4).
But this proposal spawns sub-agents in parallel. The resolution may be that parallel
sub-agents are independent methods (no shared state) composed by the parent — which
is not parallel method composition but rather parallel execution of independent methods
followed by sequential integration at the parent level.

### 6. What constitutes a "semantic truth"?

When an LLM asserts "this documentation accurately describes the component," what's
the confidence? How do you measure it? The formal theory needs an operationalization
of semantic truth that distinguishes it from algorithmic truth without collapsing into
"everything the LLM says is uncertain."

**Pointer:** The multiagent advice (01) discusses statistical verification harnesses
for probabilistic interface compliance. The same approach may apply: run N trials
over a corpus, compute confidence intervals.

---
name: mine.research
description: "Use when the user says: \"research adding X\", \"feasibility study\", \"evaluate approach\", or wants a focused investigation before committing. Dispatches the researcher agent for codebase investigation and presents a structured brief."
user-invocable: true
---

# Research

Deep investigation of a codebase to evaluate a proposed change, new pattern, or architectural direction. Heavy on questions — surfaces what the user truly needs, not just what they initially say. Produces a structured research brief.

## How This Differs From Other Skills

| Skill | Question it answers |
|-------|-------------------|
| **`/mine.research`** | **"What would it take to do X in this codebase?"** |
| `/mine.design` | "How should we build X?" |

Research comes **before** design docs and plans. It's the investigation that makes those possible.

## Arguments

$ARGUMENTS — the proposal to investigate. Can be:
- A change proposal: `/research "add SQLite database and command pattern"`
- A technology question: `/research "should we use SQLAlchemy or raw sqlite3?"`
- A pattern evaluation: `/research "would event sourcing work here?"`
- A migration question: `/research "what would it take to move from files to a database?"`
- A broad direction: `/research "this app needs persistent state — what are our options?"`
- Empty: ask the user what they're considering

## Phase 1: Understand the Ask

**Do not start exploring the codebase yet.** First, understand what the user actually wants and why.

### Initial questions

Use `AskUserQuestion` to probe motivation, constraints, and prior thinking. Ask **2-3 questions** in a single call (multi-question, not multi-select).

The goal is to distinguish between:
- "I've decided to do X, tell me how" vs. "I'm considering X, help me decide"
- "I want specifically SQLite" vs. "I need persistence and SQLite is one option"
- "This is urgent and I want to ship it this week" vs. "This is exploratory"

Example opening questions — **adapt the Motivation options to match the proposal's domain**. The snippets below are items within the `AskUserQuestion: questions:` array. They show how the structure varies across different types of proposals:

**Persistence/data layer proposal** (e.g., "add a database"):
```
    - question: "What's driving this change?"
      header: "Motivation"
      options:
        - label: "Data is getting lost"
          description: "State doesn't survive restarts, crashes, or context switches"
        - label: "Growing complexity"
          description: "In-memory data structures are getting unwieldy"
        - label: "New feature needs it"
          description: "A planned feature requires persistent or queryable data"
```

**Architecture/pattern proposal** (e.g., "should we adopt a monorepo?"):
```
    - question: "What's driving this change?"
      header: "Motivation"
      options:
        - label: "Coordination overhead"
          description: "Cross-repo changes are painful — too many PRs, broken integrations"
        - label: "Inconsistent standards"
          description: "Each repo drifts on tooling, linting, testing conventions"
        - label: "Deployment coupling"
          description: "Services need to ship together but repos make that hard"
```

**Technology choice proposal** (e.g., "switch from REST to GraphQL"):
```
    - question: "What's driving this change?"
      header: "Motivation"
      options:
        - label: "Over-fetching / under-fetching"
          description: "Clients need data from multiple endpoints or get too much back"
        - label: "API evolution pain"
          description: "Adding fields or endpoints is getting fragile"
        - label: "Developer experience"
          description: "The current API is hard to work with or document"
```

The **Flexibility** question is consistent across all proposals:
```
    - question: "How committed are you to the specific approach mentioned, vs. open to alternatives?"
      header: "Flexibility"
      options:
        - label: "Exploring options"
          description: "I mentioned one idea but I'm open to whatever works best"
        - label: "Leaning this way"
          description: "I have a preference but could be convinced otherwise"
        - label: "Decided"
          description: "I've already thought this through — I want to know how, not whether"
```

Generate domain-appropriate Motivation options based on the user's proposal — the examples above are illustrations, not templates. If the user mentioned multiple things (e.g., "SQLite + command pattern"), ask whether those are linked or separable. If the proposal is vague, ask more. If it's specific, ask fewer.

### Follow-up questions

Based on the answers, ask **1-2 targeted follow-ups** to fill in gaps:
- Scope: "Should this cover all data in the app, or just [specific area]?"
- Constraints: "Any hard requirements — must be zero-dependency, must work offline, must be reversible?"
- Timeline: "Is this something you want to prototype now, or plan carefully for later?"
- Experience: "Have you used [proposed technology] before, or would this be new territory?"

**Do not ask more than 2 rounds of questions before moving to Phase 2.** If you still have uncertainties, note them as open questions to revisit after seeing the code.

## Phase 2: Investigate

Dispatch the research to a `researcher` agent. This runs the heavy codebase exploration, web research, and synthesis outside the main context window.

1. Run `get-skill-tmpdir mine-research` to get a temp directory.
2. Determine the **research depth** from Phase 1 answers:
   - **Quick** — user said "Decided" + narrow scope (single module or specific technology question). Use 2 Explore subagents, focus on feasibility of the chosen approach.
   - **Normal** (default) — user said "Leaning" or moderate scope. Use 3-4 Explore subagents.
   - **Deep** — user said "Exploring" + broad scope (architecture, migration, multiple systems). Use 4 Explore subagents + web research.
   - **If scope is unclear** from Phase 1 answers, default to **Normal** regardless of Flexibility.
3. Launch `Agent(subagent_type: "researcher")` with a prompt containing:
   - The proposal (from $ARGUMENTS or user input)
   - The user's answers from Phase 1 (motivation, flexibility, constraints) — use the caller prompt checklist format from `researcher.md`
   - Depth: `<quick|normal|deep>`
   - Output file path: `<tmpdir>/brief.md`
4. After the agent completes, **verify the output**: read `<tmpdir>/brief.md` and check that it exists and contains the `# Research Brief:` header. If the file is missing, empty, or lacks the expected header, inform the user that the research agent failed to produce a complete brief and offer:
   - Retry the researcher agent
   - Proceed with a manual investigation in the main context window

## Phase 3: Present & Discuss

### Ask where to save

Research briefs are forward-looking — they evaluate a proposed change before committing to an approach. They may feed into a design doc (when a direction is chosen) or be abandoned (if the approach is rejected).

The recommended convention is a date-stamped topic directory under `design/research/`:

```
design/research/
└── YYYY-MM-DD-topic-name/
    ├── research.md           Main research brief
    ├── prereq-01-name.md     Prerequisite breakdowns (if applicable)
    └── ...                   Additional artifacts
```

```
AskUserQuestion:
  question: "Where should I save the research brief?"
  header: "Output"
  multiSelect: false
  options:
    - label: "design/research/ (Recommended)"
      description: "Save as design/research/YYYY-MM-DD-<topic>/research.md — with room for prereq breakdowns"
    - label: "docs/research/"
      description: "Save as docs/research/YYYY-MM-DD-<topic>.md"
    - label: "Just show me"
      description: "Display in the conversation, don't save a file"
```

Create the `design/research/` directory if it doesn't exist. If the project already has research in `docs/`, follow the existing convention.

**Copy** (never move) the brief from the temp file to the user's chosen location, or display it inline if they chose "Just show me". The tmpdir copy must always remain intact — downstream challenge and design handoffs reference it.

After the save step, set `<research_brief_path>`:
- If saved to a permanent location: `<research_brief_path>` = the saved file path
- If "Just show me": `<research_brief_path>` = `<tmpdir>/brief.md`

Present the key findings conversationally and ask what the user wants to do next.

```
AskUserQuestion:
  question: "Research is done. What would you like to do next?"
  header: "Next step"
  multiSelect: false
  options:
    - label: "Challenge these findings first"
      description: "Run /mine.challenge on the research brief before committing to a direction"
    - label: "Design it (/mine.design)"
      description: "Formalize findings into a design doc — the research brief will be passed as prior work"
    - label: "Build it (/mine.build)"
      description: "Skip design — route straight to implementation"
    - label: "I need to think about it"
      description: "The brief has what I need — I'll come back when I'm ready"
```

If "Challenge these findings first" is selected: invoke `/mine.challenge --mode=passthrough --target-type=research <research_brief_path>`. After challenge completes, loop back to this gate.

If "Design it (/mine.design)" is selected: invoke `/mine.design` and pass `<research_brief_path>` so mine.design can use it as prior work and skip its own researcher dispatch.

If "Build it (/mine.build)" is selected: invoke `/mine.build` with context: "Prior research brief available at `<research_brief_path>`." This ensures mine.build's prior-analysis detection fires reliably.

## Principles

1. **Questions before code** — understand motivation and constraints before exploring the codebase. The user's first description of what they want is almost never the full picture.
2. **Options, not prescriptions** — present trade-offs honestly. Include a "do less" option when the proposal is ambitious. The user decides, you inform.
3. **Feeds forward** — the research brief should contain everything needed to write a design doc or create an implementation plan. No redundant investigation later.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I have extensive prior analysis — skip research" | Prior analysis covers the problem space. Research covers the solution space — competing approaches, existing patterns in the codebase, API constraints. They answer different questions. Skipping research has led to shipping with suboptimal designs that a brief investigation would have caught. |
| "The approach is obvious, no need to investigate" | The "obviously correct" approach is by definition the least-investigated one. Research has repeatedly surfaced better designs — method-based vs persona-based splits, orthogonal dimensions the intuitive approach didn't consider. Research is cheap relative to a design revision after challenge finds gaps. |
| "Research will slow us down" | A 2-minute research dispatch is cheaper than a design revision after challenge finds holes that research would have prevented. The brief feeds forward into design — skipping it means the design phase compensates with ad-hoc investigation anyway. |
| "This question implies we should design/file/ship" | A scoped question ("can X be done?") is not a workflow trigger. Answer the question by completing the brief and presenting the Phase 3 next-step gate — that gate is the escalation offer. Don't silently launch issue filing, design, or shipping from a scoped question. |

## What This Skill Does NOT Do

- **Make decisions** — it informs them. Use `/mine.design` to formalize decisions.
- **Plan implementations** — it assesses feasibility. Use `/mine.build` to route to the right implementation workflow.
- **Write code** — it's pure investigation. No prototypes, no scaffolding, no "let me just try it."
- **Audit health** — it evaluates a specific proposal against the codebase. Use `/mine.challenge` for general health assessment.
- **Benchmark or profile** — it can identify likely performance concerns from code reading, but won't run benchmarks.

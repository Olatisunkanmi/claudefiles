---
name: mine.brainstorm
description: "Use when the user says: \"brainstorm options\", \"generate ideas\", \"explore ideas\", \"what are our options\", or wants divergent thinking before committing to an approach. Four parallel thinkers generate ideas, rank by user-chosen criteria."
user-invocable: true
---

# Brainstorm

Open-ended idea generation. Use this skill when you have a topic — a feature to build, a problem to solve, a direction to explore — and need divergent thinking before committing to an approach. Four parallel thinkers generate ideas independently, findings are collected and deduplicated, then ranked by criteria you choose.

## How This Differs From Other Skills

| Skill | Question it answers |
|-------|-------------------|
| **`mine.brainstorm`** | **"What are our options here?"** |
| `mine.research` | "Is this specific proposal feasible?" |
| `mine.challenge` | "Is this approach actually right?" |
| Plan mode | "How do we execute this chosen direction?" |

## Arguments

`$ARGUMENTS` — the topic to brainstorm. Can be:
- A feature idea: `/mine.brainstorm "add offline support to the app"`
- A problem: `/mine.brainstorm "users keep abandoning the onboarding flow"`
- A direction: `/mine.brainstorm "what should we build next for the CLI?"`
- Empty: ask the user what to brainstorm

## Phase 1: Understand the Ask

If `$ARGUMENTS` is empty, use `AskUserQuestion` to get the topic.

Once the topic is known, ask two quick questions in one `AskUserQuestion` call:

```
AskUserQuestion:
  question: "A couple of quick questions before we start:\n1. What's off the table? (time, tech, scope — anything that would make an idea immediately unworkable)\n2. What's already been tried or rejected, and why?"
```

Then ask about codebase context:

```
AskUserQuestion:
  question: "Should I read the codebase for context, or work from your description alone?"
  options:
    - label: "Read relevant code (Recommended for software topics)"
      description: "Subagents read related files — especially useful for the Pragmatist lens"
    - label: "Work from my description"
      description: "Faster, and works for non-code topics too"
```

If reading code: use Glob, Grep, and Read to find files relevant to the topic before launching thinkers. Pass key excerpts and file paths to each subagent so they can reason about what already exists.

## Phase 2: Launch Four Parallel Thinkers

Before launching, create a unique temp directory for this run:

1. Run: `get-skill-tmpdir mine-brainstorm`
2. Note the directory path printed (e.g., `/tmp/claude-mine-brainstorm-Kx3a8Q`)

Each thinker writes to a fixed filename inside this directory:
- `<dir>/pragmatist.md`
- `<dir>/advocate.md`
- `<dir>/moonshot.md`
- `<dir>/wildcard.md`

Launch all four as parallel Task calls with `subagent_type: general-purpose`. Each thinker:
- Receives the topic, constraints, prior attempts, and any codebase context
- Generates **3–5 ideas** from their lens
- Writes their full unfiltered output to their assigned temp file
- May use WebSearch to find inspiration, prior art, or relevant examples

### Thinker 1: The Pragmatist

**Persona**: Builds things that ship. Thinks in terms of existing code, real constraints, and what the team can actually do.

**Generates ideas that**: Reuse what's already there, fit within stated constraints, could be scoped to ship incrementally.

**Characteristic question**: *"What's the version of this we could ship next week?"*

**Instructions for the thinker**:

You are The Pragmatist. Your job is to generate 3–5 ideas for the following topic:

<topic>
[INSERT TOPIC]
</topic>

Constraints (things that are off the table): [INSERT CONSTRAINTS or "none stated"]

Prior attempts / rejected ideas: [INSERT PRIOR ATTEMPTS or "none stated"]

Codebase context: [INSERT EXCERPTS AND FILE PATHS or "none provided"]

Generate ideas that reuse what already exists, fit within the stated constraints, and could be scoped to ship incrementally. Think about the fastest path from here to something working. Each idea should be concrete enough that an engineer could start on it tomorrow.

For each idea, write:
- **Name**: short label
- **The idea**: one clear sentence
- **How it fits**: how it connects to existing code or patterns
- **Smallest shippable slice**: what a week-one increment looks like

Write your full, unfiltered output to: [INSERT TEMP FILE PATH]

### Thinker 2: The User Advocate

**Persona**: Speaks for the person using the thing. Cuts through technical solutions to find what users actually need — which is often simpler or different from what engineers assume.

**Generates ideas that**: Start from user pain, not technical capability. May surface ideas that require less engineering but more understanding.

**Characteristic question**: *"What is the user actually trying to do, and what's getting in the way?"*

**Instructions for the thinker**:

You are The User Advocate. Your job is to generate 3–5 ideas for the following topic:

<topic>
[INSERT TOPIC]
</topic>

Constraints (things that are off the table): [INSERT CONSTRAINTS or "none stated"]

Prior attempts / rejected ideas: [INSERT PRIOR ATTEMPTS or "none stated"]

Codebase context: [INSERT EXCERPTS AND FILE PATHS or "none provided"]

Start from the user's actual goal, not the engineering problem. What is the person using this product trying to accomplish? What's getting in their way? Some of your ideas may require less engineering than what's been tried — that's fine. Some may require more understanding of user behavior. Challenge the assumption that the user wants what's been proposed.

For each idea, write:
- **Name**: short label
- **The idea**: one clear sentence
- **The user pain it addresses**: what the user is actually struggling with
- **What makes this different**: how it reframes the problem from the user's perspective

Write your full, unfiltered output to: [INSERT TEMP FILE PATH]

### Thinker 3: The Moonshot Thinker

**Persona**: No constraints. Unlimited time, unlimited resources, perfect execution. What would the ideal version look like?

**Generates ideas that**: Ignore feasibility. Describe the destination, not the path. Some will be impractical — that's fine. They set the north star.

**Characteristic question**: *"If we could build anything, what would actually solve this completely?"*

**Instructions for the thinker**:

You are The Moonshot Thinker. Your job is to generate 3–5 ideas for the following topic:

<topic>
[INSERT TOPIC]
</topic>

Prior attempts / rejected ideas: [INSERT PRIOR ATTEMPTS or "none stated"]

Constraints do not apply to you. Ignore time, resources, and technical difficulty. Describe the ideal destination — what the complete, perfect solution would look like if execution were free. These ideas set a north star. Some will be impractical today; that's expected. Focus on what would *actually solve the problem completely*, not what's achievable right now.

For each idea, write:
- **Name**: short label
- **The idea**: one clear sentence
- **Why this is the complete solution**: what makes this fully solve the problem
- **What it would take**: resources, technology, or conditions required (don't let this stop you — just name them)

Write your full, unfiltered output to: [INSERT TEMP FILE PATH]

### Thinker 4: The Wildly Imaginative

**Persona**: Technically illiterate, wildly creative. No engineering filters, no feasibility concerns. Generates ideas that sound absurd or impossible — but often contain a kernel of insight the others miss.

**Generates ideas that**: Come from analogies, other industries, science fiction, nature, or pure imagination. Not meant to be taken literally — meant to spark lateral thinking.

**Characteristic question**: *"What if we completely ignored how things are normally done?"*

**Instructions for the thinker**:

You are The Wildly Imaginative. Your job is to generate 3–5 ideas for the following topic:

<topic>
[INSERT TOPIC]
</topic>

Prior attempts / rejected ideas: [INSERT PRIOR ATTEMPTS or "none stated"]

You have no engineering knowledge. You don't know what's hard or easy. You think in analogies, metaphors, other industries, science fiction, biology, games, and pure invention. Your ideas will sound absurd — that's the point. They contain kernels of insight the engineers will miss because they're too close to the problem. Don't worry about whether something is technically possible. Describe the idea vividly; let others figure out if it can be built.

For each idea, write:
- **Name**: short label
- **The idea**: one clear sentence
- **The analogy or inspiration**: where this idea comes from (another industry, a natural system, a story, a game)
- **The kernel**: what insight this contains that might be worth extracting

Write your full, unfiltered output to: [INSERT TEMP FILE PATH]

## Phase 3: Collect and Deduplicate

Read all four temp files. Merge into a unified idea list:
- Deduplicate ideas that are the same concept from different angles — note which lenses converged on it (convergence is a signal worth surfacing)
- Preserve the sharpest, most concrete phrasing for each idea
- Tag each idea with its origin lens(es)

Aim for 8–15 distinct ideas total. If multiple thinkers landed on the same core idea, that's noteworthy — it means the idea is compelling from multiple perspectives.

## Phase 4: Present Ideas and Ask for Ranking Criteria

Present the deduplicated ideas as a brief unranked list (one sentence each + origin lens). Call out any ideas where multiple thinkers converged.

Then ask:

```
AskUserQuestion:
  question: "Here are the ideas. What should I rank them by?"
  multiSelect: true
  options:
    - label: "Feasibility"
      description: "How realistic is this given our constraints?"
    - label: "User impact"
      description: "How much does this improve things for the user?"
    - label: "Originality"
      description: "Ideas we wouldn't have thought of otherwise"
    - label: "Fit to existing codebase"
      description: "How naturally does this extend what already exists?"
    - label: "Speed to ship"
      description: "How quickly could we have something working?"
```

## Phase 5: Score and Present Ranked List

Score each idea against the chosen criteria (1–5 per criterion, averaged). Present as a ranked list.

### Per-idea format (top 3)

```
### [N]. [Idea name] — Score: X.X

**The idea**: [One clear sentence]
**Why it could work**: [2–3 sentences — the best case for this idea]
**The catch**: [Main risk, limitation, or open question]
**Origin**: [Pragmatist / User Advocate / Moonshot / Wildly Imaginative — or combinations if multiple thinkers converged]
```

Ideas ranked 4 and below get a one-liner: name, score, one-sentence description, origin lens.

If two or more thinkers converged on an idea, note it explicitly — convergence across lenses is a stronger signal than a single-lens idea, even if it scores lower on individual criteria.

## Phase 6: Next Steps

```
AskUserQuestion:
  question: "What's the primary next step for the top idea?"
  header: "Next step"
  multiSelect: false
  options:
    - label: "Challenge the top idea first"
      description: "Run /mine.challenge before committing to this direction"
    - label: "Go deeper on the top idea"
      description: "Hand off to /mine.research for feasibility analysis"
    - label: "Build it (/mine.build)"
      description: "Direct implementation or full caliper workflow, depending on complexity"
    - label: "Keep exploring"
      description: "Run another round with a different framing or constraint"
```

```
AskUserQuestion:
  question: "Any housekeeping before we proceed?"
  header: "Housekeeping"
  multiSelect: true
  options:
    - label: "Save the session"
      description: "Write to design/brainstorms/YYYY-MM-DD-<topic>/brainstorm.md"
    - label: "Create issues"
      description: "File ideas as tracked issues"
    - label: "Nothing — proceed"
      description: "Skip housekeeping and go straight to the next step"
```

If "Challenge the top idea first" is selected: if the session was saved (housekeeping), invoke `/mine.challenge --mode=passthrough <brainstorm-file-path>`. If not saved, construct the argument from the top idea's name and description block and pass it as text: `/mine.challenge --mode=passthrough <text>`. After challenge completes, loop back to this gate.

### Creating issues

If selected, create one issue per idea using `gh-issue create`.

**Execution order for housekeeping**: (1) create issues, (2) save the session, then proceed to the primary next step.

Issue template:

- **Title:** `[Brainstorm] <topic>: <concise idea name>`
- **Body:**
  - **Summary:** One-paragraph description of the idea.
  - **Rationale:** Why this idea is valuable or promising.
  - **Ranking:** Tier and score (e.g. `Top 3`, `Score: 4.7/5`).
  - **Ranked by:** The criteria used (e.g. "feasibility, user impact, speed to ship").
  - **Suggested next step:** e.g. "Run /mine.research on this idea" or "Start implementation plan".

### Saving the session

If saving: write to `design/brainstorms/YYYY-MM-DD-<topic>/brainstorm.md`

Include an appendix with the four temp file paths so individual thinker output is accessible after the session:

```markdown
## Appendix: Individual Thinker Reports

These files contain each thinker's unfiltered output and are available for the duration of this session:

- Pragmatist: <dir>/pragmatist.md
- User Advocate: <dir>/advocate.md
- Moonshot Thinker: <dir>/moonshot.md
- Wildly Imaginative: <dir>/wildcard.md
```

## Principles

1. **Diverge before converging** — the thinkers generate ideas independently. Do not have them critique each other. Synthesis happens in Phase 3, not before.
2. **Convergence is signal** — when multiple thinkers with different lenses land on the same idea, that's meaningful. Make it visible.
3. **The wildcard earns its place** — the Wildly Imaginative lens exists to surface insights the pragmatic thinkers filter out. Treat its ideas as containing a kernel worth extracting, not as jokes.
4. **Constraints are data** — what's off the table shapes the search space. State them clearly to the thinkers so they don't waste output on dead ends.
5. **The user picks the criteria** — ideas aren't inherently good or bad. They're good or bad relative to what matters. Let the user define that before scoring.
6. **Handoff, don't dead-end** — the output of brainstorming is a decision, not a document. Always offer a next step.

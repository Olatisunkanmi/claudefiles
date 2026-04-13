---
name: mine.grill
description: "Use when the user says: \"grill me on this\", \"poke holes in my idea\", \"help me think this through\", \"what am I not thinking about\", or wants multi-angle questioning before committing to building something. Pre-pipeline exploration that sharpens thinking."
user-invocable: true
---

# Grill

Multi-angle interrogation of a raw idea. Attacks the idea from product, design, engineering, and adversarial perspectives to surface what you haven't thought about. Produces a structured brief that `/mine.specify` can ingest.

Not a spec. Not a design doc. A thinking tool.

## Arguments

$ARGUMENTS — the idea, issue, or problem to explore. Can be a description, a GitHub issue reference, or a path to an existing document.

---

## Phase 1: Understand the Idea

If $ARGUMENTS is provided, paraphrase it back in one sentence to confirm understanding. If empty, ask:

```
AskUserQuestion:
  question: "What's the idea or problem you want to think through?"
  header: "Grill"
```

Before exploring, confirm the pain point:

> **Understood pain point:** <the underlying problem or frustration driving this idea>

If the user gave a solution ("I want to add X") but not the problem, ask: "What's not working well?" before proceeding.

Explore the codebase for relevant context (existing patterns, related features, prior art). Present a brief summary of what you found — this grounds the entire conversation.

---

## Phase 2: Multi-Angle Interrogation

Work through these lenses one at a time. For each lens, ask 1-3 questions — only the ones that surface something the user likely hasn't considered. Skip questions where the codebase already provides the answer. **One question per AskUserQuestion call.**

### Product lens
- Who exactly benefits from this, and who doesn't?
- What's the smallest version that delivers value?
- What happens if you don't build this?

### Design lens
- How does the user discover and interact with this?
- What's the failure experience? (error states, edge cases, empty states)
- What existing mental models does this break or build on?

### Engineering lens
- What existing code/patterns does this touch or conflict with?
- What's the hardest technical constraint?
- What will be annoying to maintain?

### Scope lens
- What's adjacent to this that you're tempted to include?
- Where's the line between "this feature" and "the next feature"?
- What would you cut if you had to ship in half the time?

### Adversarial lens
- What assumption are you making that could be wrong?
- What's the worst way this could fail?
- If someone argued against building this, what would their strongest point be?

**You do not need to ask every question.** Skip any that are obvious, already answered, or where the codebase provides the answer. The goal is to find the 5-8 questions the user hasn't thought about, not to run a checklist.

After each answer, walk down any decision branches it opens — same pattern as adaptive follow-up in `/mine.specify`. If an answer reveals something the codebase can inform, check the code before asking the next question.

---

## Phase 3: Synthesize

After the interrogation, write a brief to the feature directory. If no feature directory exists yet, create one:

```bash
spec-helper init <slug> --json
```

Record the returned `feature_dir` — you will write the brief there.

Write to `<feature_dir>/brief.md`:

```markdown
# Brief: <Title>

**Date:** YYYY-MM-DD
**Status:** explored

## Idea

<One-paragraph summary of what was explored>

## Key Decisions Made

<Bullet list of decisions reached during the grill — things that were ambiguous and are now pinned down>

## Open Questions

<Anything that came up but couldn't be resolved — these feed directly into /mine.specify>

## Scope Boundaries

<What's in, what's explicitly out, what's deferred>

## Risks and Concerns

<Things that surfaced during adversarial questioning — assumptions, failure modes, maintenance burden>

## Codebase Context

<Relevant findings from code exploration — existing patterns, integration points, constraints>
```

---

## Phase 4: Handoff

```
AskUserQuestion:
  question: "Brief saved. What next?"
  header: "Handoff"
  multiSelect: false
  options:
    - label: "Challenge this brief first"
      description: "Run /mine.challenge — the brief shapes everything downstream, catch issues now"
    - label: "Specify this feature"
      description: "Run /mine.specify with this brief as input"
    - label: "Build it directly"
      description: "Run /mine.build — routes based on complexity"
    - label: "Done for now"
      description: "Brief saved; pick it up later"
```

### On "Challenge this brief first"

Invoke `/mine.challenge --target-type=brief <feature_dir>/brief.md`. After challenge completes, loop back to this handoff gate.

### On "Specify"

Invoke `/mine.specify <feature_dir>`

### On "Build it directly"

Invoke `/mine.build <feature_dir>`

### On "Done for now"

Confirm: "Brief saved at `<feature_dir>/brief.md`. Resume with `/mine.specify <feature_dir>` later."

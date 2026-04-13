---
name: mine.prior-art
description: "Use when the user says: \"prior art\", \"how do others do this\", \"what patterns exist\", \"industry standards for X\", or wants to survey external approaches."
user-invocable: true
---

# Prior Art

Survey best practices, reference implementations, and established patterns from the broader ecosystem. Web-first research — goes outside the codebase to find how others solve the problem, then brings findings back with relevance to your context.

Typically invoked mid-design or mid-conversation when you hit an architectural question and want to see how others handle it before committing to an approach.

## How This Differs From Other Skills

| Skill | Question it answers |
|-------|-------------------|
| **`/mine.prior-art`** | **"How do others solve X? What patterns exist?"** |
| `/mine.research` | "What would it take to do X in this codebase?" |
| `/mine.design` | "How should we build X?" |
| `/mine.eval-repo` | "Is this specific library/repo worth adopting?" |

## Arguments

$ARGUMENTS — the topic to investigate. Can be:
- A pattern question: `/prior-art "skill file schema conventions in AI coding tools"`
- A technology survey: `/prior-art "approaches to hot/cold memory in LLM agents"`
- A problem-first query: `/prior-art "how do teams handle config drift across environments"`
- Empty: ask the user what they want to survey

## Phase 1: Scope the Search

**Keep this fast.** The user already knows what they want to look into.

If $ARGUMENTS is empty or vague (single word or very short phrase without a framing question — e.g., "caching" is vague, "how teams handle caching invalidation" is not), ask:

```
AskUserQuestion:
  question: "What topic do you want to survey? (e.g., 'approaches to hot/cold memory in LLM agents', 'how teams handle config drift across environments')"
  header: "Prior art"
```

If the topic is clear but ambiguous across domains (e.g., "memory management" could mean OS, LLM context, or database), ask one disambiguation follow-up. Otherwise, proceed directly to Phase 2.

## Phase 2: Research

1. Run `get-skill-tmpdir mine-prior-art` to get a temp directory. Note the exact path — you'll need it after subagents complete.
2. Launch **two subagents in parallel**:

### Subagent A: Local Context (`subagent_type: Explore`)

Gather comparison context from the current codebase:
- How does the codebase handle the topic today (if at all)?
- What patterns, conventions, or prior decisions are relevant?
- What constraints does the existing architecture impose?

Keep this lightweight — aim for 2-3 file reads, up to 6 if conventions are split across multiple systems. If the codebase has no relevant code, return "No relevant local implementation found." The goal is a short summary (under 500 words) of the local state for the "How We Do It Today" section.

This subagent returns its findings as its result message (no file output needed — the main skill reads the return value).

### Subagent B: Web Research (`subagent_type: general-purpose`)

This is the PRIMARY phase. Replace `<topic>` with the exact topic from Phase 1 before dispatching. The subagent prompt must include:

```
Cite URLs where found. If you can't find a source for a pattern, mark it with [no source found] — do not fabricate URLs.

You are researching prior art and best practices for: <topic>

Perform 5-8 targeted web searches using WebSearch covering:
- How popular open-source projects handle this
- Blog posts and experience reports from teams who've solved this
- Official documentation, RFCs, or style guides if they exist
- Conference talks or technical writeups
- Common pitfalls and anti-patterns others have documented

For each useful source, capture: URL, key takeaway, and relevance.

Write your findings to: <tmpdir>/web-research.md

Use this structure:

## Sources Found

### [Source title]
- **URL**: [url]
- **Type**: [reference implementation / blog post / documentation / standard]
- **Key takeaway**: [1-2 sentences]
- **Relevance**: [how this applies to the topic]

## Patterns Found

For each distinct pattern or approach found across sources:

### Pattern 1: <Name>

**Used by**: [projects, companies, or communities that use this]
**How it works**: [2-3 paragraph explanation]
**Strengths**: [what makes this work well]
**Weaknesses**: [known limitations or tradeoffs]
**Example**: [link to reference implementation or documentation, or [no source found]]

## Anti-Patterns (Optional — omit entirely if nothing notable)

[Common mistakes documented in the sources. 2-4 items with citations.]

## Emerging Trends (Optional — omit entirely if nothing notable)

[What's new or changing. Skip if nothing notable.]
```

3. After both subagents complete, **verify the output**:
   - Read `<tmpdir>/web-research.md` and check it exists and contains `## Patterns Found`
   - If the file is completely empty or missing, offer to retry the web research subagent
   - If the file exists but is thin (few patterns, few sources), proceed anyway — flag the coverage gap in Phase 3 rather than gating the user

4. **Synthesize** the local context (from Subagent A's return value) and web research into a single brief. Map web research patterns into the brief format below — this is a merge, not a translation (both use the same section names). Write to `<tmpdir>/brief.md`.

### Prior Art Brief Format

```markdown
---
topic: "<topic>"
date: YYYY-MM-DD
status: Draft
---

# Prior Art: <Topic>

## The Problem

[1-2 paragraphs framing the problem being surveyed — what challenge does this address, why do teams care about it]

## How We Do It Today

[Brief summary of the current local approach from Subagent A. "We don't have this yet" is a valid answer. Keep this short — 2-3 sentences max.]

## Patterns Found

### Pattern 1: <Name>

**Used by**: [projects, companies, or communities that use this]
**How it works**: [2-3 paragraph explanation]
**Strengths**: [what makes this work well]
**Weaknesses**: [known limitations or tradeoffs]
**Example**: [link to reference implementation or documentation, or [no source found]]

### Pattern 2: <Name>

[Same structure]

### Pattern 3: <Name>

[Same structure — include 3-5 patterns total, more if the space is rich]

## Anti-Patterns (Optional — omit entirely if nothing notable)

[What NOT to do — common mistakes others have documented. 2-4 items.]

- **<Anti-pattern name>**: [why it fails, who got burned — with citation]

## Emerging Trends (Optional — omit entirely if nothing notable)

[What's new or changing in this space.]

## Relevance to Us

[How these patterns map to our specific context. Which patterns align with our existing conventions? Which would require significant changes? What's the gap between where we are and what the best practices suggest?]

## Recommendation

[Which pattern(s) are worth considering, or "none of these fit — here's why." Be honest about gaps in the research.]

## Sources

[All URLs from web research, organized by category. Note: these URLs were not live-verified.]

### Reference implementations
- [url] — [one-line description]

### Blog posts & writeups
- [url] — [one-line description]

### Documentation & standards
- [url] — [one-line description]
```

## Phase 3: Present

Lead with the recommendation and the 1-2 most surprising or relevant patterns. Don't recap the full brief inline — the user is mid-task and wants the actionable takeaway. Surface anti-patterns and coverage gaps if notable.

If web research was thin, say so explicitly: "Coverage was limited — only N sources found. These patterns may not represent the full landscape."

End with: `Brief saved at <tmpdir>/brief.md — say "save it" if you want to keep it permanently.`

If the user asks to save, write to `design/research/YYYY-MM-DD-<topic>/research.md` (create the directory if needed, sanitize topic to lowercase-hyphenated slug, 40 chars max).

## What This Skill Does NOT Do

- **Research your codebase** — it looks outward at the ecosystem. Use `/mine.research` to investigate feasibility within your codebase.
- **Evaluate a specific library** — it surveys patterns and approaches, not whether a specific repo is worth adopting. Use `/mine.eval-repo` for that.
- **Make decisions** — it informs them. The user decides which patterns to adopt.
- **Produce implementation plans** — it's a survey, not a blueprint.

## Principles

1. **World-first, codebase-second** — the whole point is to look outside. Codebase exploration is only for comparison context.
2. **Breadth over depth** — survey the landscape, don't deep-dive any single approach.
3. **Sources matter** — patterns should be backed by URLs where possible. Unsourced patterns are marked, not fabricated. Note that URLs are not live-verified.
4. **Honest about coverage** — if the search didn't find much, say so. "This is a thin area with little documented prior art" is valuable information.
5. **Get out of the way** — this skill is typically invoked mid-conversation during design work. Present findings and return control. Don't gate the user with follow-up menus.

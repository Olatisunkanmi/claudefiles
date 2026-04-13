---
name: i-teach-impeccable
description: 'Use when the user says: "setup impeccable", "design context setup", "teach impeccable", "design this UI", "look and feel", "establish design tokens", "plan the look and feel", "UI planning", "design system for this project", "craft the interface". Gathers design context and concrete tokens, saves to design/context.md.'
user-invocable: true
---

Gather design context for this project — both prose context (audience, brand, principles) and concrete design tokens (colors, fonts, spacing, motion). Persist everything to `design/context.md` for all future sessions.

## Step 1: Explore the Codebase

Before asking questions, scan the project to discover what you can:

- **README and docs**: Project purpose, target audience, any stated goals
- **Package.json / config files**: Tech stack, dependencies, existing design libraries
- **Existing components**: Current design patterns, spacing, typography in use
- **Brand assets**: Logos, favicons, color values already defined
- **Design tokens / CSS variables**: Existing color palettes, font stacks, spacing scales
- **Mockup files**: If HTML mockups exist (from /mine.mockup), read them for aesthetic direction to reference when gathering tokens
- **Any style guides or brand documentation**

Also check for a spec: look for `design/specs/*/spec.md`. If found, read the **User Scenarios** section — it contains structured actor/goal/context data that pre-answers Step 2 questions.

Note what you've learned and what remains unclear.

### Check for existing context

Look for `design/context.md`, `.impeccable.md`, or `design/direction.md`.

If found, read and ask:

```
AskUserQuestion:
  question: "Existing design context found. What would you like to do?"
  header: "Context"
  options:
    - label: "Update it"
      description: "Revise the existing context with new decisions"
    - label: "Start fresh"
      description: "Replace it entirely"
```

If updating, carry forward decisions not being changed.

## Step 2: Gather Intent

Ask focused questions, one at a time. Skip any already answered by the spec or codebase exploration.

**Question 1** (skip if spec has User Scenarios):

```
AskUserQuestion:
  question: "Who is this person? Not 'users' — the actual person. A teacher at 7am with coffee, a developer debugging at midnight, a manager scanning reports between meetings."
  header: "Audience"
```

If the answer is vague ("users", "people"), push back: "Can you be more specific? What's their context when they use this?"

**Question 2** (skip if spec has User Scenarios):

```
AskUserQuestion:
  question: "What must they accomplish? The verb — not 'use the dashboard.' Grade submissions, find the broken deployment, approve the payment."
  header: "Task"
```

**Question 3:**

```
AskUserQuestion:
  question: "What should this feel like? Specific language: 'warm like a notebook', 'cold like a terminal', 'dense like a trading floor.' Not 'clean and modern.'"
  header: "Feel"
```

If any answer is vague ("clean and modern", "simple"), push back with a concrete alternative and ask to confirm or revise.

## Step 3: Collect References

Ask for visual references:

```
AskUserQuestion:
  question: "Name 2-3 apps or sites whose *feel* (not features) matches what you described. Not to copy — to articulate direction."
  header: "References"
```

If the user cannot name any, suggest 3 options based on the domain and intent. For each reference, identify:
- What to **take** from it (e.g., "the density and monospace feel")
- What to **leave** (e.g., "the cold corporate blue — wrong for our brand")
- The specific **visual movement** it represents (e.g., "editorial minimalism", "data-dense utility", "organic warmth")

Naming the visual movement constrains downstream decisions more precisely than vague feel descriptors.

## Step 4: Domain Exploration

Run the four-part exploration. Present all four before proposing any direction.

1. **Domain concepts** — Concepts, metaphors, vocabulary from this product's world. Not features — territory. Minimum 5.
2. **Color world** — What colors exist naturally in this domain? If this product were a physical space, what would you see? List 5+.
3. **Signature element** — One element — visual, structural, or interaction — that could only exist for THIS product. Be specific: "a timeline scrubber that mimics a vinyl record arm" not "a unique navigation pattern."
4. **Defaults to reject** — 3 obvious choices for this interface type. Name them so you can reject them consciously. For each: the default, why it's wrong for this product, and a better alternative.
5. **Concrete constraints** — Specific aesthetic rules derived from the exploration above. These are hard constraints, not suggestions. Examples:
   - "No rounded corners above 4px — the product is technical, not friendly"
   - "Body text must be a serif — the editorial feel requires it"
   - "Maximum 2 colors beyond neutrals — density demands restraint"
   - "No drop shadows — use border-only depth strategy"

Present exploration results to the user. Remove the product name — could someone still identify what it's for? If not, explore deeper.

## Step 5: Self-Review

Draft your token decisions internally. Before presenting them, run these checks:

- **Swap test:** Replace your typeface, layout choices, and colors with the most common alternatives. Would anyone notice? Where they wouldn't — you defaulted.
- **Squint test:** Blur your eyes at the token set. Can you perceive hierarchy? Is anything jarring?
- **Signature test:** Point to five specific places where the signature element appears in your token decisions. "The overall feel" doesn't count.
- **Token test:** Read your CSS variable names aloud. Do they sound like they belong to this product, or any project?

If any check fails, iterate before presenting. Ask yourself: "If they said this lacks craft, what would they point to?" Fix that first.

## Step 6: Propose Direction

Present concrete token decisions. Every value must be justified against intent and domain — not "it's common" or "it works."

Present a summary covering:

- **Color palette** — OKLCH values with semantic names. Light and dark mode. How colors connect to the domain's color world.
- **Typography** — Specific fonts and why they fit this product. Scale (xs through 3xl). Weights and their purposes. Avoid generic defaults (Inter, Roboto, Arial, Open Sans, system fonts).
- **Spacing** — Base unit and scale. How density connects to intent.
- **Depth strategy** — One of: borders-only, subtle shadows, layered shadows, surface tints. Why this choice fits the feel.
- **Border radius** — Scale (sm, md, lg). Where on the sharp-to-round spectrum and why.
- **Motion** — Micro-interaction timing, transition timing, easing functions.

Ask the user to confirm or revise before saving.

## Step 7: Save Context

After user confirmation, write `design/context.md`. Create the `design/` directory if it does not exist.

### File format

```markdown
---
schema_version: 1
updated_at: YYYY-MM-DD
---

## Users & Purpose
[From Step 2, Questions 1-2 — who the person is, their context, the task]

## Brand Personality
[From Step 2, Question 3 — emotional feel, aesthetic tone]

## Aesthetic Direction
[From Step 3 — visual references, what to take/leave, visual movement name]
[From Step 4 — domain concepts, signature element, defaults rejected]

## Concrete Constraints
[From Step 4 — hard aesthetic rules, e.g., "no rounded corners above 4px", "body text must be serif"]

## Design Principles
[3-5 principles derived from the conversation]

## Design Tokens

### Color
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--bg` | oklch(...) | oklch(...) | Page background |
| `--surface` | oklch(...) | oklch(...) | Card/panel background |
| ... | ... | ... | ... |

**Rationale**: [how colors connect to domain and intent]

### Typography
- **Primary**: [font name] — [why]
- **Mono**: [font name] — [for code/data]
- **Scale**: [specific sizes: xs, sm, base, lg, xl, 2xl, 3xl]
- **Weights**: [which weights, for what purpose]

### Spacing
- **Base**: [value]
- **Scale**: micro (1×), sm (2×), md (4×), lg (8×), xl (12×), 2xl (16×)

### Depth
- **Strategy**: [borders-only | subtle shadows | layered | surface tints]
- **Why**: [connection to intent]
- **Levels**: [specific values]

### Border Radius
- **Scale**: sm, md, lg
- **Character**: [sharp=technical, round=friendly]

### Motion
- **Micro**: [~150ms, easing]
- **Transition**: [200-250ms, easing]
- **Entrance**: [if applicable]

### Anti-patterns
[Specific things to avoid for THIS product — not generic advice]
```

If `design/context.md` already exists and the user chose "Update it" in Step 1, update changed sections in place rather than overwriting.

## Step 8: Offer Next Steps

```
AskUserQuestion:
  question: "Design context saved. What's next?"
  header: "Next step"
  options:
    - label: "Generate a mockup"
      description: "Run /mine.mockup to produce an HTML preview using these tokens"
    - label: "Also add to CLAUDE.md"
      description: "Append a Design Context summary to CLAUDE.md so it loads automatically in all sessions (takes effect in new sessions, not the current one)"
    - label: "Done for now"
      description: "Context is saved — it will be used by all i-* design skills automatically"
```

If mockup → invoke `/mine.mockup`.
If CLAUDE.md → append or update a `## Design Context` section in CLAUDE.md with a summary of the prose sections (not the full token tables — those live in design/context.md).

## Communication Style

Be invisible. Don't announce modes or narrate process.

**Never say:** "I'm now entering the exploration phase", "Let me check for existing files..."
**Instead:** Jump into work. Present exploration, then direction, then confirm.

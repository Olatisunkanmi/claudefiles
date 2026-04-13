---
name: i-frontend-design
description: 'Use when building frontend components or pages. Core design skill for creating distinctive, production-grade interfaces that avoid generic AI aesthetics.'
user-invocable: false
license: Apache 2.0. Based on Anthropic's frontend-design skill.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

*Last reviewed: 2026-04-05*

## Context Gathering Protocol

Design skills produce generic output without project context. You MUST have confirmed design context before doing any design work.

**Required context** — every design skill needs at minimum:
- **Target audience**: Who uses this product and in what context?
- **Use cases**: What jobs are they trying to get done?
- **Brand personality/tone**: How should the interface feel?

Individual skills may require additional context — check the skill's preparation section for specifics.

**CRITICAL**: You cannot infer this context by reading the codebase. Code tells you what was built, not who it's for or what it should feel like. Only the creator can provide this context.

**Gathering order:**
1. **Check current instructions (instant)**: If your loaded instructions already contain a **Design Context** section, proceed immediately.
2. **Check design/context.md (canonical)**: Read `design/context.md` from the project root. If it exists and contains the required prose sections (Users & Purpose, Brand Personality, Aesthetic Direction), proceed. The Design Tokens section may be empty — that's valid.
3. **Check .impeccable.md (migration fallback)**: If `design/context.md` doesn't exist, check `.impeccable.md` in the project root. If found and it contains the required context, proceed.
4. **Check design/direction.md (migration fallback)**: If neither of the above exist, check for `design/direction.md` (exact filename). If found, read it and extract audience, intent, and aesthetic direction from its sections.
5. **Run /i-teach-impeccable (REQUIRED)**: If none of the above sources have context, you MUST run /i-teach-impeccable NOW before doing anything else. Do NOT skip this step. Do NOT attempt to infer context from the codebase instead.

**Hard gate**: If a context file exists (any of steps 2-4) but is missing required prose sections (Users & Purpose / Users, Brand Personality, Aesthetic Direction), redirect to /i-teach-impeccable with a message identifying what's missing. Do not proceed with incomplete context — a partial file is more dangerous than no file.

## Scoping Rule

All i-* skills inherit this default scoping behavior:

- **If the user provided a path or component name** (e.g., `/i-typeset src/components/Header.tsx`), scope to that target.
- **If the conversation has a clear current focus** (a file being discussed, a component just modified), scope to that.
- **If scope is ambiguous**, STOP and ask:

```
AskUserQuestion:
  question: "What should I work on?"
  header: "Scope"
  options:
    - label: "Current file"
      description: "The file we're currently looking at"
    - label: "Specific component"
      description: "I'll name the component or path"
    - label: "Whole UI"
      description: "Scan the entire frontend codebase"
```

Do not guess scope. Operating on the wrong files wastes time and produces irrelevant proposals.

---

## Design Direction

Commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work—the key is intentionality, not intensity.

Then implement working code that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

### Typography
→ *Consult [typography reference](reference/typography.md) for scales, pairing, and loading strategies.*

Choose fonts that are beautiful, unique, and interesting. Pair a distinctive display font with a refined body font.

**DO**: Use a modular type scale with fluid sizing (clamp)
**DO**: Vary font weights and sizes to create clear visual hierarchy

→ *See [anti-patterns reference](reference/anti-patterns.md) § Typography for what to avoid.*

### Color & Theme
→ *Consult [color reference](reference/color-and-contrast.md) for OKLCH, palettes, and dark mode.*

Commit to a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**DO**: Use modern CSS color functions (oklch, color-mix, light-dark) for perceptually uniform, maintainable palettes
**DO**: Tint your neutrals toward your brand hue—even a subtle hint creates subconscious cohesion

→ *See [anti-patterns reference](reference/anti-patterns.md) § Color & Theme for what to avoid.*

### Layout & Space
→ *Consult [spatial reference](reference/spatial-design.md) for grids, rhythm, and container queries.*

Create visual rhythm through varied spacing—not the same padding everywhere. Embrace asymmetry and unexpected compositions. Break the grid intentionally for emphasis.

**DO**: Create visual rhythm through varied spacing—tight groupings, generous separations
**DO**: Use fluid spacing with clamp() that breathes on larger screens
**DO**: Use asymmetry and unexpected compositions; break the grid intentionally for emphasis

→ *See [anti-patterns reference](reference/anti-patterns.md) § Layout & Space for what to avoid.*

### Visual Details
**DO**: Use intentional, purposeful decorative elements that reinforce brand

→ *See [anti-patterns reference](reference/anti-patterns.md) § Visual Details for what to avoid.*

### Motion
→ *Consult [motion reference](reference/motion-design.md) for timing, easing, and reduced motion.*

Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

**DO**: Use motion to convey state changes—entrances, exits, feedback
**DO**: Use exponential easing (ease-out-quart/quint/expo) for natural deceleration
**DO**: For height animations, use grid-template-rows transitions instead of animating height directly

→ *See [anti-patterns reference](reference/anti-patterns.md) § Motion for what to avoid.*

### Interaction
→ *Consult [interaction reference](reference/interaction-design.md) for forms, focus, and loading patterns.*

Make interactions feel fast. Use optimistic UI—update immediately, sync later.

**DO**: Use progressive disclosure—start simple, reveal sophistication through interaction (basic options first, advanced behind expandable sections; hover states that reveal secondary actions)
**DO**: Design empty states that teach the interface, not just say "nothing here"
**DO**: Make every interactive surface feel intentional and responsive

→ *See [anti-patterns reference](reference/anti-patterns.md) § Interaction & Copy for what to avoid.*

### Responsive
→ *Consult [responsive reference](reference/responsive-design.md) for mobile-first, fluid design, and container queries.*

**DO**: Use container queries (@container) for component-level responsiveness
**DO**: Adapt the interface for different contexts—don't just shrink it

→ *See [anti-patterns reference](reference/anti-patterns.md) § Interaction & Copy for responsive anti-patterns.*

### UX Writing
→ *Consult [ux-writing reference](reference/ux-writing.md) for labels, errors, and empty states.*

**DO**: Make every word earn its place

---

## The AI Slop Test

→ *Consult [anti-patterns reference](reference/anti-patterns.md) for the full AI Slop Test and all DON'T guidelines.*

**Critical quality check**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem. A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

---

## Implementation Principles

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

Remember: Claude is capable of extraordinary creative work. Don't hold back—show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
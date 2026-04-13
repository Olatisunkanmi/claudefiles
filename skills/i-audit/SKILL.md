---
name: i-audit
description: 'Use when the user says: "audit this UI", "frontend quality", "full UI audit", "design audit". Comprehensive audit of interface quality across accessibility, performance, theming, and responsive design.'
user-invocable: true
---

Run systematic quality checks and generate a comprehensive audit report with prioritized issues and actionable recommendations. Don't fix issues - document them for other commands to address.

## MANDATORY PREPARATION

Read `~/.claude/skills/i-frontend-design/SKILL.md` for design principles and anti-patterns. Check for design context (`design/context.md`, `.impeccable.md`, or `design/direction.md`) — if found, use it to inform brand-specific judgments. If no context exists, **proceed anyway** but note in the report: "No design context found — anti-pattern checks are universal only; brand-specific judgments may not apply. Run `/i-teach-impeccable` to establish context."

Audits are read-only diagnostics — they should never be blocked by missing context.

---

## Diagnostic Scan

Run comprehensive checks across multiple dimensions:

1. **Accessibility (A11y)** - Check for:
   - **Contrast issues**: Text contrast ratios < 4.5:1 (or 7:1 for AAA)
   - **Missing ARIA**: Interactive elements without proper roles, labels, or states
   - **Keyboard navigation**: Missing focus indicators, illogical tab order, keyboard traps
   - **Semantic HTML**: Improper heading hierarchy, missing landmarks, divs instead of buttons
   - **Alt text**: Missing or poor image descriptions
   - **Form issues**: Inputs without labels, poor error messaging, missing required indicators

2. **Performance** - Check for:
   - **Layout thrashing**: Reading/writing layout properties in loops
   - **Expensive animations**: Animating layout properties (width, height, top, left) instead of transform/opacity
   - **Missing optimization**: Images without lazy loading, unoptimized assets, missing will-change
   - **Bundle size**: Unnecessary imports, unused dependencies
   - **Render performance**: Unnecessary re-renders, missing memoization

3. **Theming** - Check for:
   - **Hard-coded colors**: Colors not using design tokens
   - **Broken dark mode**: Missing dark mode variants, poor contrast in dark theme
   - **Inconsistent tokens**: Using wrong tokens, mixing token types
   - **Theme switching issues**: Values that don't update on theme change

4. **Responsive Design** - Check for:
   - **Fixed widths**: Hard-coded widths that break on mobile
   - **Touch targets**: Interactive elements < 44x44px
   - **Horizontal scroll**: Content overflow on narrow viewports
   - **Text scaling**: Layouts that break when text size increases
   - **Missing breakpoints**: No mobile/tablet variants

5. **Anti-Patterns (CRITICAL)** - Check against the [anti-patterns reference](../i-frontend-design/reference/anti-patterns.md). Look for AI slop tells and general design anti-patterns documented there.

**CRITICAL**: This is an audit, not a fix. Document issues thoroughly with clear explanations of impact. Use other commands (normalize, optimize, harden, etc.) to fix issues after audit.

## Generate Comprehensive Report

Create a detailed audit report with the following structure:

### Anti-Patterns Verdict
**Start here.** Pass/fail: Does this look AI-generated? List specific tells from the [anti-patterns reference](../i-frontend-design/reference/anti-patterns.md). Be brutally honest.

### Executive Summary
- Total issues found (count by severity)
- Most critical issues (top 3-5)
- Overall quality score (if applicable)
- Recommended next steps

### Detailed Findings by Severity

For each issue, document:
- **Location**: Where the issue occurs (component, file, line)
- **Severity**: Critical / High / Medium / Low
- **Category**: Accessibility / Performance / Theming / Responsive
- **Description**: What the issue is
- **Impact**: How it affects users
- **WCAG/Standard**: Which standard it violates (if applicable)
- **Recommendation**: How to fix it
- **Suggested command**: Route to the most relevant modification skill:
  - Contrast, color system, palette issues → `/i-colorize`
  - Layout, spacing, alignment, hierarchy → `/i-arrange`
  - Typography, font choices, type scale → `/i-typeset`
  - Animation, motion, transition issues → `/i-animate`
  - Performance, load time, rendering → `/i-optimize`
  - Responsive, mobile, touch targets → `/i-adapt`
  - Hard-coded values, design system drift → `/i-normalize`
  - Missing states, error handling, i18n → `/i-harden`
  - Onboarding, empty states, first-run → `/i-onboard`
  - Copy, labels, error messages → `/i-clarify`
  - Overall too busy/noisy → `/i-quieter`
  - Overall too generic/bland → `/i-bolder`
  - Component extraction needed → `/i-extract`
  - Final polish pass → `/i-polish`

#### Critical Issues
[Issues that block core functionality or violate WCAG A]

#### High-Severity Issues  
[Significant usability/accessibility impact, WCAG AA violations]

#### Medium-Severity Issues
[Quality issues, WCAG AAA violations, performance concerns]

#### Low-Severity Issues
[Minor inconsistencies, optimization opportunities]

### Patterns & Systemic Issues

Identify recurring problems:
- "Hard-coded colors appear in 15+ components, should use design tokens"
- "Touch targets consistently too small (<44px) throughout mobile experience"
- "Missing focus indicators on all custom interactive components"

### Positive Findings

Note what's working well:
- Good practices to maintain
- Exemplary implementations to replicate elsewhere

### Recommendations by Priority

Create actionable plan:
1. **Immediate**: Critical blockers to fix first
2. **Short-term**: High-severity issues (this sprint)
3. **Medium-term**: Quality improvements (next sprint)
4. **Long-term**: Nice-to-haves and optimizations

### Suggested Commands for Fixes

Group findings by the skill that would fix them, using the routing from the per-finding "Suggested command" field. Example:

- "Use `/i-normalize` to align with design system (addresses N theming issues)"
- "Use `/i-adapt` to fix responsive problems (addresses N mobile/touch issues)"
- "Use `/i-harden` to improve resilience (addresses N edge cases)"

**IMPORTANT**: Be thorough but actionable. Too many low-priority issues creates noise. Focus on what actually matters.

**NEVER**:
- Report issues without explaining impact (why does this matter?)
- Mix severity levels inconsistently
- Skip positive findings (celebrate what works)
- Provide generic recommendations (be specific and actionable)
- Forget to prioritize (everything can't be critical)
- Report false positives without verification

Remember: You're a quality auditor with exceptional attention to detail. Document systematically, prioritize ruthlessly, and provide clear paths to improvement. A good audit makes fixing easy.

## Completion

Write the audit report to `.claude/audits/audit-YYYY-MM-DD.md` (create the `.claude/audits/` directory if needed). Then summarize in conversation:

1. **Verdict**: One-line overall assessment
2. **Top findings**: The 3-5 most important issues
3. **Suggested next step**: Which modification skill to run first
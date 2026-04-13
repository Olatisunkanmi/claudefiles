---
name: mine.write-skill
description: "Use when the user says: \"create a skill\", \"write a skill\", \"new skill\", or wants to author a new SKILL.md. Guided skill creation following Claudefiles conventions."
user-invocable: true
---

# Write Skill

Guided creation of a new skill for this repo. Gathers requirements, drafts the skill, validates against a quality checklist, and writes it to the correct location.

## Arguments

$ARGUMENTS — optional skill name or description. If provided, use as starting context.

---

## Phase 1: Requirements

Ask these one at a time. Skip any already answered by $ARGUMENTS.

```
AskUserQuestion:
  question: "What task should this skill handle? Describe the problem it solves."
  header: "Purpose"
```

```
AskUserQuestion:
  question: "What trigger phrases should invoke it? (e.g., when the user says 'audit the codebase')"
  header: "Triggers"
```

```
AskUserQuestion:
  question: "What does the output look like? (e.g., a file, a report, a question, an action)"
  header: "Output"
```

```
AskUserQuestion:
  question: "Should this be user-invocable (slash command) or a reference skill (loaded by other skills only)?"
  header: "Invocability"
  multiSelect: false
  options:
    - label: "User-invocable"
      description: "Can be called directly via /mine.<name>"
    - label: "Reference only"
      description: "Loaded by other skills, not directly callable"
```

Then explore the codebase for related skills, patterns, or existing work that should inform the new skill's design.

---

## Phase 2: Draft

### Determine the skill name

Derive from the purpose: `mine.<kebab-case-name>`. Max 30 chars total. Check that `skills/mine.<name>/` doesn't already exist.

### Write SKILL.md

Write to `skills/mine.<name>/SKILL.md` using the template in REFERENCE.md. See REFERENCE.md for conventions, AskUserQuestion constraints (`header` ≤12 chars, max 4 options), and size guidance.

---

## Phase 3: Quality Checklist

Validate the drafted skill against the quality checklist in REFERENCE.md (full criteria there). Quick list:

1. Description includes "Use when..." trigger phrases
2. SKILL.md under ~100 lines (or split with REFERENCE.md)
3. No time-sensitive info (dates, versions)
4. Consistent terminology throughout
5. At least one concrete example of output
6. References at most one level deep
7. No significant duplication with existing skills
8. All user interaction points use AskUserQuestion

Report results. Fix any failures before presenting to the user.

---

## Phase 4: Wiring

After the user approves the skill:

1. Add a routing entry to `rules/common/capabilities.md` using the trigger phrases from Phase 1
2. Add a row to the Skills table in `README.md` (alphabetical order) and update the skill count in the section header
3. Remind the user to run `./install.sh` to create the symlink

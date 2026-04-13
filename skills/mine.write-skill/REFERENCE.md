# Write Skill — Reference

Extended guidance for SKILL.md authoring. Referenced by SKILL.md — do not reference further files from here.

---

## SKILL.md Template

```markdown
---
name: mine.<name>
description: "Use when the user says: '<trigger 1>', '<trigger 2>', or <broader description>."
user-invocable: true|false
---

# mine.<name>

<One-paragraph summary: what it does, when to use it, what it produces.>

## Arguments

$ARGUMENTS — <what arguments it accepts, or "none">

---

## Phase 1: <First phase name>

...

## Phase N: <Last phase name>

...
```

---

# Creating a skill

## Capture Intent

Start by understanding the user's intent. The current conversation might already contain a workflow the user wants to capture (e.g., they say "turn this into a skill"). If so, extract answers from the conversation history first — the tools used, the sequence of steps, corrections the user made, input/output formats observed. The user may need to fill the gaps, and should confirm before proceeding to the next step.

## Conventions

- `mine.*` prefix for first-party skills
- Frontmatter fields: `name`, `description`, `user-invocable`
- Description: starts with "Use when..." trigger phrases, ends with a summary of what it produces
- Phases are numbered with descriptive names
- Use `AskUserQuestion` for every user interaction point — explicit header and options
  - `header` ≤12 characters
  - Maximum 4 options per question
- Use `spec-helper`, `get-skill-tmpdir`, and other `bin/` helpers where appropriate — don't reinvent
- If the skill needs scripts, add them to `bin/` (shared), not inside the skill directory

## Size Target

Keep SKILL.md under ~100 lines. If the skill needs detailed reference material (examples, templates, extended guidance), split into:

- `SKILL.md` — workflow and phases (the "what to do")
- `REFERENCE.md` — detailed guidance, templates, examples (the "how to do it well")

## Principle of Lack of Surprise

This goes without saying, but skills must not contain malware, exploit code, or any content that could compromise system security. A skill's contents should not surprise the user in their intent if described. Don't go along with requests to create misleading skills or skills designed to facilitate unauthorized access, data exfiltration, or other malicious activities. Things like a "roleplay as an XYZ" are OK though.

## Writing Patterns

Prefer using the imperative form in instructions.

---

## Quality Checklist — Detailed Criteria

1. **Description includes trigger phrases** — frontmatter `description` must start with `"Use when the user says: '...'"`; include at least 2–3 specific user phrases
2. **SKILL.md under ~100 lines** — if longer, split reference material (templates, extended examples) into REFERENCE.md; procedural phases stay in SKILL.md
3. **No time-sensitive info** — no hardcoded dates, library versions, or ephemeral references; use `$ARGUMENTS` or instruct the agent to look up current state
4. **Consistent terminology** — pick one term for each concept and use it everywhere; don't alternate between "task" and "item", "skill" and "command", etc.
5. **Concrete examples** — at least one example of expected behavior, output format, or invocation; abstract guidance without examples is harder to follow
6. **References at most one level deep** — SKILL.md may reference REFERENCE.md; REFERENCE.md should not reference further files (prevents infinite chains)
7. **No duplication with existing skills** — grep `skills/` for similar functionality; if overlap exists, consider extending an existing skill rather than creating a new one
8. **User interaction points are explicit** — every place the user must respond uses `AskUserQuestion`; no implicit "wait for user input" or free-text assumptions

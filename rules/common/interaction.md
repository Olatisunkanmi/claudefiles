# Interaction Style

## Clarify, Don't Plan

Do NOT use the `EnterPlanMode` tool. It is completely off-limits unless the
user explicitly requests it (e.g., "enter plan mode", or the Shift+Tab
keyboard shortcut in Claude Code CLI).

When a task is ambiguous or has multiple valid approaches, use
`AskUserQuestion` to clarify the specific points where the correct choice is
unclear. Ask focused, minimal questions — only what's needed to proceed
confidently. Then start implementing immediately after getting answers.

When a task needs structured planning, launch the Agent tool with
`subagent_type: "planner"` instead of entering plan mode. Present the
planner's output to the user via `AskUserQuestion` for approval before
executing.

## Suggest /mine.challenge

Before committing to non-trivial designs, specs, new skills, rule changes, or
workflow modifications, suggest running `/mine.challenge` if the user hasn't
already. Works on any artifact — code, specs, designs, briefs, skill files.
One-line mention, not a gate — the user decides whether to run it.

## Progress Tracking

Use TaskCreate to track multi-step tasks. The todo list reveals out-of-order
steps, missing items, wrong granularity, and misinterpreted requirements.

## AskUserQuestion Blocks in Skills (CRITICAL)

When a SKILL.md contains an `AskUserQuestion:` YAML block (inside a code
fence or otherwise), it is an instruction to **call the `AskUserQuestion`
tool** — not a template to paraphrase as markdown.

Rules:
1. **Call the tool.** Do not render options as bullet points, numbered lists,
   or any other text format. The user must see the interactive prompt.
2. **Use the exact labels and descriptions.** Do not rewrite, merge, or
   improvise option text. The skill author chose those words deliberately.
3. **Respect the option count.** Do not add or remove options beyond what the
   skill defines (max 4 options per question when options are provided).
4. **Respect `multiSelect`.** If the skill says `multiSelect: true`, pass it
   through. Do not downgrade to single-select.

5. **Use previews for concrete format comparisons.** The `preview` field on options renders multi-line markdown in a side-by-side layout next to the option list. Use previews for format comparisons (code snippets, ASCII mockups, diagram variations, manifest samples) where the user needs to *see* the option before choosing. Previews only work on single-select questions (`multiSelect: false`). Do not use previews for simple preference questions — labels and descriptions suffice there.

If you need to adapt the question text to include dynamic context (e.g.,
filling in a finding name), change only the `question` string — leave `label`
and `description` values verbatim.

## Permissions

Never use `dangerously-skip-permissions`. Configure `allowedTools` in settings instead.

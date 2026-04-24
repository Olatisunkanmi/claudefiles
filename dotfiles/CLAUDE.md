# CLAUDE.md

This is a Claude Code configuration repository. It is opinionated toward Claude Code and does not target other AI coding assistants.

## What this repo is

Portable configuration for Claude Code — skills, commands, hooks, sounds, and settings deployed to `~/.claude/`. Think dotfiles, but for Claude.

## Architecture

`claudefiles.yaml` is the source of truth. It declares install targets, settings to merge, and platform-specific values. The `/setup` command reads this manifest and does the deployment. No imperative installer scripts beyond bootstrap.

### Setup command

`/setup` is a **project-level command** (`.claude/commands/setup.md`). It only works when Claude is running inside this repo. This solves the bootstrap chicken-and-egg: the command is available immediately after cloning, before anything is deployed globally.

### Install targets

| Target    | Directory            | Deployed to                              |
| --------- | -------------------- | ---------------------------------------- |
| skills    | `skills/`            | `~/.claude/skills/`                      |
| commands  | `commands/`          | `~/.claude/commands/`                    |
| sounds    | `sounds/`            | `~/.claude/sounds/`                      |
| hooks     | `hooks/`             | `~/.claude/hooks/`                       |
| claude_md | `dotfiles/CLAUDE.md` | `~/.claude/CLAUDE.md` (smart-merged)     |
| plugins   | `plugins/`           | Installed by Claude Code via marketplace |

Note: `commands/` contains only global commands (`/gcw`, `/gitconfig`). `/setup` lives in `.claude/commands/` as a project-level command and is not deployed globally.

### Plugins

This repo is a registered Claude Code plugin marketplace (`koolamusic/claudefiles`). Plugins in `plugins/` are discovered via `.claude-plugin/marketplace.json` and installed as `<name>@claudefiles`. Setup merges `extraKnownMarketplaces` and `enabledPlugins` into `settings.json` — Claude Code handles the actual plugin installation on next startup.

Git configuration (`dotfiles/`) is installed separately via `/gitconfig`.

### Settings merge

`settings.json` is a reference file showing the final structure. The manifest's `settings` section uses template variables (`{{sound_player}}`) resolved at install time based on platform detection.

## Conventions

- Every skill has a `SKILL.md` with YAML frontmatter (`name`, `description`)
- Every command has a `.md` with YAML frontmatter (`name`, `allowed-tools`, `description`)
- Every hook script has a YAML-style documentation header in comments
- Large skills use `references/` subdirectories for progressive disclosure — keep the entry SKILL.md lean
- Sounds are `.wav` files in `sounds/`

## Skills

Global skills are at `~/.claude/skills/`. Always run:
`find ~/.claude/skills -name "SKILL.md"`
before starting any task to discover available skills.

## Agent Routing

When the user's request matches a row below, launch the Agent tool with the corresponding `subagent_type`:

| User needs... | Use `subagent_type` |
|---|---|
| "plan this feature", implementation planning | `planner` |
| code review, after writing code | `code-reviewer` |
| "adversarial QA", "find bugs", thin test coverage | `qa-specialist` |
| "codebase research", "feasibility analysis" | `researcher` |
| "architecture docs", "onboarding overview" | `architect` |
| "check for duplication", "convention drift" | `integration-reviewer` |
| "enrich this issue", "missing acceptance criteria" | `issue-refiner` |
| "database query audit", "N+1 queries", "missing indexes" | `db-auditor` |
| "dependency audit", "check for CVEs", before release | `dep-auditor` |
| "accessibility audit", "a11y review" | `ui-auditor` |
| "live browser QA", test via Playwright | `browser-qa-agent` |
| "visual regression", before/after screenshots | `visual-diff` |
| "secure code review", "security audit", "check for vulnerabilities" | `code-reviewer` |
| "SLOs", "error budgets", "observability" | `engineering-sre` |
| "React/Vue/Angular", "frontend performance" | `engineering-frontend-developer` |
| "PySpark pipeline", "Delta Lake", "medallion architecture", "dbt models" | `engineering-data-engineer` |
| "FastAPI", "REST API", "backend service", "API endpoints" | `engineering-backend-developer` |
| "developer docs", "API reference", "tutorial" | `engineering-technical-writer` |
| "pre-ship gate", "visual verification before deploy" | `testing-reality-checker` |

### Immediate Agent Usage

No user prompt needed:
1. Complex feature requests — use **planner** agent
2. Code just written/modified — **MUST** run **code-reviewer** AND **integration-reviewer** in parallel before committing; exceptions: documentation-only changes or explicit user skip

## Not in scope (yet)

**Claudefiles spec** — a formal specification for the `claudefiles.yaml` manifest format (schema, validation, versioning, cross-repo compatibility). This would allow other people to create their own claudefiles repos with interoperable structure. Not tackling this yet, but it's a natural next step.

## Development

`.resource/` contains source materials (upstream repos, reference files). It is gitignored and not deployed. When adding content from `.resource/`, copy and adapt — don't symlink.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
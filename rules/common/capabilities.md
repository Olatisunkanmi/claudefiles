# Skill & Command Capabilities

**BLOCKING REQUIREMENT**: When a user request matches a trigger phrase below, you MUST invoke the corresponding skill or CLI tool **before** responding. Do NOT perform the task directly — dispatch to the skill. This applies even if you could answer inline.

## Intent Routing

<!-- NOTE: "specify" = define WHAT to build; "design" = define HOW to build it; "build" = implement it -->
<!-- NOTE: "brainstorm" = divergent idea generation; "research" = focused investigation -->

| User says something like... | Invoke |
|---|---|
| "what did we discuss", "continue where we left off", "remember when", "search my conversations", "what did we work on", "find the conversation where" | `/cm-recall-conversations` |
| "extract learnings", "save this for next time", "remember this pattern", "consolidate memories", "dream", "clean up memories" | `/cm-extract-learnings` |
| "analyze Claude token usage", "how much am I spending on Claude", "token insights", "cache hit rates", "cost optimization" | `/cm-get-token-insights` |
| "ship it", "commit push and PR" | `/mine.ship` |
| "commit and push" | `/mine.commit-push` |
| "create PR", "open pull request" | `/mine.create-pr` |
| "address PR comments", "fix review feedback", "fix failing CI", "resolve merge conflicts" | `/mine.address-pr-issues` |
| "show issue", "investigate this issue" | `/mine.issues` |
| "scan issues", "what issues are open" | `/mine.issues-scan` |
| "brainstorm options", "generate ideas", "explore ideas", "what are our options" | `/mine.brainstorm` |
| "challenge this", "challenge this design", "challenge this code", "poke holes in this", "what's wrong with this approach", "ask the critics", "see what the critics say", "run it by the critics" | `/mine.challenge` |
| "audit the codebase", "find tech debt", "health check" | `/mine.challenge` |
| "research adding X", "feasibility study", "evaluate approach" | `/mine.research` |
| "prior art", "how do others do this", "what patterns exist", "industry standards for X" | `/mine.prior-art` |
<!-- NOTE: "design this UI" = visual direction (i-teach-impeccable); "design this change" = architecture doc (design) -->
| "mockup this UI", "show me what it looks like", "HTML mockup", "UI preview", "generate a mockup" | `/mine.mockup` |
| "visual QA", "screenshot review", "review the UI visually", "take screenshots and find issues", "UX review" | `/mine.visual-qa` |
| "audit permissions", "reduce permission prompts" | `/mine.permissions-audit` |
| "status", "where am I", "quick summary" | `/mine.status` |
| "prepare to compact", "running low on context" | `/mine.pre-compact` |
| "evaluate this repo", "should I use this library" | `/mine.eval-repo` |
| "mutation test", "do my tests actually catch bugs" | `/mine.mutation-test` |
| "find tool gaps", "session archaeology", "missing cli features" | `/mine.tool-gaps` |
| "grill me on this", "poke holes in my idea", "help me think this through", "what am I not thinking about" | `/mine.grill` |
| "interview this idea", "spec this out", "help me define what I want to build", "interviewer" | `/mine.specify` |
| "specify this feature", "write a spec", "define requirements" | `/mine.specify` |
| "build this", "implement this", "make this change", "start a feature" | `/mine.build` |
| "design this change", "write a design doc", "investigate before planning" | `/mine.design` |
| "draft a plan", "create work packages", "generate WPs" | `/mine.draft-plan` |
| "review this plan", "check the plan", "plan review" | `/mine.plan-review` |
| "execute the plan", "orchestrate implementation", "start executing" | `/mine.orchestrate` |
| "review the implementation", "post-implementation review" | `/mine.orchestrate` (impl-review runs automatically in Phase 3) |
| "move WP to doing", "WP status", "kanban" | `/mine.wp` |
| "archive completed specs", "clean up old WPs", "remove working documents", "one-time cleanup of design files" | `spec-helper archive --all` |
| "review my changes", "run the reviewers", "code and integration review" | `/mine.review` |
| "create a skill", "write a skill", "new skill" | `/mine.write-skill` |
| "rebase this worktree", "sync worktree to parent branch" | `/mine.worktree-rebase` |
| "audit this UI", "frontend quality", "full UI audit", "design audit" | `/i-audit` |
| "critique this UI", "design critique", "review this interface", "does this look AI-generated" | `/i-critique` |
| "fix the typography", "improve the type", "font choices" | `/i-typeset` |
| "fix the colors", "color system", "palette needs work" | `/i-colorize` |
| "fix the layout", "arrange this", "visual hierarchy" | `/i-arrange` |
| "too busy", "too noisy", "reduce visual clutter" | `/i-quieter` |
| "make it bolder", "more distinctive", "too generic" | `/i-bolder` |
| "polish this UI", "final pass", "pixel-perfect" | `/i-polish` |
| "add animations", "motion design", "transitions" | `/i-animate` |
| "responsive design", "make it mobile-friendly", "adapt for mobile" | `/i-adapt` |
| "improve the copy", "error messages are confusing", "UX writing" | `/i-clarify` |
| "add delight", "make it more fun", "moments of joy" | `/i-delight` |
| "too complex", "simplify this UI", "strip it down" | `/i-distill` |
| "extract components", "consolidate patterns", "build a design system" | `/i-extract` |
| "production hardening", "handle edge cases in UI", "make it resilient" | `/i-harden` |
| "normalize the design", "make it consistent", "align with design system" | `/i-normalize` |
| "improve onboarding", "empty states", "first-run experience" | `/i-onboard` |
| "optimize frontend performance", "improve load time", "fix rendering" | `/i-optimize` |
| "design this UI", "design this dashboard", "look and feel", "establish design tokens", "plan the look and feel", "UI planning", "design system for this project", "craft the interface" | `/i-teach-impeccable` |
| "setup impeccable", "design context setup", "teach impeccable" | `/i-teach-impeccable` |

## CLI Tools

Purpose-built scripts in `~/.local/bin/`. **Use these instead of raw shell commands.** Run `<tool> --help` for full usage.

| User says something like... | Run |
|---|---|
| "view issue", "create issue", "list issues", "edit issue" | `gh-issue` |
| "run gh-pr-create", "create PR with bot token" | `gh-pr-create` |
| "list PR threads", "unresolved comments" | `gh-pr-threads` |
| "reply to PR comment", "respond to review" | `gh-pr-reply` |
| "resolve PR thread", "mark thread resolved" | `gh-pr-resolve-thread` |
| "rename tmux session", "new tmux session" | `claude-tmux` |
| "what did I work on yesterday", "find that session" | `claude-log` |
| "merge settings", "apply settings" | `claude-merge-settings` |
| "default branch name" | `git-default-branch` |
| "branch commit history" | `git-branch-log` |
| "branch diff stats", "what changed on this branch" | `git-branch-diff-stat` |
| "changed files on this branch", "branch diff file names" | `git-branch-diff-files` |
| "base branch", "what branch did this come from" | `git-branch-base` |
| "detect git platform", "github or ado" | `git-platform` |
| "validate agent files", "check skill schema" | `agnix-check` |
| "cancel builds", "cancel pipeline runs", "list ADO builds" | `ado-builds` |
| "build logs", "CI logs", "why did the build fail" | `ado-logs` |
| "create ADO PR", "list ADO PRs", "show ADO PR" | `ado-pr` |
| "list ADO PR threads", "reply to ADO PR comment" | `ado-pr-threads` |

### GitHub tool notes

- **Bot-token auth**: All five `gh-*` tools silently upgrade to bot identity when `gh-app-token` is installed and `GITHUB_APP_ID` is set. Falls back to your personal token otherwise.
- **Thread workflow**: Run `gh-pr-threads --json <pr>` → extract `.id` fields (`PRRT_...` values) → pass to `gh-pr-reply --resolve` or `gh-pr-resolve-thread`.
- **gh-pr-threads**: Auto-detects PR from current branch when no number given. Handles 100+ threads with internal pagination.
- **gh-pr-reply --resolve**: Combines reply and resolve in one call — preferred over separate steps.


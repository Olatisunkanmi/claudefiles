---
name: mine.ship
description: "Use when the user says: \"ship it\" or \"commit push and PR\". Commits, pushes, and creates a PR in one step."
user-invocable: true
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Default branch: !`git-default-branch`
- Remote URL: !`git remote get-url origin 2>/dev/null`

## Your task

Ship the current changes: commit, push, and open a PR. Follow each phase in order.

### Phase 1 — Commit & Push

Follow **all steps in `mine.commit-push`** exactly (read `skills/mine.commit-push/SKILL.md` and execute its full workflow). When that phase completes successfully — changes committed and pushed — continue to Phase 2 below.

`mine.commit-push` handles: branch creation, commit scope check, changelog, code review loop, integration review, local verification (tests + linting + test presence check), staging, committing, pushing, and WP archival reminder.

### Phase 2 — Create PR

11. **Detect platform** by running `git-platform`. If output is `unknown`, inform the user the platform is unsupported and stop. If `github`, use `gh` CLI. If `ado`, use `az` CLI.
12. Check if a PR already exists for this branch:
    - **GitHub**: `gh pr list --head <branch-name>`
    - **Azure DevOps**: `az repos pr list --source-branch <branch-name> --status active`
13. Analyze ALL commits in the branch (not just the latest): run `git-branch-log` (uses closest remote branch as base)
14. Run `git-branch-diff-stat` to see all code changes summary
15. Read key modified files if needed for additional context
16. Draft a comprehensive PR:
    - Title: < 70 characters, summarize the change
    - Body format:
      ```markdown
      ## Summary
      <1-3 bullet points explaining what changed and why>

      ```
17. Create the PR as a **draft**:
    - Run `get-skill-tmpdir mine-pr` to create a temp directory, then write the PR body to `<dir>/body.md` and use that path in subsequent commands
    - **GitHub**:
      ```bash
      gh-pr-create --draft --title "..." --body-file <tmpfile>
      ```
    - **Azure DevOps**: Read the body file content using the Read tool, then pass it as a literal string argument:
      ```bash
      az repos pr create --draft true --title "..." --description "<body content>" --source-branch <branch> --target-branch <default-branch>
      ```
      Do NOT use `--description "$(cat <tmpfile>)"` — command substitution is broken in the Bash tool eval wrapper.
18. **Update CHANGELOG with PR number**: If a `CHANGELOG.md` exists (use the one closest to the current working directory if multiple exist — not necessarily the repo root):
    - Extract the PR number from the PR URL
    - Use the platform-appropriate prefix for the PR reference:
      - **GitHub**: `#` (e.g., `(#123)`) — links to the PR
      - **Azure DevOps**: **!** prefix (e.g., `(!123)`) — links to the PR (`#` would link to a work item instead)
    - Determine the PR base branch from the platform API:
      - **GitHub**: `gh pr view --json baseRefName --jq '.baseRefName'`
      - **Azure DevOps**: `ado-pr show --json | jq -r '.targetRefName' | sed 's|refs/heads/||'`
    - Use `git diff origin/<base>...HEAD -- <changelog-path>` to identify lines added in this branch (use the path discovered in step 18, not a hardcoded `CHANGELOG.md`)
    - For each newly added changelog entry line (lines starting with `- `) that does not already contain a PR reference (`(#...)` or `(!...)`), append ` (#<PR_NUMBER>)` for GitHub or ` (!<PR_NUMBER>)` for Azure DevOps to the end of the line
    - Commit with message: e.g., `changelog: add PR #<NUMBER>` for GitHub or `changelog: add PR !<NUMBER>` for Azure DevOps
    - Push
    - If no `CHANGELOG.md` exists, suggest to the user that they add one to track notable changes per release
19. **Mark PR as ready** (reviewers see the final state with changelog PR numbers already in place):
    - **GitHub**: `gh pr ready`
    - **Azure DevOps**: `az repos pr update --id <PR_ID> --draft false`
20. Return the PR URL. (WP archival reminder already runs as part of mine.commit-push in Phase 1.)

**Important:**
- If a PR already exists, show the PR URL and do not create a duplicate
- Always write the PR body to a temp file and use `--body-file` (GitHub) to avoid command substitution
- Focus on the "why" rather than the "what" in the summary

**Azure DevOps notes:**
- Infer org, project, and repo from the remote URL where possible (e.g., `https://dev.azure.com/{org}/{project}/_git/{repo}`)
- Do not use `--auto-complete` or `--delete-source-branch` flags — just create the PR
- The `az repos pr create` command returns JSON; extract the PR URL from the response

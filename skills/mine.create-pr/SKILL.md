---
name: mine.create-pr
description: "Use when the user says: \"create PR\" or \"open pull request\". Reviews branch changes and creates a PR on GitHub or Azure DevOps."
user-invocable: true
---

## Context

- Current branch: !`git branch --show-current`
- Default branch: !`git-default-branch`
- Remote URL: !`git remote get-url origin 2>/dev/null`
- Commits in this branch: !`git-branch-log`
- Full diff summary: !`git-branch-diff-stat`

## Your task

Based on the above changes:

1. **Detect platform** by running `git-platform`. If output is `unknown`, inform the user the platform is unsupported and stop. If `github`, use `gh` CLI. If `ado`, use `az` CLI.
2. Verify the branch is pushed to remote (check `git status` to ensure no "Your branch is ahead" or "not yet pushed" messages)
3. Check if a PR already exists for this branch:
   - **GitHub**: `gh pr list --head <branch-name>`
   - **Azure DevOps**: `az repos pr list --source-branch <branch-name> --status active`
4. Analyze ALL commits in the branch (not just the latest) using `git log`
5. Use `git diff [base-branch]...HEAD` to see all code changes
6. Read key modified files if needed for additional context
7. Draft a comprehensive PR:
   - Title: < 70 characters, summarize the change
   - Body format: group changes by topic. For each logical area with multiple related changes, use an `### H3` header followed by bullet points. Order sections from most to least impactful. Bullets should explain *why* a change was made, not just *what* changed — include motivation, tradeoffs, or decisions worth preserving for future readers. Exception: if the PR includes changes to `./design/` (ADRs, design docs, decision records), don't re-explain that reasoning in the PR body — just reference the document (e.g., "see `design/adr-012-auth-approach.md`"). Duplicating it risks going stale or conflicting. Collect small, standalone changes (one-liners that don't warrant their own section) into one or two ungrouped sections:
     - **`### Notable Changes`** (top) — small but important changes worth seeing first
     - **`### Housekeeping`** (bottom) — minor cleanup, dependency bumps, typo fixes, etc.
     - Use both if needed, one if all small changes fall into the same category, or neither if everything fits under a topic header.
     - Example shape (all sections present):
     ```markdown
     ### Notable Changes
     - Important small change and why it matters

     ### Feature name or area
     - What changed and why this approach was chosen over alternatives
     - Any tradeoff or decision future readers should know about

     ### Another significant area
     - Change detail with motivation

     ### Housekeeping
     - Bump dependency X to v2
     - Fix typo in README
     ```
   - **Closing issues** (GitHub only): Detect any issue this PR resolves and append a closing keyword on its own line at the end of the body. Check two sources in order:
     1. **Branch name** — look for a leading or embedded issue number in the current branch. Common patterns (extract `N`):
        - `N-description` (e.g., `123-fix-null`)
        - `issue-N` or `issue/N`
        - `fix/N-description`, `feat/N-description`, `chore/N-description`, etc.
     2. **Commit messages** — scan `git log` output for GitHub closing keywords followed by an issue number (e.g., `Fixes #123`, `Closes #123`, `Resolves #123`). Do NOT match generic references like `refs #123` — those do not close issues.
     - If an issue number is found from either source, append to the PR body:
       ```
       Closes #N
       ```
     - If multiple distinct issue numbers are found, append one `Closes #N` line per issue.
     - Skip this step entirely for Azure DevOps (ADO uses a different work-item linking syntax).
8. Create the PR as a **draft**:
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
9. **Update CHANGELOG with PR number**: Locate the nearest `CHANGELOG.md` using the ancestor-walk algorithm: walk upward from the current working directory one level at a time toward the repo root, checking each directory for `CHANGELOG.md` — the first one found is the nearest. If none found by walking up, run `git ls-files '*CHANGELOG.md'` and pick the result with the shortest relative path from CWD. If no `CHANGELOG.md` exists anywhere, suggest the user add one. Once located:
   - Extract the PR number from the PR URL
   - Use the platform-appropriate prefix for the PR reference:
     - **GitHub**: `#` (e.g., `(#123)`) — links to the PR
     - **Azure DevOps**: **!** prefix (e.g., `(!123)`) — links to the PR (`#` would link to a work item instead)
   - Determine the PR base branch from the platform API:
     - **GitHub**: `gh pr view --json baseRefName --jq '.baseRefName'`
     - **Azure DevOps**: `ado-pr show --json | jq -r '.targetRefName' | sed 's|refs/heads/||'`
   - Use `git diff origin/<base>...HEAD -- <changelog-path>` to identify lines added in this branch
   - For each newly added changelog entry line (lines starting with `- `) that does not already contain a PR reference (`(#...)` or `(!...)`), append ` (#<PR_NUMBER>)` for GitHub or ` (!<PR_NUMBER>)` for Azure DevOps to the end of the line
   - Commit with message: e.g., `changelog: add PR #<NUMBER>` for GitHub or `changelog: add PR !<NUMBER>` for Azure DevOps
   - Push
   - If no `CHANGELOG.md` exists, suggest to the user that they add one to track notable changes per release
10. **Mark PR as ready** (reviewers see the final state with changelog PR numbers already in place):
    - **GitHub**: `gh pr ready`
    - **Azure DevOps**: `az repos pr update --id <PR_ID> --draft false`
11. Return the PR URL. If step 12 produced archival guidance, include it in the same response after the URL.
12. **WP ARCHIVAL REMINDER:** If `design/specs/` exists in the repo and `spec-helper` is available (`command -v spec-helper`), run `spec-helper archive --dry-run --json`. If any entries have `status: "would_archive"`, tell the user: "These specs are ready to archive: [list]. Run `spec-helper archive --all` to clean up tasks/ directories before merging." If none qualify, `design/specs/` doesn't exist, or `spec-helper` isn't installed, skip silently. Run this check before composing the final response in step 11.

You have the capability to call multiple tools in a single response. You should gather all necessary context first (steps 1-6), then create the PR in a single action. Do not create multiple PRs.

**Important:**
- If the branch is not pushed, inform the user they need to push first
- If a PR already exists, show the PR URL and do not create a duplicate
- Always write the PR body to a temp file and use `--body-file` (GitHub) to avoid command substitution
- Focus on the "why" rather than the "what" in the summary

**Azure DevOps notes:**
- Infer org, project, and repo from the remote URL where possible (e.g., `https://dev.azure.com/{org}/{project}/_git/{repo}`)
- Do not use `--auto-complete` or `--delete-source-branch` flags — just create the PR
- The `az repos pr create` command returns JSON; extract the PR URL from the response

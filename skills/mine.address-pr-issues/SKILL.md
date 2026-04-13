---
name: mine.address-pr-issues
description: "Use when the user says: \"address PR comments\", \"fix review feedback\", \"fix failing CI\", or \"resolve merge conflicts\". Triages and resolves PR blockers on GitHub or Azure DevOps."
user-invocable: true
---

# Address PR Issues

Triage and resolve everything blocking a PR from merging: unresolved review comments, merge conflicts, and failing CI checks. Works on both GitHub and Azure DevOps — detects the platform automatically.

## When to Activate

- User asks to address, fix, or review PR comments
- User asks to check for unresolved PR feedback
- User asks to fix failing CI or merge conflicts on a PR
- User says "address PR issues", "fix PR", "make this PR mergeable", or similar
- User mentions Copilot comments on a PR

## Usage

```
/mine.address-pr-issues [PR#]
```

If no PR number is given, auto-detect from the current branch.

## Phase 1: Fetch & Detect

### Platform detection

```bash
git-platform
```

Output is `github`, `ado`, or `unknown`. If `unknown`, tell the user the platform could not be detected from the git remote and stop.

### PR metadata

**GitHub:**
```bash
gh pr view {PR} --json number,title,url,baseRefName,headRefName,mergeable,mergeStateStatus,statusCheckRollup,isDraft,reviewDecision
```

If `mergeable` is `UNKNOWN`, retry up to 3 times with backoff (3s, 6s, 12s) — GitHub computes mergeability asynchronously. If still `UNKNOWN` after retries, warn the user and continue.

**ADO:**
```bash
ado-pr show {PR} --json
```

Returns `pullRequestId`, `title`, `status`, `sourceRefName`, `targetRefName`, `repository.webUrl`. URL: `repository.webUrl + "/pullrequest/" + pullRequestId`. Note: `mergeStatus` is optional and only present after a merge attempt.

### Review threads (MANDATORY — separate from metadata)

**CRITICAL**: `gh pr view --json` does NOT return review threads (inline comments from reviewers or Copilot). You MUST run the thread-fetching command below. Do not conclude "no review comments" based on PR metadata alone — that field doesn't exist in the metadata response.

**GitHub:**
```bash
gh-pr-threads {PR} --json --all
```

Returns all threads (resolved + unresolved) as JSON with `id`, `isResolved`, `isOutdated`, `path`, `line`, `startLine`, `diffSide`, and `comments` including `databaseId`, `body`, `author.login`, `author.__typename`.

**ADO:**
```bash
ado-pr-threads list {PR} --json
```

Returns all threads as JSON. Threads with `threadContext` are inline comments; threads without are general conversation. ADO has no `isOutdated` concept.

### General PR comments

**GitHub:** `gh pr view {PR} --json comments` — extract actionable non-inline comments.

**ADO:** Already in the thread list — threads without `threadContext` are general comments.

### CI status

**GitHub:** From `statusCheckRollup` in metadata. Filter for `conclusion` in `FAILURE`, `TIMED_OUT`, `ACTION_REQUIRED`.

**ADO:**
```bash
az repos pr policy list --id {PR_ID} -o json
```

Filter for `status` in `rejected`, `broken`.

### Pre-flight warnings

Check and display as informational warnings (NOT blockers):
- **isDraft** (GitHub) — "This is a draft PR. Changes can be made but it won't be mergeable until marked Ready for Review."
- **reviewDecision == CHANGES_REQUESTED** (GitHub) — "Reviewer requested changes. Even after fixing all comments, they'll need to re-approve."

## Phase 2: Triage & Plan

Categorize all issues into three groups: **review comments**, **merge conflicts**, **CI failures**.

### Review comments

**Prerequisite**: This section requires the `gh-pr-threads` / `ado-pr-threads` output from Phase 1. If you skipped that step, go back and run it now before triaging.

**Exclude resolved threads:** GitHub `isResolved: true`, ADO `status != "active"`.

**Triage outdated threads (GitHub only):** For each thread with `isOutdated: true`:
1. Read the comment body to understand the concern
2. Read the current code at that location
3. If the location was entirely deleted: auto-categorize as "location removed — likely addressed by refactoring"
4. If the concern is addressed: categorize as "already addressed" ONLY if you can cite the specific line that addresses it
5. Otherwise: categorize as "needs manual review"

Do NOT blanket-exclude outdated threads. Do NOT confidently dismiss concerns without citing evidence.

**General comment assessment:** For non-inline comments, determine if actionable vs. discussion/approval/acknowledgment. Include only actionable, unaddressed comments.

**Already-addressed detection:** For each unresolved thread, read the current code at the referenced location and compare against what the reviewer requested. If already present, categorize as "already addressed."

### Assign investigation depth

For each issue, assign a depth based on the comment's nature:

| Comment type | Depth | Description |
|---|---|---|
| Rename, docstring, formatting, typo | `light` | Skip call-site investigation |
| Logic change, bug fix, error handling | `medium` | Read call sites, understand usage |
| Architectural concern, design pattern, API contract | `deep` | Read all callers, tests, adjacent modules |

### Group logically

Group related comments for efficient execution — e.g., all error-handling comments together, all comments on a single feature together.

### Merge conflicts

**GitHub:** `mergeable == "CONFLICTING"` or `mergeStateStatus == "DIRTY"`
**ADO:** `mergeStatus == "conflicts"` (if present)

### CI failures

Fetch failure logs and categorize: test failures, lint/type errors, build errors, other.

**GitHub:** `gh run view <run-id> --log-failed`
**ADO:** `ado-logs errors --build-id <build-id>` — fetches and filters failure logs. Run `ado-logs --help` for full usage.

### Present the plan

Show a numbered plan with:
- Each issue, its proposed action, and investigation depth
- Resolution policy per thread (resolve vs reply-only — see Phase 3)
- Pre-flight warnings from Phase 1

```
AskUserQuestion:
  question: "Here's my plan for PR #{N}. Review and skip any items you don't want me to address."
  header: "PR Plan"
  multiSelect: false
  options:
    - label: "Looks good — address all"
      description: "Proceed with the full plan as shown"
    - label: "Skip specific items"
      description: "I'll tell you which items to skip"
    - label: "Cancel"
      description: "Exit without making changes"
```

If "Skip specific items": follow-up asking which numbered items to skip.

### Merge conflict strategy

If conflicts exist, ask the user:

```
AskUserQuestion:
  question: "Merge conflicts detected. How should I resolve them?"
  header: "Conflicts"
  options:
    - label: "Merge (Recommended)"
      description: "git merge origin/<base> — creates a merge commit, preserves history"
    - label: "Rebase"
      description: "git rebase origin/<base> — rewrites history, requires force-push"
```

## Phase 3: Execute

### Create temp directory

```bash
get-skill-tmpdir mine-address-pr
```

### Fix each logical group (serial)

For each group from the plan, launch a **general-purpose subagent** with:
- The review comment(s) to address (bodies, file paths, line numbers)
- The investigation depth (`light`, `medium`, or `deep`)
- Output path: `<tmpdir>/group-N/result.md`

**Subagent prompt template:**

> You are addressing PR review feedback. Your output goes to `{output_path}`.
>
> **Comments to address:**
> {comment_details}
>
> **Investigation depth: {depth}**
>
> If `light`: Read the target file. Apply the fix. Run the project's test suite. If tests fail: fix or escalate. Max 3 retries.
>
> If `medium`: Read the target file fully. Grep for call sites of the function/class being modified. Read at least one call site to understand usage. Apply the fix. Run the project's test suite (follow the test execution discovery order from `rules/common/testing.md`). If tests fail: fix the code. Max 3 retries, then escalate to user.
>
> If `deep`: Read the target file fully. Grep for call sites — read ALL callers. Read related test files. Read adjacent modules in the same package/directory. Apply the fix. Run the project's test suite. If tests fail: fix or escalate. Max 3 retries.
>
> **CRITICAL**: Never explain away a test failure or CI error. If tests fail after your fix, the fix is wrong — revise it. Do not suggest the test is outdated, flaky, or testing the wrong thing. Do not suggest skipping or marking the test as expected failure. Fix the code until tests pass, or escalate to the user after 3 attempts.
>
> Write a one-line summary as the first line of your output file, then details below.

Read only the **first line** of each result file for the summary — do not read full subagent output into main context.

### Code review loop

After all subagents complete:

1. Run **code-reviewer** agent on modified files
2. For each CRITICAL or HIGH finding: auto-fix when unambiguous, defer to user when judgment is needed
3. If any auto-fixes applied, re-run **code-reviewer** (max 3 iterations)
4. Stop when no CRITICAL/HIGH issues remain or 3 iterations reached
5. Run **integration-reviewer** once on the final diff

Do NOT commit until both reviewers pass. If CRITICAL/HIGH findings remain after 3 iterations, present them to the user before proceeding.

### Commit and push

Commit **per logical group** with descriptive messages:
```
fix(auth): use logging instead of print per review
fix(config): add LOGIN_REDIRECT_URL to test settings
```

Push once after all commits.

### Thread replies and resolution

After push is confirmed, reply to threads. For each addressed thread:

1. **Idempotency check:** Search the thread's comment history (fetched in Phase 1) for ANY comment containing `<!-- addressed-pr-issues -->`. If found, skip the reply.
2. **Post reply** with the `<!-- addressed-pr-issues -->` marker in the body. Keep replies concise and professional:
   - Code change: "Fixed — [brief description of what was changed]. <!-- addressed-pr-issues -->"
   - Already addressed: "This was addressed in a previous commit — [cite specific evidence]. <!-- addressed-pr-issues -->"
   - Outdated/removed: "The code at this location was refactored and this concern no longer applies. <!-- addressed-pr-issues -->"
3. **Resolve per policy:**

| Thread author | Action |
|---|---|
| Bot | Reply + resolve |
| Human reviewer | Reply only — reviewer resolves after verifying |
| PR author (self-review) | Reply + resolve |

**Bot detection:**
- **GitHub:** `author.__typename == "Bot"` is the primary signal. Fall back to `[bot]` suffix check on `author.login` if `__typename` is unavailable.
- **ADO:** Check for `[bot]` suffix on `author.uniqueName`. Also check if `uniqueName` matches service account patterns (no `@` domain, or matches the project's build service identity).

**GitHub resolution:** Use `gh-pr-reply {PR} {comment-database-id} "{body}" --resolve {thread-id}` for combined reply+resolve.

**ADO resolution:** Two calls: `ado-pr-threads reply {PR} {thread-id} "{body}"` then `ado-pr-threads resolve {thread-id} --pr {PR}`.

**Rate limiting:** 1-second delay between mutative API calls.

## Phase 4: Summary

Present a structured summary:

```
## Summary

### Review Comments
- Resolved (bot threads): N threads [replied & resolved]
- Replied (human threads): M threads [reply posted, awaiting reviewer]
- Already addressed: K threads [replied]
- Skipped: J threads [reason]

### Merge Conflicts
- Resolved: N files — [merge/rebase] origin/<base> into <head>

### CI Failures
- Fixed: N checks — [brief description of each fix]
- Still pending: CI will re-run on push

### Commits
- [list each commit with its message]

### Needs Manual Review
- [any items that could not be resolved automatically]
```

## Helper Scripts

**IMPORTANT**: Use these helper scripts instead of inline commands. They handle authentication, pagination, and output formatting.

- **GitHub**: `gh-pr-threads`, `gh-pr-reply` (with `--resolve`), `git-platform` — run `--help` on each for usage
- **ADO**: `ado-pr`, `ado-pr-threads` (list/reply/resolve), `ado-logs` (CI failure logs) — run `--help` on each for usage
- **Platform**: `git-platform` — prints `github`, `ado`, or `unknown`

### Error handling

- Auth failures: suggest `gh auth login` (GitHub) or `az login` (ADO)
- Rate limiting: inform user and suggest waiting
- No PR found: ask user for a PR number
- GitHub GraphQL permissions: suggest `gh auth refresh -s repo`

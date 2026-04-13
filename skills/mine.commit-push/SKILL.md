---
name: mine.commit-push
description: "Use when the user says: \"commit and push\". Commits and pushes changes to the current branch."
user-invocable: true
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`

## About this skill

This skill handles the shared "commit & push with quality gates" phase. It can be used standalone (when the user asks to commit and push) and is also used as Phase 1 of `mine.ship`. Compared to `mine.ship`, it omits the PR creation phase but includes the same code quality gates (code review, integration review, tests, linting) and pre-commit checks (test presence, WP archival).

## Your task

Based on the above changes:

1. If on the default branch (run `git-default-branch` to check), create a new branch first.
2. **COMMIT SCOPE CHECK:** Review the diff for unrelated changes that belong in separate commits (e.g., a feature + an unrelated bug fix, or a config change mixed with new functionality). If the changes clearly span distinct concerns, **ask the user** whether to split them into separate commits before proceeding. If the changes are all part of one logical unit of work, continue.
3. **CHANGELOG CHECK (mandatory — never skip this step):** Locate the nearest `CHANGELOG.md` using this algorithm: walk upward from the current working directory one level at a time toward the repo root, checking each directory for `CHANGELOG.md` — the first one found is the nearest, use it. If no `CHANGELOG.md` is found by walking up, run `git ls-files '*CHANGELOG.md'` to find any changelogs elsewhere in the repo and pick the one with the shortest relative path from CWD. If none exist anywhere, skip this step. Use the Read tool on the specific path identified — do NOT treat a failed read of `./CHANGELOG.md` as proof that no changelog exists. Once read, decide whether the changes deserve a changelog entry:
   - **Update silently** for: new features, user-facing bug fixes, behavior changes, new integrations, breaking changes.
   - **Skip silently** for: fixing tests, lint/format cleanup, internal refactoring with no behavior change, code comments/docstrings, typo fixes in code.
   - **Ask the user** if you're unsure — e.g., a mix of internal and user-facing changes, or changes that could be described either way.
   - If updating, **match the existing changelog structure**: read the file to determine whether it uses `## [Unreleased]` sections or date-based sections (`## YYYY-MM-DD`). Add entries under the appropriate heading — either the existing `[Unreleased]` section or today's date section (creating it if needed). Keep them **high-level and terse** — one bullet per change, two at most. These are **user-facing** entries; describe what changed for the user, not implementation details.
   - If you need to ask, do so **before** proceeding to step 4.
4. **CODE REVIEW LOOP (skip for documentation-only changes):** Run the `code-reviewer` agent on the current changes. For each finding:
   - **Auto-fix** when the correct solution is unambiguous: clear bugs, logic errors, missing type annotations, unambiguous style violations, simple security issues with a well-known fix
   - **Defer to the user** when the fix requires business logic decisions, architectural judgment, or context you don't have — present the finding and ask before proceeding

   After applying fixes, re-run `code-reviewer` and repeat until no CRITICAL or HIGH issues remain or only LOW/noise is left. If the same CRITICAL or HIGH findings appear again and cannot be auto-fixed, defer to the user — do not proceed to commit.
5. **INTEGRATION REVIEW (skip for documentation-only changes):** Run `integration-reviewer` once on the final state of the changes (after the code-reviewer loop). Address any CRITICAL or HIGH findings; defer ambiguous ones to the user.
6. **LOCAL VERIFICATION (skip for documentation-only changes):**
   1. Determine the project's test command using the test execution discovery order from `rules/common/testing.md`
   2. **TEST PRESENCE CHECK (skip if sub-step 1 found no test command — this signals the repo has no test infrastructure. Also skip for changes exempt per the Test Co-location rule in `testing.md`):**
      Review the branch diff (`git diff --name-only` against the default branch). If the diff contains new or changed source files but zero changes in test files (no files matching common test patterns like `test_*`, `*_test.*`, `*_spec.*`, `__tests__/`), mention this to the user and ask whether to proceed or stop to write tests.
      This is advisory, not a hard block — the user decides.
   3. Run the test suite locally. If tests fail, fix the issues and re-run (max 3 iterations). If still failing after 3 attempts, stop and present the failures to the user.
   4. Run the project's linter if configured (e.g., `ruff check` for Python, `eslint` for JS). Fix any issues.
   5. Only proceed to staging once both pass.
7. Stage all relevant files (including CHANGELOG.md if updated).
8. For multi-line commit messages, run `get-skill-tmpdir mine-commit` to create a temp directory, then write the message to `<dir>/message.md` and run `git commit -F <dir>/message.md`. For simple one-line messages, `git commit -m "..."` is fine. Do NOT use `git commit -m "$(cat <<'EOF'...)"` — command substitution triggers extra permission prompts.
9. Push the branch to origin (use `-u` flag only if you just created a new branch).
10. You MUST do steps 7–9 in a single message. Include the Write call for the commit message file (if needed) in that same message. Do not use any other tools or do anything else besides these tool calls.
11. **WP ARCHIVAL REMINDER:** If `design/specs/` exists in the repo and `spec-helper` is available (`command -v spec-helper`), run `spec-helper archive --dry-run --json`. If any entries have `status: "would_archive"`, tell the user: "These specs are ready to archive: [list]. Run `spec-helper archive --all` to clean up tasks/ directories before merging." If none qualify, `design/specs/` doesn't exist, or `spec-helper` isn't installed, skip silently.

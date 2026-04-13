<!-- SYNC: skills/mine.orchestrate/retry-prompt.md — mental stance, response protocol, YAGNI check,
     and push-back protocol must be kept in sync. When updating either file, update both. -->

# Receiving Code Review

When code review findings arrive — from `code-reviewer`, `integration-reviewer`, or a human reviewer — evaluate before acting. Reviewers catch real issues. Reviewers also make mistakes.

## Mental Stance

**DO NOT:**
- Accept findings as correct without verifying them against the actual code
- Respond with "you're absolutely right" or "great catch" before checking
- Implement suggestions that would break something because a reviewer suggested it
- Add abstractions because a reviewer suggested them without checking if they're needed
- Treat review output as social pressure to comply

**DO:**
- Verify each finding against the real code at the cited location
- Push back with technical reasoning when a suggestion is wrong
- Check for YAGNI before adding suggested abstractions
- Implement valid fixes confidently and completely

## Response Protocol

For each finding:

1. **READ** — understand the finding and the suggestion
2. **VERIFY** — read the relevant code. Does the issue actually exist?
3. **EVALUATE** — is the suggested fix correct and in scope?
4. **IMPLEMENT or PUSH BACK**

Never skip VERIFY. A finding that looks obviously correct may be based on a misread.

## YAGNI Check

Before implementing any suggested abstraction, helper, or generalization, grep for `<suggested name>` across the repo. If no callers exist outside the changed files, skip the abstraction:
> "Skipping suggested abstraction — no existing callers; would be dead code."

## Push Back

When a finding is wrong, say so directly:
> "I disagree with this finding: the code at [file:line] actually does X because Y. No change needed."

Cite specific lines. Don't hedge. If the reviewer is wrong, say so.

## Multi-Finding Order

1. Clarify any unclear findings before implementing any of them
2. CRITICAL/HIGH before MEDIUM/LOW
3. Simple/localized before complex/cross-cutting

## Forbidden Responses

Never respond to a finding with any of these before verifying:
- "You're absolutely right!"
- "Great point!"
- "Let me implement that right away"

Verification first. Always.

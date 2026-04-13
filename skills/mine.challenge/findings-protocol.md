<!-- manifest-protocol-version: 1 -->
<!-- Increment the protocol version above on any change to verb vocabulary,
     execution semantics, or manifest format. This is a maintainer changelog
     marker — not a runtime contract; no skill checks this value at runtime. -->

# Findings

When analysis skills produce findings, follow this convention for presenting and resolving them. This applies to skills that identify fixable issues — audit, challenge (standalone), visual-qa, tool-gaps, and similar. It does not apply to ideation skills like brainstorm, which manage their own output.

## Principle: All Findings Must Be Resolved

Every finding must be resolved — meaning fixed, filed as an issue, or explicitly deferred by the user. Do not guide the user toward shipping code with known unresolved findings. "File as issue" is not skipping — it's proper tracking for work that can't happen now. Explicit user deferral ("Skip") is valid — the principle prevents silent abandonment, not informed decisions.

**Exception — session-level opt-out before the resolution flow begins:** The Consent Gate "No" option is a pre-flow, session-level opt-out that occurs before the resolution manifest is generated; per-finding tracking is not yet applicable at that point, so a "No" at the Consent Gate is explicitly exempt from per-finding accounting.

## Presenting Findings

Every finding must include a **concrete recommendation** — not just what's wrong, but what to do about it. A finding without a recommendation is incomplete.

For findings with multiple valid approaches, present options:
- **Option A** is always the recommended approach, labeled with `(Recommended)`
- Additional options follow
- "File as issue" is always available as an option; recommend it when the fix is out of scope for this session

## Verb Vocabulary

One canonical table. Do not redefine these verbs elsewhere in rules or skill prose. (The manifest header is the one sanctioned exception — it displays the verb legend as a user-facing reference, not a definition.)

| Verb | Meaning | Applies to |
|---|---|---|
| `fix` | Auto-apply the `better-approach` or recommended option | Auto-apply findings; User-directed set by user |
| `file` | Create a GitHub issue via `gh-issue create` (batched at end of execution) | Any finding |
| `defer` | Record in session summary; take no action this session | TENSION findings, explicit user deferral |
| `skip` | Same as `defer` but for "not a real issue" | User override |
| `ask` | Emit one AskUserQuestion at execution time with options | User-directed findings where recommendation is absent or ambiguous |
| `A` / `B` / `C` | Apply the pre-selected option letter | User-directed findings with `options:` lists |

Note: `fix` on an Auto-apply finding applies the `better-approach` field; `fix` on a User-directed finding applies the `recommendation` field. These fields are mutually exclusive in the finding template — apply whichever is present.

**On `fix` semantics for User-directed findings**: `fix` on a User-directed finding is equivalent to applying the recommended option letter (e.g., if recommendation says "Option A", `fix` and `A` produce identical behavior). The Default Verb table uses the option letter as the default to make the pre-selection explicit for the user.

**On `ask` overuse**: `ask` is an execution-time fallback for genuinely unresolvable ambiguity. Overuse — especially as a default for many findings — partially restores the bundling behavior this manifest flow was designed to prevent. Skill authors should prefer concrete recommendations (letters) over `ask` wherever possible.

## Default Verb Selection

Pre-populate manifest verbs based on the finding's `severity:`, `resolution:`, and `recommendation:` fields.

**Evaluation order**: Evaluate rows in this order: (1) check severity for TENSION; (2) check resolution for Auto-apply; (3) check recommendation content for User-directed. First matching row wins. This prevents TENSION findings — whose recommendation field carries a deciding factor rather than an option letter — from being incorrectly classified as `ask`.

| Finding `severity:` | Finding `resolution:` | `recommendation:` field | Default verb |
|---|---|---|---|
| `TENSION` | (any) | (n/a) | `defer` |
| (any) | `Auto-apply` | (n/a) | `fix` |
| (any) | `User-directed` | Contains specific option letter (e.g., "Option A") | That letter (`A`) |
| (any) | `User-directed` | Absent or says "user must decide" / no clear letter | `ask` |

**Format-version 1 fallback**: If a finding lacks a `recommendation:` field entirely, default to `ask`. Write a header comment in the manifest: `<!-- Format-version 1 source — some findings defaulted to 'ask' due to missing recommendation field -->`.

## Resolution Manifest

The F<N> IDs correspond 1:1 to `## Finding N:` headings — Finding 1 → F1, Finding 2 → F2, etc. The "source findings list" is the ordered set of all `## Finding N:` blocks in the findings file.

The manifest is a markdown file at `<tmpdir>/resolutions.md`. The skill reuses the same `<tmpdir>` that holds the findings file — typically obtained via `get-skill-tmpdir` at the start of the skill. Place `resolutions.md` in the same directory as `findings.md`. Each finding gets a block:

```markdown
## F1: Finding title here
**Severity:** HIGH | **Type:** Fragility | **Raised by:** Critic Name (1/5)

**Problem:** What's wrong.

**Why it matters:** Consequence if left unfixed.

**Options:**
- **A** *(recommended)*: First option with full text
- **B**: Second option

**Why A:** One-sentence rationale.

**Verb:** A
```

The above is the **User-directed finding template**. Two additional templates apply for other finding types. The `**Verb:**` line is the only field the user edits in all templates.

**Auto-apply finding template:**
```markdown
## F1: Finding title here
**Severity:** HIGH | **Type:** Fragility | **Raised by:** Critic Name (1/5)

**Problem:** What's wrong.

**Why it matters:** Consequence if left unfixed.

**Better approach:** The specific change to apply.

**Verb:** fix
```

**TENSION finding template:**
```markdown
## F1: Finding title here
**Severity:** TENSION | **Type:** Structural | **Raised by:** Critic Name (1/5)

**Problem:** What's wrong.

**The disagreement:** Side A argues X because Y. Side B argues Z because W.

**Deciding factor:** Question or data point that would resolve the disagreement.

**Verb:** defer
```

The manifest header includes: brief usage instructions, the verb legend, a compaction-recovery pre-hash comment (`<!-- pre-hash: <sha256> -->`), and a visible safety-note blockquote. The blockquote is always included — it is a no-op for non-interactive/tertiary-fallback paths but important for interactive editor sessions with shadow-file autosave support:

> **:q! is safe** — your edits are autosaved to a shadow file every 2 seconds. Save normally or quit — your changes will be recovered.

The manifest must be placed in the skill's tmpdir (not a persistent location). The manifest editor tool writes its log to the same directory as the manifest. Do not pass a manifest path outside the tmpdir.

### Manifest Header Format

The header renders the verb legend and usage instructions for the user as a guide during editing. Example:

```markdown
<!-- pre-hash: <sha256sum of this file before editing> -->
<!-- Resolution Manifest — edit the **Verb:** line in each section, then save and close. -->
<!-- Valid verbs: fix | file | defer | skip | ask | A | B | C -->

| Verb | Meaning |
|---|---|
| `fix` | Apply the recommended fix (auto-apply findings) or the `recommendation:` option (user-directed) |
| `file` | Create a GitHub issue (batched at end of execution) |
| `defer` | Record in session summary; no action this session |
| `skip` | Same as defer but for "not a real issue" |
| `ask` | Prompt me at execution time with the finding's options |
| `A` / `B` / `C` | Apply the specified option letter |
```

The verb legend in the header is a user-facing reference copy only — the canonical definition remains the Verb Vocabulary table above.

## Consent Gate

Before the editor opens, ask once. **"Proceed Gate" is an alias for this gate** — it is the successor to the old Proceed Gate.

**Zero-findings guard**: If findings count is 0, skip the Consent Gate and emit instead: "No findings — the target looks clean. No manifest to review." Do not open the editor.

```
AskUserQuestion:
  question: "Found N findings (X CRITICAL, Y HIGH, Z MEDIUM, W TENSION). Ready to review the resolution manifest?"
  header: "Review findings"
  options:
    - label: "Yes — open editor (Recommended)"
      description: "Generate the manifest and open it in your editor"
    - label: "No — stop here"
      description: "I'll review findings and come back later"
```

The `X / Y / Z / W` counts in the question must match the actual severity breakdown from the findings file. Omit any severity category whose count is zero (e.g., "Found 5 findings (2 HIGH, 3 MEDIUM)" when there are no CRITICAL or TENSION findings).

Do not begin generating or opening the manifest before this prompt.

## Editor Session

Before invoking the manifest editor, compute the pre-hash and embed it in the manifest header:

1. **Compute sha256sum of the manifest file first** (before adding the pre-hash comment), using this portable command:

   ```
   sha256sum "$FILE" | cut -d' ' -f1 2>/dev/null || shasum -a 256 "$FILE" | cut -d' ' -f1
   ```

2. **Then append the `<!-- pre-hash: <sha256> -->` line** to the manifest header.

3. **During detection**, strip the `<!-- pre-hash: ... -->` line before computing post-hash for comparison, so both hashes reflect equivalent content.

The pre-hash comment is the compaction-safe recovery point — if context is compacted between launching the editor and receiving completion notification, the pre-hash can be recovered from the file rather than LLM context.

Before invoking the manifest editor, emit: "Generating the resolution manifest — your editor will open momentarily. Edit the **Verb:** lines and save. Return here when done."

The invoking skill calls the manifest editor tool and waits for completion; consult that tool's documentation for environment-specific behavior. This rule is mechanism-agnostic — environment-specific safety notes, fallback messaging, and signal vocabulary are emitted by the manifest editor tool itself rather than hard-coded here.

### Tertiary Fallback — No Editor Available

If the manifest editor signals that no interactive editor is available (e.g., exit code 2 from `bin/edit-manifest`), do not run Detection Logic immediately. Instead, emit the manifest path with instructions to the user and wait for them to signal completion via chat. When the signal arrives, re-read the manifest and proceed to Detection Logic.

**Canonical signal vocabulary** — the user may say any of the following to continue from the tertiary fallback:

- `done`
- `ready`
- `finished editing`
- `abandon` (cancels the session instead of proceeding)

## Detection Logic

The invoking skill runs this logic at notification receipt (or on synchronous return); findings.md defines the cases and actions.

**Exit code handling (primary signal):**

- `exit_code == 2` — tertiary fallback: the manifest editor could not launch an interactive session. Follow the tertiary-fallback row in the table below.
- `exit_code == 1` — invocation error: stop detection and report the error. Do not classify this as "no edits desired."
- `exit_code == 0` — editor launched and returned: proceed with hash-based detection below.

After a successful editor session ends, determine what happened:

```
pre_hash  = sha256(manifest without the <!-- pre-hash: --> line) captured before edit session
post_hash = sha256(manifest without the <!-- pre-hash: --> line) captured after edit session
shadow_exists = whether <manifest>.shadow exists
shadow_hash = sha256(<manifest>.shadow) if exists else post_hash
```

Read `pre_hash` from the `<!-- pre-hash: -->` comment embedded in the manifest header before the editor launched. Check whether the manifest file changed (`post_hash`) and whether a shadow file exists. Then apply the decision table below. Use the portable hash command from the Editor Session section.

Note: the manifest editor tool removes any stale shadow file at startup — `shadow_exists` reflects only the current editor session, not prior sessions.

| Condition | Meaning | Action |
|---|---|---|
| `exit_code == 2` (tertiary fallback) | No interactive editor environment | Emit manifest path + instructions; wait for user chat signal; on signal, re-read manifest and apply the hash-based detection rows below (no shadow file expected; compare `pre_hash` vs `post_hash` to determine whether edits were made). |
| `post_hash != pre_hash` | User explicitly saved | Proceed to Commit Gate |
| `post_hash == pre_hash` AND `!shadow_exists` | No edits ever typed | "Defaults look good — proceed with current verbs?" |
| `post_hash == pre_hash` AND `shadow_hash != post_hash` | Typed changes, did not save | "You had unsaved changes. Recover, abandon, or re-open?" |
| `post_hash == pre_hash` AND `shadow_hash == post_hash` | Edited then undid all changes | Same as "no edits ever" |

If the user picks "recover": copy the shadow file over the manifest and loop back to the Commit Gate.

## Manifest Validation Spec

Run after detection logic, before the Commit Gate prompt. On any failure, route back to the "Revise" path — never abort the session.

1. **Verb value check**: canonical vocabulary only. Case-insensitive, whitespace-trimmed.
2. **Finding ID check**: every `## F<N>:` section must correspond to a finding in the source findings list. IDs must also be sequential starting from F1 with no gaps beyond deleted rows. Non-sequential IDs that cannot be explained by deletion are a validation error — route to Revise.
3. **Option letter check**: if verb is `A`/`B`/`C`, that letter must exist in the finding's `options:` list.
4. **Deleted row handling**: if a finding section is missing, treat as `skip` with an explicit warning.
5. **Added content handling**: comments or blank lines added → silently ignored.
6. **Row count anomaly**: if manifest has fewer finding sections than source and delta can't be explained by deleted rows, surface a warning.
7. **Error routing**: on ANY validation failure, show the error inline and route to "Revise."

## Commit Gate

After detection confirms the manifest is ready:

```
AskUserQuestion:
  question: "Execute resolution manifest?"
  header: "Execute"
  options:
    - label: "Yes (Recommended)"
      description: "Run fix/file/A/B/etc. verbs. One prompt per 'ask' row during execution."
    - label: "Revise"
      description: "Re-open the editor for more changes"
    - label: "No"
      description: "Abandon for now — findings will not be resolved this session. The manifest file remains in the tmpdir for up to 7 days — to resume, say 'resume manifest at <path>' in a new session."
```

## Execution

### Phase 1 — Immediate verbs (in manifest order)

- `fix` on Auto-apply: apply `better-approach` directly, silently
- `fix` on User-directed: apply the recommended option, silently. (Equivalent to applying the corresponding option letter — see the "On `fix` semantics" note in the Verb Vocabulary section.)
- `fix` on TENSION: emit one AskUserQuestion presenting `side-a` and `side-b` as options with `deciding-factor` as context, then apply the chosen option — effectively treating `fix` on a TENSION finding as an `ask`. This handles the case where the user explicitly changed a TENSION finding's default verb from `defer` to `fix`.
- `A` / `B` / `C`: apply the specified option, silently
- `ask`: emit ONE AskUserQuestion with header `F{id} ({N}/{M})` where N/M is this `ask` verb's position among all `ask` verbs. Options are the finding's `options:` list PLUS "File as issue" PLUS "Skip". Apply chosen option immediately and continue.
- `defer` / `skip`: record in session summary, take no action

**Per-verb execution logging**: After each verb executes, append a log entry to `<tmpdir>/editor-log.md`:

```
{timestamp} verb_executed finding={id} verb={verb} result={applied|filed|ask-issued|deferred|skipped|error}
```

This is the primary debug artifact for verb execution — see the Observability section of design 015 for the original intent.

### Phase 2 — Batched `file` verbs

After all Phase 1 verbs, iterate `file` verbs and invoke `gh-issue create` for each. On single failure, continue with rest. Report: `"Filed N issues. M failed: <list>. Retry filing the failed ones?"`

### Phase 3 — Summary

Report: `"Executed: X fix, Y file, Z ask resolutions. Deferred/skipped: W."`

## Re-edit Loop Cap

5 iterations max. On the 6th revision attempt, switch to inline-display fallback mode:

> "You've revised the manifest 5 times. I'll display it inline here for final review instead of re-opening the editor. If you still need changes after that, tell me in chat."

Note: this cap is enforced by the LLM's in-context count and is not compaction-safe. If context is compacted between re-edit iterations, the count resets. The inline fallback at iteration 6 is harmless, and 5 re-edits is well beyond normal usage — treat this as behavioral guidance, not a hard guarantee.

## Skill-Specific Overrides

Some skills have post-finding interactions beyond fix/file (e.g., visual-qa offers "re-run with different viewport" and "read agent report"; tool-gaps has implement/issue/skip paths that don't fit the standard flow). These skills may present their own post-finding gate in place of — not in addition to — the Consent Gate (Proceed Gate). The skill's gate should still include fix and file-as-issue paths. Skills using the legacy Proceed Gate pattern should migrate to the Resolution Manifest flow on next revision. Track migration work for mine.visual-qa and mine.tool-gaps via GitHub issues before merging.

### Migration exemptions

Skills listed here are exempt from Anti-Patterns #2 (`multiSelect: true` as verb selector) and #8 (bail-out options) until migration to the Resolution Manifest flow is complete: `mine.visual-qa`, `mine.tool-gaps`. New skills are never exempt — only skills on this list.

### Legacy resolve flow (pre-migration skills)

Skills that have not yet migrated to the Resolution Manifest flow should follow this collect-then-fix pattern when resolving findings:

1. **Collect all user-directed answers first.** Before making any code changes, ask **all** user-directed questions upfront. Present each judgment call, collect the user's choice, then move to the next question. Do not interleave questions with code changes — the user may be in a different context (tab, window) and questions that sit unanswered between changes are disruptive.

2. **Execute all fixes.** Once all answers are collected:
   - **Auto-apply unambiguous fixes** — findings where there's one clear, localized fix. When classification is ambiguous, default to user-directed. Auto-apply only when the fix is purely additive, scoped to a single location, and introduces no behavior change.
   - **Apply user-directed fixes** using the answers collected in step 1.
   - **File issues** for findings where "file as issue" was selected, using `gh-issue create`.

This legacy pattern is preserved verbatim so that `mine.visual-qa` and `mine.tool-gaps` callers have a concrete procedure until they migrate. New skills should use the Resolution Manifest flow instead.

## Named Anti-Pattern Catalog

These are failure modes that recur across skill implementations. Each is named so it can be cited. Do not repeat any of them.

1. **Bundling N findings into one `Accept all?` AskUserQuestion** — Do not bundle multiple findings into a single AskUserQuestion. Emit one AskUserQuestion per `ask` row during manifest execution, with `(N/M)` position in the header.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "I found 9 findings. How would you like to handle them?"
     options:
       - label: "Yes — accept all recommendations"
       - label: "No — I want to discuss some"
   ```
   **Instead:** Write the manifest, present the Consent Gate, open the editor. The user sets verbs in the editor, not in one bundled AskUserQuestion.

   **Exception:** During manifest execution, emitting one AskUserQuestion per `ask` verb row (with `F{id} (N/M)` header) is correct sequential behavior, not bundling. Bundling means collapsing multiple findings into a single prompt; issuing one prompt per finding — in order — is what this rule requires.

2. **Multi-select as verb selector** — Do not use `multiSelect: true` to mean "fix some, file others." Multi-select is for "which items match this single decision," not "which verb applies to which item." Verbs belong to the manifest's Verb column.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "Which findings should be filed as issues?"
     multiSelect: true
     options:
       - label: "F1: Missing timeout"
       - label: "F3: No retry logic"
   ```
   **Instead:** The user sets `file` in the Verb column of each finding's manifest section. No AskUserQuestion needed for this decision.

3. **Double-gate after 'Yes'** — Do not re-prompt "Which findings?" after the commit gate. The commit gate's contract is "execute the manifest as written."

   **Looks like this:**
   ```
   # User clicks "Yes" at commit gate
   AskUserQuestion:
     question: "Which issues should I address first?"
     options:
       - label: "CRITICAL findings first"
       - label: "Quick wins first"
   ```
   **Instead:** After "Yes" at the commit gate, iterate the manifest in order. No additional triage gates.

4. **Meta-gates with relabeled Proceed Gate** — Do not rename the consent/commit gates and re-implement their logic under new labels.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "How would you like to handle these findings?"
     options:
       - label: "Full review — go through each finding"
       - label: "Auto-accept — apply all recommendations"
       - label: "Skip revisions — continue without changes"
   ```
   **Instead:** Use the Consent Gate (before editor) and Commit Gate (after editor) exactly as defined. No additional meta-gates.

5. **Option labels showing actions instead of findings** — In execution-phase `ask` prompts, labels describe the finding's alternative fixes, not generic verbs.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "How should I handle F3?"
     options:
       - label: "Fix it"
       - label: "File it"
       - label: "Skip it"
   ```
   **Instead:** Labels are the finding's actual option text: "Add exponential backoff (Option A)", "Use circuit breaker pattern (Option B)", "File as issue", "Skip".

6. **Auto-apply mixed with judgment calls in one prompt** — Auto-apply findings MUST execute silently during manifest iteration. They do not appear as options in `ask` prompts.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "Ready to fix these findings?"
     options:
       - label: "Fix F1 (auto) and decide on F2, F3"
       - label: "Review each one manually"
   ```
   **Instead:** `fix` verbs execute silently. `ask` verbs emit their own individual AskUserQuestion. They do not share a prompt.

7. **Permissive defaults that collapse to 'accept all'** — Default verbs must reflect the finding's actual classification. User-directed findings without a clear recommendation default to `ask`, not `fix`.

   **Looks like this:**
   ```
   # Manifest generated with all verbs defaulted to "fix" regardless of finding type
   **Verb:** fix  ← (applied to a finding with no recommendation field and two valid options)
   ```
   **Instead:** Follow the Default Verb Selection table. `User-directed` + no recommendation → `ask`. `Auto-apply` only → `fix`.

8. **Bail-out options violating 'all findings must be resolved'** — Do not offer `Skip revisions` / `Enough — approve as-is` options at any gate. Explicit deferral is valid, but it must be recorded per finding via `defer` or `skip` verbs in the manifest.

   **Looks like this:**
   ```
   AskUserQuestion:
     question: "What would you like to do with these findings?"
     options:
       - label: "Fix issues now"
       - label: "Skip revisions"
       - label: "Enough challenges — approve as-is"
   ```
   **Instead:** Every finding must be resolved. Use `defer` or `skip` verbs in the manifest for findings the user wants to punt. Do not offer session-level bail-outs.

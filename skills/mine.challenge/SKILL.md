---
name: mine.challenge
description: "Use when the user says: \"challenge this\", \"poke holes in this\", or \"what's wrong with this approach\". Adversarial review using parallel critics (3 generics + 0-2 domain specialists). Assumes the target is wrong, finds out why, and argues for a better approach."
user-invocable: true
---

# Challenge

Adversarial review of any artifact — code, specs, designs, briefs, skill files. Assumes the target is wrong and sets out to prove it. Three generic critics always run; up to two domain-specialist critics are added based on target type. Findings are cross-referenced for confidence, and every claim must cite evidence.

When invoked by caliper workflow skills (mine.specify, mine.design), those callers handle revision planning after challenge completes. When invoked standalone, challenge resolves findings via `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/findings-protocol.md`.

## How This Differs From Other Skills

| Skill | Stage | Question it answers |
|-------|-------|-------------------|
| `mine.grill` | Idea | "Have I thought this through?" |
| **`mine.challenge`** | **Artifact** | **"Is this approach actually right?"** |
| `code-reviewer` | Diff | "Is this diff safe to merge?" |

## Arguments

$ARGUMENTS — optional scope:
- File/path: `/mine.challenge src/services/user_service.py`
- Module/concept: `/mine.challenge "the auth module"`
- Empty: brief recon to find the most suspect design areas, then confirm scope before critiquing

**Optional arguments**:
- `--focus="<area>"` — steer critics toward specific concerns (e.g., `--focus="security, error handling"`). Passed to all critics as a priority signal: "Pay special attention to X." Critics still review broadly but weight output toward the user's concern. **Specialist forcing**: to force a specific specialist persona, `--focus` must be a single term (no commas, no spaces) of at least 6 characters that case-insensitively prefix-matches a specialist filename slug (e.g., `--focus="contract"` forces `contract-caller.md`). Multi-word values (e.g., `"design conformance"`) and comma-separated values bypass specialist matching and act as priority signals only.
- `--target-type=<type>` — override heuristic target-type classification. Callers that know their artifact type should pass this. Values: `code`, `frontend-code`, `spec`, `design-doc`, `brief`, `skill-file`, `agent-file`, `rule`, `docs`, `research`, `other`.
- `--findings-out=<path>` — (structured callers only) deterministic output path for the findings file. Used by mine.design and mine.specify for reliable handoff. Not needed for standalone or passthrough invocations. **Overwrites** any existing file at the path without warning — callers that re-run challenge (e.g., mine.orchestrate's "Address findings" loop) should use iteration-suffixed paths to preserve prior findings.
- `--mode=passthrough` — (passthrough callers only) signals that the calling skill handles post-challenge routing. Challenge provides a summary but skips the Consent Gate. Required for mine.brainstorm and mine.research invocations.
- `--no-specialists` — skip specialist selection, run only the three generic critics.

## How to Analyze

Do NOT run tests, execute builds, install packages, run linters, or write throwaway analysis scripts.

DO read directly (Read, Grep, Glob, `git log` / `git diff`). Use WebSearch to look up canonical descriptions of design patterns you recommend, or to cite documented failure modes — a "better approach" backed by a reference is stronger than one asserted without it.

## Finding Taxonomy

Every finding gets four contract tags: **severity**, **type**, **design-level**, and **resolution**, plus a **confidence** annotation (presentation-only). TENSION findings add three more: **side-a**, **side-b**, **deciding-factor**.

### Severity (impact-based)

Each critic assigns severity based on consequence — how bad is this if left unfixed?

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Fundamental flaw — the target cannot succeed as designed |
| **HIGH** | Serious problem — will cause real damage but the target isn't doomed |
| **MEDIUM** | Valid concern — worth fixing but won't cause failure |
| **TENSION** | Critics disagree on whether this is even a problem — surface both views for the user to decide |

**TENSION vs. fix disagreement**: TENSION means critics disagree on whether something is a problem at all (one says "this is broken," another says "this is fine"). If critics agree it's a problem but propose different fixes, that's NOT TENSION — use the highest severity and present the differing fixes as options in a User-directed finding.

During synthesis, the **highest severity any critic assigned** is used. Agreement count is recorded on a separate **confidence** line (e.g., `3/5 (Senior + Architect + Data Integrity)` or `1/4 (Senior only)`). This prevents novel findings from being deprioritized just because only one specialist spotted them. The `severity` field must be exactly one of `CRITICAL`, `HIGH`, `MEDIUM`, or `TENSION` — a single token with no parenthetical. Confidence is a separate, non-contract field.

### Type (what kind of problem)

Describes the nature of the finding — what's wrong, not where to fix it.

| Type | Meaning |
|------|---------|
| **Structural** | Boundary, coupling, or layering problem — system shape is wrong |
| **Approach** | The pattern or method is flawed — wrong abstraction, fighting the framework. Sub-tag with timing: `now` (wrong regardless of conditions) or `later` (will become wrong as requirements evolve or scale increases) |
| **Fragility** | Correct under happy-path conditions, will fail under specific operational stress — concurrency bugs, hidden state, race conditions, resource exhaustion, partial failures. Signals "fix before ship," not "revisit later" |
| **Gap** | Missing details, unhandled cases, spec holes, undefined behavior |

### Design-level (architectural scope)

Whether this finding is architectural/structural in nature — meaning it would require revisiting how the system was designed, not just how it was implemented. This is about the nature of the finding, not about whether a specific document exists.

| Value | Meaning |
|-------|---------|
| **Yes** | Architectural or structural — would require revisiting design decisions |
| **No** | Implementation-level — addressable during coding without design changes |

### Resolution (does the user need to decide?)

| Resolution | Meaning | How it appears |
|------------|---------|----------------|
| **Auto-apply** | One clear fix, localized and additive — safe to apply directly | "Here's the change" — approve or skip |
| **User-directed** | Multiple valid approaches, OR the fix is large/structural | "Here are the options, here's my recommendation" — you pick |

**Classification rules:**
- **Auto-apply** requires: (1) critics agree on both problem and fix, AND (2) the fix is localized — edits to a specific section, additive content, or wording changes. Not deletions, restructurings, or section rewrites.
- **User-directed** when: critics disagree on the fix, OR the fix involves deletion, restructuring, or rewriting a significant section — regardless of critic agreement.
- **When ambiguous, default to User-directed.** Err toward user input, not silent application.

## Output Contract

The following tag names and values are consumed by calling skills (mine.design, mine.specify) to generate revision plans. Changing these is a **breaking change** — update all callers. The rationalization table (bottom of file) is also a breaking-change surface when rows redefine how severity, type, design-level, or resolution are assigned during synthesis — changes to those rows require the same caller update pass.

- **Contract tag names**: `severity`, `type`, `design-level`, `resolution`
- **Contract tag names (TENSION only)**: `side-a`, `side-b`, `deciding-factor`
- **Severity values**: `CRITICAL`, `HIGH`, `MEDIUM`, `TENSION`
- **Presentation-only fields** (not contract — safe to evolve without updating callers): `raised-by`, `confidence`, `why-it-matters`, `evidence`, `references`, `design-challenge`. These fields are absent in findings.md files produced before this format version; Phase 4 must render gracefully when they are missing — omit the section rather than rendering an empty block.
  - `raised-by` values use shortened display names derived from persona file `name:` frontmatter (e.g., "Skeptical Senior Engineer" → "Senior", "Data Integrity Critic" → "Data Integrity"). The mapping table's display names are the canonical short forms. If a future caller begins pattern-matching on `raised-by` values, treat persona name changes as a contract change at that point.
  - `confidence` format: `N/<total> (<critic names>)` — e.g., `3/5 (Senior + Architect + Data Integrity)`. Total is the number of critics that successfully produced reports. If a critic fails to report, note the missing critic and reduce the denominator.
  - `why-it-matters`: one sentence describing the consequence if left unfixed. Copied verbatim by synthesis from the contributing critic with the most concrete consequence statement.
  - `evidence`: comma-separated list of `file:line` citations or section references. For non-code targets (`other`, `spec`, `design-doc`, `rule`, `brief`), may contain section references instead of file:line. Written as `not cited` when no critic provided structured evidence — Phase 4 suppresses the Evidence section when the value is `not cited` or the field is absent.
  - `references`: comma-separated list of external URLs cited by critics. Phase 4 splits on commas and renders each URL as a bullet. Omitted entirely when no external references were cited.
  - `design-challenge`: one question that forces the author to justify or rethink the finding.
- **design-level values**: `Yes`, `No`
- **Resolution values**: `Auto-apply`, `User-directed`
- **Format-version**: `2` — written in the findings file header. Callers should assert this value to detect format mismatches. Absent in pre-enrichment files (version 1). Increment when the findings file format changes in a way that requires callers to adapt or makes pre-existing files unreadable by Phase 4.
- **Temp dir**: `<tmpdir>` — written in the findings file header. Contract field — used by structured callers to locate `validation-warnings.md` and individual critic reports. Callers that use this path must handle the case where the directory no longer exists (cleaned after 7 days) — treat a missing tmpdir as equivalent to `Warnings: none` and skip the `validation-warnings.md` read.
- **Findings file**: `<tmpdir>/findings.md`, or `--findings-out` path when provided by structured callers (always written)
- **Validation warnings**: `<tmpdir>/validation-warnings.md` — written only when validation issues or orphan warnings were detected; absence means a clean run. Structured callers may read this via `Temp dir:` in the findings header to diagnose unexpected confidence denominators.

**Known callers** (update all when contract changes). New structured callers must add a `<!-- CHALLENGE-CALLER -->` comment at their invocation site. To verify this list is complete: `grep -r 'CHALLENGE-CALLER' ${CLAUDE_HOME:-~/.claude}/skills/ --include='*.md' -l`.

Structured callers (read findings file and generate revision plans):
- `skills/mine.design/SKILL.md` — "On 'Challenge this design'" section
- `skills/mine.specify/SKILL.md` — "On 'Challenge this spec first'" section
- `skills/mine.orchestrate/SKILL.md` — Phase 3 Step 3 auto-challenge (dispatched as subagent with `--findings-out`)

Detection callers (scan for severity labels to detect prior analysis, don't read findings file):
- `skills/mine.build/SKILL.md` — accelerated path detection

Standalone callers (invoke challenge without `--findings-out`; challenge runs full standalone flow including Consent Gate, then returns control to the caller):
- `skills/mine.grill/SKILL.md` — loops back to its handoff gate after challenge completes

Passthrough callers (invoke challenge standalone, don't consume findings file; challenge provides summary only, no Consent Gate):
- `skills/mine.research/SKILL.md`
- `skills/mine.brainstorm/SKILL.md`

Inline-revision callers (invoke `/mine.challenge` inline during a gate, read findings, and revise their own proposal before proceeding — they do not pass `--findings-out`, do not use `--mode=passthrough`, and do not read the findings file programmatically; the LLM reads findings in-context and revises the proposal):
- `skills/i-adapt/SKILL.md`
- `skills/i-animate/SKILL.md`
- `skills/i-arrange/SKILL.md`
- `skills/i-bolder/SKILL.md`
- `skills/i-clarify/SKILL.md`
- `skills/i-colorize/SKILL.md`
- `skills/i-delight/SKILL.md`
- `skills/i-distill/SKILL.md`
- `skills/i-extract/SKILL.md`
- `skills/i-harden/SKILL.md`
- `skills/i-normalize/SKILL.md`
- `skills/i-onboard/SKILL.md`
- `skills/i-optimize/SKILL.md`
- `skills/i-polish/SKILL.md`
- `skills/i-quieter/SKILL.md`
- `skills/i-typeset/SKILL.md`

Standalone-only target types (no structured caller — findings are presented to the user for manual action):
- `docs` — no revision skill exists yet. A future `mine.docs-review` caller would consume `--findings-out` like mine.design does for `design-doc` targets.

**Caller guidance for TENSION findings**: Structured callers should route TENSION findings to the document's "Open Questions" section rather than generating revisions — TENSION means the critics genuinely disagree, so the user needs to decide.

## Phase 1: Gather Context

### Parse arguments

Extract optional flags from the **beginning** of `$ARGUMENTS` only. Once a non-flag token is encountered (no `--` prefix), treat all remaining text as the target scope — do not extract flags from within target content. This prevents passthrough callers' inline content from being misinterpreted as flags.

Recognized flags:
- `--findings-out=<path>` — deterministic output path (structured callers only)
- `--focus="<area>"` — critic focus steering
- `--target-type=<type>` — override heuristic classification
- `--mode=passthrough` — passthrough caller signal (mine.brainstorm, mine.research)
- `--no-specialists` — skip specialist selection, run generics only

The remainder of `$ARGUMENTS` is the target scope.

**Create temp directory**: Run `get-skill-tmpdir mine-challenge` and note the directory path (e.g., `/tmp/claude-mine-challenge-a8Kx3Q`). This tmpdir is used for critic reports, manifest, validation warnings, and (if `--findings-out` is not present) the findings file.

### If $ARGUMENTS given (after extracting flags)

1. Determine the **input shape**:
   - **File path or module name**: read the targeted file(s) fully
   - **List file** (`.txt` or `.list` extension): read its contents as a newline-separated list of file paths (absolute or relative — resolve relative paths from the current working directory). Skip blank lines and lines starting with `#`. If a listed file does not exist, record a warning to `<tmpdir>/validation-warnings.md` and skip it — do not halt.
   - **Inline content** (multiple sentences or structured markdown): treat the argument text as the target to analyze directly — do not attempt to read it as a file. This happens when passthrough callers (mine.research, mine.brainstorm) pass content instead of a path.

2. **Classify the target type** — if `--target-type` was provided, use it directly. Otherwise, use heuristics. This classification is passed to critics in Phase 2:

   | Target type | Detected by | What critics focus on |
   |-------------|-------------|----------------------|
   | `code` | `.py`, `.go`, `.rs`, `.java`, `.ts`, `.js`, or other implementation files; use this for backend/server-side TypeScript or JavaScript, and for repo-wide or mixed frontend+backend scopes. For ambiguous `.ts`/`.js`, default to `code` unless frontend-specific signals are present. | Runtime failures, coupling, security, error handling |
   | `frontend-code` | `.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`, or directories named `components/`, `pages/`, `hooks/` — frontend-specific code. For ambiguous extensions (`.ts`, `.js`), classify as `frontend-code` only when UI framework imports (React, Vue, Svelte, Solid, Qwik, Lit, Angular, etc.), DOM APIs (`document`, `window`), or `package.json` frontend framework dependencies are present. In full-stack apps, targets scoped to clearly frontend directories such as `frontend/` or `src/components/` classify as `frontend-code`; targeting the whole repo or any mixed frontend+backend scope classifies as `code`. | Client-side performance, component architecture, data fetching, accessibility, CSS architecture (in addition to generic concerns) |
   | `spec` | `spec.md` or content with requirements/acceptance criteria | Completeness, testability, internal consistency, scope gaps |
   | `design-doc` | `design.md` or content with architecture/API contracts | Feasibility, missing alternatives, boundary correctness |
   | `brief` | `brief.md` or content from grill/brainstorm | Framing validity, assumption quality, scope coherence |
   | `skill-file` | `SKILL.md` or content with phases/persona definitions | LLM behavior assumptions, prompt ambiguity, contract fragility, caller compatibility |
   | `agent-file` | Files in `agents/` directory or `.md` with agent frontmatter (name, description, tools) | Identity bloat, missing conventions, filler sections, scope overlap, executor compatibility |
   | `docs` | `README.md` or `.md` files in a `docs/` directory | Technical accuracy of code samples and commands, API reference validity, version currency, consistency between docs and codebase |
   | `research` | `research.md` or research artifacts/investigation output | Conclusion validity, exploration completeness, confirmation bias |
   | `rule` | Files in `rules/` directory or `.md` files defining conventions, guidelines, or behavioral contracts (coding style, git workflow, testing policy, agent orchestration, etc.) | Rule clarity and enforceability, interaction with other rules, downstream impact on skills/agents that consume the rule, ambiguity that leads to inconsistent compliance |
   | `other` | No type matches above | Correctness, assumption validity, internal consistency — critics use their general focus without type-specific narrowing |

3. **Gather context** based on target type:
   - **Code** / **Frontend-code**: grep for call sites and dependencies — understand what uses this code and what it uses. For `frontend-code`, also read `package.json` (framework, dependencies), and if present, the design tokens file (varies by project: `tailwind.config.*`, `theme.ts`, `tokens.*`, `variables.css`) and the API client/fetch layer to understand the data contract with the backend.
   - **Document** (spec, design-doc, brief, research): read related codebase files the document references, and any adjacent artifacts in the same feature directory
   - **Docs**: read sibling docs in the same directory or docs/ tree to understand the documentation set as a whole. If the doc references code, commands, or config, verify those exist and read the referenced sections to check for interface drift — confirm the current behavior matches what the doc describes.
   - **Skill file**: read all callers listed in the file, grep for additional references across the codebase
   - **Agent file**: read 2-3 gold-standard agents for structural comparison (`engineering-backend-developer.md`, `engineering-data-engineer.md`, `engineering-frontend-developer.md`), check routing tables (`rules/common/agents.md`, `skills/mine.orchestrate/SKILL.md`) for how the agent is dispatched, and grep for the agent name across skills/rules to find all references
   - **Rule**: read sibling rules in the same directory to check for overlaps, contradictions, or gaps. Grep for the rule's key terms across skills, agents, and other rules to find all consumers. If the rule references specific tools, commands, or patterns, verify they exist.
4. Note what problem the target ostensibly solves

### If empty

1. Quick recon: directory structure, recently changed files (`git log -n 10 --diff-filter=M --name-only --format= | sort -u`), largest files
2. Use `AskUserQuestion` to confirm the focus area before proceeding:

```
AskUserQuestion:
  question: "I've scanned the codebase. These areas look most suspect. Which should I critique?"
  header: "Focus area"
  multiSelect: false
  options:
    - label: "<area 1>"
      description: "<brief observation about why it looks suspect>"
    - label: "<area 2>"
      description: "<brief observation>"
    - label: "Let me specify"
      description: "I'll tell you exactly what to look at"
```

### Specialist Selection

After classifying the target type, select specialist personas to augment the three generic critics. Specialists provide domain-specific focus that generics are blind to.

**If `--no-specialists` was passed**, skip this section entirely — only generics run.

**Enumerate specialists**: Run `Glob ~/.claude/skills/mine.challenge/personas/specialist/*.md` to discover all specialist persona files on disk. This Glob runs unconditionally (regardless of target type or `--focus`) and its results are used for orphan detection, `--focus` matching, and cross-referencing the mapping table. If the Glob returns zero results (e.g., symlink not yet installed), record a warning to `<tmpdir>/validation-warnings.md`: "`specialist directory not found or empty at ~/.claude/skills/mine.challenge/personas/specialist/`" and proceed with generics only.

**Orphan detection**: Compare the Glob results against the specialist filenames referenced in the mapping table below. If any specialist file exists on disk but is not referenced by any row in the table, record a warning: "Specialist [filename] exists but is not mapped to any target type in the specialist selection table — it will never auto-activate. Add it to the table or use `--focus` to force it."

**Target-type → specialist mapping**:

| Target type | Specialist personas (display name → filename) |
|-------------|-------------------|
| `code` | Data Integrity (`data-integrity.md`) + Operational Resilience (`operational-resilience.md`) |
| `frontend-code` | Web Platform (`web-platform.md`) + Operational Resilience (`operational-resilience.md`) |
| `skill-file` | Contract & Caller (`contract-caller.md`) + Workflow & UX (`workflow-ux.md`) |
| `agent-file` | Agent Definition (`agent-definition.md`) |
| `design-doc` | Contract & Caller (`contract-caller.md`) + Operational Resilience (`operational-resilience.md`) |
| `spec` | Workflow & UX (`workflow-ux.md`) |
| `docs` | End-User Reader (`end-user-reader.md`) + Documentation Architect (`documentation-architect.md`) |
| `rule` | Contract & Caller (`contract-caller.md`) + Workflow & UX (`workflow-ux.md`) |
| `brief` | Workflow & UX (`workflow-ux.md`) |
| `research` | _(none — generics only)_ |
| `other` | _(none — generics only)_ |

**`--focus` override**: If `--focus` was provided:

1. If `--focus` contains a comma (multiple areas), skip specialist matching entirely — treat `--focus` as a priority signal only and proceed with preset selection from the table.
2. Match the `--focus` value against the Glob results (from the enumerate step above) using case-insensitive prefix matching on the filename slug (without `.md`) with a **minimum 6-character prefix** (e.g., `--focus="operat"` matches `operational-resilience.md`, but `--focus="data"` does not — too short). Any specialist file in the directory can be forced this way.
3. Record the initial specialist selection from the mapping table as `[initial-specialists]`.
4. If a match is found and not already in the preset selection, add it. Capped at 2 specialists total (5 total critics is the practical limit for synthesis quality). If the cap is already full from the preset, the focus specialist replaces the second preset default. Record the final selection as `[final-specialists]`.
5. **Only if a substitution occurred** (a preset specialist was replaced): Write `<tmpdir>/focus-substitution.md` with a single line: "Note: [focus specialist] ran in place of [dropped specialist] due to --focus override (2-specialist cap)." The dropped specialist is the set difference: `[initial-specialists]` minus `[final-specialists]`. Phase 4 reads this file for the announcement (see Phase 4 Specialist announcement section). If no substitution occurred (focus specialist was simply added, or no match was found), do not write this file.
6. **If `--focus` was provided and no specialist match occurred** (value was multi-word, comma-separated, below 6-char minimum, or matched no slug) and `--no-specialists` was not passed: record a warning to `<tmpdir>/validation-warnings.md`: "Focus value `<value>` did not match any specialist — proceeding with preset specialists only."

## Phase 2: Launch Critics

### Read persona files

**Pre-flight check**: Before reading persona files, verify the generic persona directory exists at `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/personas/generic/`. If the directory is missing or empty, stop with: "Cannot launch critics — persona files not found at `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/personas/generic/`. Run `install.sh` to symlink skills into your Claude config directory."

Read all 3 generic persona files from `~/.claude/skills/mine.challenge/personas/generic/`:
- `senior-engineer.md`
- `systems-architect.md`
- `adversarial-reviewer.md`

If specialists were selected, read the corresponding files from `~/.claude/skills/mine.challenge/personas/specialist/` (e.g., `data-integrity.md`, `contract-caller.md`).

**Validate**: After reading each persona file, verify it has `name` and `type` in its YAML frontmatter, and the body contains at least one of "Persona", "Characteristic question", or "Focus". If a file is missing, has malformed frontmatter, or has an empty body, record the issue to `<tmpdir>/validation-warnings.md` and exclude it from the run.

**Warning persistence**: Write all validation issues and orphan warnings (from Phase 1 and this step) to `<tmpdir>/validation-warnings.md` (create the file only if there are warnings). This ensures warnings survive as a persistent artifact regardless of whether mine.challenge is running standalone or as a subagent.

### Launch all critics in parallel

Subagents write their reports inside this directory:
- Generic critics: `<tmpdir>/senior.md`, `<tmpdir>/architect.md`, `<tmpdir>/adversarial.md`
- Specialist critics: `<tmpdir>/<slug>.md` matching the persona filename (e.g., `<tmpdir>/data-integrity.md`, `<tmpdir>/contract-caller.md`)

**CRITICAL: Issue ALL Agent tool calls (3-5 critics) in a single response message. Each call must use `subagent_type: general-purpose`, `model: sonnet`, and must NOT set `run_in_background`.** Foreground agents in the same message run concurrently. Background agents cannot request permissions and cannot spawn their own subagents — both are required here. Each critic receives:
- The target under review (file paths to read — pass full file paths, not excerpts; or inline content if the target was passed as text). For `docs` targets: also pass all sibling doc paths discovered in Phase 1 to the Documentation Architect specialist, so it can evaluate the documentation set as a whole. If no siblings were found, explicitly state: "No sibling docs were found — apply the single-file scope note from your persona."
- The **target type** from Phase 1 classification (e.g., "This is a `spec` target — focus on requirement completeness, testability, and internal consistency")
- Their persona and focus lens (from the persona file read above — include the full body text: Persona, Characteristic question, and Focus bullets)
- If `--focus` was provided: "The user is specifically concerned about: <focus area>. Weight your analysis toward this concern."
- The path to write their report to
- These rules:
  1. **Cite evidence for every claim** — no vague assertions:
     - For claims about this codebase, cite `file:line` for each point.
     - For external best practices, patterns, or failure modes, cite a canonical URL (via WebSearch).
  2. **Name the problem directly** — no hedging, no "this could potentially be improved"
  3. **Propose a fix** using this structure (required for every finding). Anchor option descriptions to the finding's problem name for reliable cross-critic matching:
     ```
     **Proposed fix**:
     - Resolution: Auto-apply | User-directed
     - If Auto-apply: [one-sentence description of the specific change]
     - If User-directed: [Option A — Option B — key tradeoff between them]
     ```
  4. **Tag each finding** with severity (CRITICAL / HIGH / MEDIUM), type (Structural / Approach-now / Approach-later / Fragility / Gap), and design-level (Yes / No). Assign severity based on impact — how bad is this if left unfixed?
  5. **Structure each finding with these required sections** (synthesis copies these directly — produce them as discrete, labeled sections, not embedded in prose):
     ```
     **Why it matters**: [One sentence — the concrete consequence if this is left unfixed]
     **Evidence**:
     - [file:line only — no prose annotations. For non-code targets, use section references instead]
     **References** (include only if you found external sources):
     - [URL — canonical doc, RFC, or pattern description that supports this critique]
     **Design challenge**: [One question that forces the author to justify or reconsider]
     ```
  6. **Include a "Pushback" section** at the end of your report. For each finding raised by other critics (you won't see their reports, but anticipate likely concerns from the other critics), note any you would disagree with and why. If you think something another critic is likely to flag is actually fine, say so explicitly — e.g., "The coupling here is intentional because X." This gives synthesis the raw material to produce TENSION findings.
  7. **Read beyond the provided files** — you have Read, Grep, and Glob access. Before writing your report, grep for call sites of the primary module/function under review and read at least two of them. Include a **Files examined** section at the top of your report listing every file you read. Don't limit your critique to what was handed to you.

Each critic writes their full, unfiltered findings to their temp file. These files persist for the session so the user can read any individual critic's reasoning after the skill completes.

### Persona assignment

Each critic's identity and focus lens comes from the persona file read above. Pass the full body text (Persona, Characteristic question, Focus bullets) as part of the subagent prompt. The generic critics are:

- **senior-engineer.md** → writes to `<tmpdir>/senior.md`
- **systems-architect.md** → writes to `<tmpdir>/architect.md`
- **adversarial-reviewer.md** → writes to `<tmpdir>/adversarial.md`

Specialist critics (when selected) use their filename slug as the output name:

- **contract-caller.md** → writes to `<tmpdir>/contract-caller.md`
- **data-integrity.md** → writes to `<tmpdir>/data-integrity.md`
- **operational-resilience.md** → writes to `<tmpdir>/operational-resilience.md`
- **workflow-ux.md** → writes to `<tmpdir>/workflow-ux.md`
- **end-user-reader.md** → writes to `<tmpdir>/end-user-reader.md`
- **agent-definition.md** → writes to `<tmpdir>/agent-definition.md`
- **documentation-architect.md** → writes to `<tmpdir>/documentation-architect.md`
- **web-platform.md** → writes to `<tmpdir>/web-platform.md`

### Write session manifest

**Write `<tmpdir>/manifest.md` before issuing Agent tool calls** — pre-populate it with the planned critic list and all session state that later phases need. This ensures crash recovery if the orchestrator fails between critic dispatch and Phase 3, and makes all phase transitions compaction-safe.

Format — comment lines are session metadata, non-comment lines are critic report filenames:

```
# target-type: skill-file
# mode: structured | standalone | passthrough
# findings-out: <path> | default
# focus: <area> | none
# target: <absolute path or scope description>
senior.md
architect.md
adversarial.md
<specialist-slug>.md
<specialist-slug>.md
```

**Field definitions**:
- `mode`: `structured` when `--findings-out` is present; `passthrough` when `--mode=passthrough` is passed; `standalone` otherwise (includes direct user invocations and standalone callers like mine.grill that want the full Consent Gate flow).
- `findings-out`: the `--findings-out` path if provided, or `default` (meaning `<tmpdir>/findings.md`).
- `focus`: the `--focus` value if provided, or `none`.
- `target`: the target scope — use the absolute path when the target is a file; use the scope description when inline content.

List generics first, then specialists. List only the critics that will be launched; specialist entries use the filename slugs selected in Phase 1.

This decouples all session state from LLM context memory. Phase 3 reads the manifest for the critic list; Phase 4 reads it for target type, specialist list, and mode. Specialists are identified as entries not in the known-generic set (`senior.md`, `architect.md`, `adversarial.md`).

### Validate critic reports

After all critic subagents complete, verify each file listed in the manifest exists and has substantive content (at least 500 bytes). For missing or undersized files, record a warning to `<tmpdir>/validation-warnings.md`: "Critic [name] report is missing or suspiciously small ([N] bytes) — findings from this critic may be incomplete." Missing files reduce the confidence denominator; undersized-but-present files are warned but still counted.

## Phase 3: Synthesize

**Dispatch synthesis as a separate `general-purpose` subagent (`model: sonnet`)** to give it fresh context. The orchestrating context has already consumed the full SKILL.md, persona files, target content, and subagent launch — synthesis quality degrades if it runs in that loaded context. The synthesis subagent receives clean context and better reasoning for cross-critic conflict detection, TENSION identification, and severity escalation.

The synthesis subagent receives:
- The `<tmpdir>` path
- The `<tmpdir>/manifest.md` file (lists which critic reports to read)
- Whether `<tmpdir>/validation-warnings.md` exists (and its contents if it does) — for the `Warnings:` header field
- The findings output path: `--findings-out` path if provided, otherwise `<tmpdir>/findings.md`
- The target name/scope (for the findings file header)
- The full synthesis procedure and findings file format below

The subagent prompt must include all of the following instructions:

### Reading critic reports

Read `<tmpdir>/manifest.md` to get the list of expected critic report filenames. Skip lines starting with `#` (comments, e.g., `# target-type:`) and empty lines — only non-comment, non-empty lines are filenames. Then **read every listed file in full** (no `limit` or `offset`). Do NOT glob `*.md` — the tmpdir also contains `findings.md` and `manifest.md`. If a file listed in the manifest is missing, note the missing critic in synthesis output and adjust the confidence denominator. Skipping a file or reading only part of one means that critic's findings are silently dropped from synthesis.

### Synthesis procedure

Three steps. Prioritize trustworthy output over compact output — showing an extra finding is far cheaper than a bad merge or wrong tag.

1. **Group by problem area** — cluster findings that address the same part of the system or the same concern. List all critic perspectives for each group. Do NOT merge or deduplicate — if two critics flagged similar-but-distinct issues, keep both as separate findings. The user can mentally merge; they can't un-apply a wrong auto-apply.

2. **Assign tags per finding**:
   - **Severity**: take the highest severity any contributing critic assigned. The final value **must** be one of `CRITICAL`, `HIGH`, `MEDIUM`, or `TENSION` — no other values are valid. If a critic used a non-contract value (e.g., `LOW`, `INFO`), reclassify as `MEDIUM` and append a validation warning to `<tmpdir>/validation-warnings.md` (read existing content first if the file exists — Phase 1 may have already written warnings). Record agreement count on the separate confidence line (e.g., `3/5 (Senior + Architect + Data Integrity)` or `1/4 (Senior only)`).
   - **Type**: use the type that best describes the root cause. For Approach timing conflicts (`now` vs `later`), tag as `Approach-now/later`.
   - **Design-level**: when critics disagree, Yes wins (architectural concerns should surface).
   - **Resolution**: default to **User-directed** unless ALL critics proposed the same fix AND it's localized and additive — only then use **Auto-apply**. When in doubt, User-directed.

3. **Write a recommendation** for each User-directed finding — which option you'd pick and a one-sentence reason. **Exception**: for TENSION findings, replace the recommendation with a **Deciding factor** — one question or data point that would resolve the disagreement.

4. **Copy presentation fields** from critic reports into each finding. These are structured sections that critics produce (rule 5 in the critic prompt) — copy them, do not generate from scratch:
   - `why-it-matters`: Copy verbatim from one critic — do not merge or rephrase. When multiple critics wrote **Why it matters** sections, pick the one with the most concrete consequence; if equally concrete, prefer the critic who assigned the highest severity for this finding. For TENSION findings, omit this field — TENSION findings present both sides via side-a/side-b, and a one-sided consequence statement is misleading.
   - `evidence`: Collect all `file:line` citations (or section references for non-code targets) from all contributing critics' **Evidence** sections. Deduplicate only identical citations (same file and same line); different line numbers in the same file are distinct citations — keep both. Write as a comma-separated list (e.g., `src/auth.py:42, src/auth.py:88, models/user.py:15`). For TENSION findings, collect citations from both sides. If no critic provided structured evidence for a finding, write `not cited`.
   - `references`: Collect all external URLs from contributing critics' **References** sections. Omit this field entirely if no references were cited.
   - `design-challenge`: Copy the strongest design question from the contributing critics' **Design challenge** sections. One question per finding.

   **Missing sections**: If a contributing critic's report is missing one of these structured sections (no `**Evidence**` bullets, no `**Why it matters**` line, etc.), do not generate a replacement. Write `not cited` for evidence; omit the other missing fields entirely. Do not synthesize content for absent sections.

**What to exclude**: Style, naming, formatting nits. Not design critiques — skip them.

### Write findings file

After synthesis, **always** write the findings file to the output path provided — overwrite unconditionally if a file already exists. Callers that need prior findings preserved are responsible for using iteration-suffixed paths. This file is the handoff contract for calling skills that generate revision plans. For the `Warnings:` header field: if `<tmpdir>/validation-warnings.md` exists and is non-empty, write a one-sentence summary of its contents; otherwise write `none`.

Format:

```markdown
# Challenge Findings — <target>
Date: YYYY-MM-DD
Target: <file or scope>
Temp dir: <tmpdir>
Warnings: none | <one-sentence summary of validation/orphan warnings>
Format-version: 2

## Finding 1: <name>
- severity: CRITICAL / HIGH / MEDIUM / TENSION
- confidence (non-contract): N/<total> (<which critics>) — e.g., "3/5 (Senior + Architect + Data Integrity)" or "1/4 (Adversarial only)"
- type: Structural / Approach-now / Approach-later / Approach-now/later / Fragility / Gap
- design-level: Yes / No
- resolution: Auto-apply / User-directed
- raised-by: Senior + Architect / etc.
- summary: <one-sentence description>
- why-it-matters: <one sentence — consequence if left unfixed; omit for TENSION findings>
- evidence: <comma-separated file:line citations or section references; "not cited" when none available>
- references: <comma-separated external URLs — omit this field entirely if none>
- design-challenge: <one question that forces the author to justify or rethink>
- better-approach: <the fix — Auto-apply findings only; mutually exclusive with options>
- options (User-directed only, mutually exclusive with better-approach): <Option A: [approach] / Option B: [approach]>
- recommendation (User-directed only): <which option and why. For TENSION: deciding factor>
- side-a (TENSION only): <Critic A argues X because Y>
- side-b (TENSION only): <Critic B argues Z because W>
- deciding-factor (TENSION only): <question or data point that would resolve the disagreement>

## Finding 2: <name>
...
```

### After synthesis subagent completes

**Verify the findings file exists** at the expected output path (read `# findings-out:` from `<tmpdir>/manifest.md` to determine the path — use `<tmpdir>/findings.md` when the value is `default`). If the file is missing, stop with: "Error: findings file was not written to `<path>` — synthesis may have failed or written to the wrong location." Do not proceed to Phase 4 with a missing file.

Read the findings file. This is the input for Phase 4 presentation.

## Phase 4: Present Findings

### Specialist announcement

Before announcing, read `<tmpdir>/manifest.md` and derive session state from its comment lines: specialist list, target type, mode, findings-out path, focus, and target scope. This is the compaction-safe recovery path — all session state lives in this file, not in LLM context recall. Specialists are entries whose filename is **not** in the known-generic set (`senior.md`, `architect.md`, `adversarial.md`). The `# target-type:` comment line provides the classified target type. To recover display names from manifest slugs, look up each specialist slug in the mapping table (e.g., `contract-caller.md` → "Contract & Caller") — the table includes both display names and filenames.

If `<tmpdir>/focus-substitution.md` exists, read it for the substitution announcement text.

If specialists ran, announce the selection before listing findings: "Specialists selected: [names] (target-type: [type])". If `--focus` caused a replacement, include the substitution note from `focus-substitution.md`: "Note: [focus specialist] ran in place of [dropped preset] due to --focus override (2-specialist cap)."

If `<tmpdir>/validation-warnings.md` exists and is non-empty, read it. For any critic exclusions recorded there (malformed frontmatter, missing file), announce each inline before findings: "Warning: [critic name] was excluded due to [reason] — confidence denominators are reduced accordingly." Then include a general note: "Additional validation warnings were recorded — see `<tmpdir>/validation-warnings.md`."

### Per-finding format

**Read each finding from findings.md and render it using the template below.** Fill each slot from the corresponding field in findings.md — do not rephrase, generate, or embellish. If a presentation-only field (`why-it-matters`, `evidence`, `references`, `design-challenge`) is missing from a finding (e.g., in pre-enrichment findings.md files), omit that section entirely rather than generating it or rendering an empty block.

Findings MUST be numbered sequentially (`### 1.`, `### 2.`, etc.) for easy reference in conversation.

All findings share this header:

```
### N. [Finding name from ## heading] — SEVERITY (confidence)
**Type**: [type value] | **Design-level**: [design-level value] | **Resolution**: [resolution value]

**What's wrong**: [summary field]
**Why it matters**: [why-it-matters field]
**Evidence**:
- [each comma-separated item from evidence field as a bullet]
**References**:
- [each comma-separated URL from references field as a bullet]
**Raised by**: [raised-by field]
```

Then render the resolution-specific block — these are **mutually exclusive**, not additive:

**Auto-apply findings:**
```
**Better approach**: [better-approach field]
**Design challenge**: [design-challenge field]
```

**User-directed findings (non-TENSION):**
```
**Options**:
- **Option A**: [from options field] — *tradeoff: [from options field]*
- **Option B**: [from options field] — *tradeoff: [from options field]*
**Recommendation**: [recommendation field]
**Design challenge**: [design-challenge field]
```

**TENSION findings:**
```
**The disagreement**: [side-a field. side-b field.]
**Deciding factor**: [deciding-factor field]
**Design challenge**: [design-challenge field]
```

**Suppress rules** (apply to all resolution types, including TENSION): Omit `**Evidence**` when evidence is `not cited` or absent. Omit `**References**` when the field is absent. Omit `**Why it matters**` when the field is absent OR when resolution is `TENSION` (even if synthesis incorrectly included it — TENSION findings present both sides, not a one-sided consequence). Omit `**Design challenge**` when the field is absent.

### After presenting findings

List all critic report file paths so the user knows where reports are. Always list the three generics, then any specialists that ran:

- Senior Engineer: `<tmpdir>/senior.md`
- Systems Architect: `<tmpdir>/architect.md`
- Adversarial Reviewer: `<tmpdir>/adversarial.md`
- _(if specialists ran)_ `<tmpdir>/<slug>.md` for each specialist (e.g., `data-integrity.md`, `contract-caller.md`)
- Structured findings: `<tmpdir>/findings.md` (or the path provided via `--findings-out`, if specified)

### Wrap-up: structured callers vs standalone

Read `# mode:` from `<tmpdir>/manifest.md` to determine the wrap-up behavior. Do not rely on context recall of `--findings-out` or the calling skill — the manifest is the authoritative source after potential compaction.

**If mode is `structured`**: challenge is done. Do NOT begin fixing anything. Write a single line: "Challenge complete — findings written to `<findings-out path from manifest>`. Returning to caller." Then stop. The caller resumes and generates a revision plan from the findings file.

**If mode is `standalone`** (user ran `/mine.challenge` directly): provide a wrap-up, then resolve findings.

1. **Summary** — one paragraph: total finding count, breakdown by severity, the single most important takeaway across all findings.

2. **Resolve findings** — Read `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/findings-protocol.md` and follow the Resolution Manifest flow defined there. Generate the manifest from findings.md, present the Consent Gate, invoke `edit-manifest <tmpdir>/resolutions.md`, run the detection logic, present the Commit Gate, and execute. The protocol file provides format, verb vocabulary, execution semantics, and detection logic — mine.challenge delegates those mechanics. The async/compaction rules below are mine.challenge-specific.

### Async Completion

Async mechanics are mine.challenge-specific (task-notification handling, 600s timeout); all other detection mechanics are in `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/findings-protocol.md`.

1. **Set `timeout: 600000`** on the edit-manifest Bash call as a defense-in-depth safety belt, even though auto-backgrounding usually fires first.
2. **Acknowledge async completion**: Phase 4 prose says "when the editor session completes" rather than "when the bash call returns" — this signals the completion may arrive via task-notification, not synchronous return.

**If mode is `passthrough`** (mine.brainstorm, mine.research): provide the summary (step 1) but skip the next-step prompt — the calling skill handles its own routing after challenge completes.

## Principles

1. **Evidence or silence** — every claim must cite a specific file and line. No "this module is unclear" without pointing at exactly what's unclear and why.
2. **Direct** — name the problem, explain the consequence, move on. No hedging.
3. **The better way** — a critique without a direction isn't actionable. Every finding must name a pattern, approach, or structural alternative.
4. **Questions challenge, not embarrass** — the design question is there to surface assumptions, not score points.
5. **Impact over consensus** — severity reflects consequence, not vote count. Agreement is reported as confidence, not importance. A CRITICAL finding from one specialist outranks a MEDIUM finding all three noticed.
6. **Not a style guide** — naming, formatting, and style nits are not design critiques. Skip them.
7. **Recommend, don't just present** — for User-directed findings, state which option you'd pick and why. The user overrides if they disagree. Exception: TENSION findings get a deciding factor instead, because honest uncertainty is more useful than a fabricated preference.
8. **Err toward user input** — when resolution classification is ambiguous, default to User-directed. The cost of asking is low; the cost of a wrong auto-apply is high.
9. **Findings then fixes** — this skill produces findings. When invoked by structured callers, the caller handles resolution. When invoked standalone, challenge resolves findings via `${CLAUDE_HOME:-~/.claude}/skills/mine.challenge/findings-protocol.md`.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We already challenged and fixed — no need to re-challenge" | Fixes can introduce new problems or incompletely address the original finding. A re-challenge after fixes verifies the fixes actually resolved the issues and didn't create new ones. If the user asks "did we only challenge once?", the answer should have been no. |
| "Code review already covered this" | Code review and challenge are orthogonal gates — see `rules/common/git-workflow.md`. One does not substitute for the other. |
| "The findings are minor, not worth re-running" | Severity is about consequence, not complexity. A "minor" finding in a migration or API contract can cause production incidents. Re-challenge is cheap; a missed regression is not. |
| "This feels like a MEDIUM — the consequence is moderate" | Severity is consequence-based, not feel-based. Three critics agreeing on MEDIUM produces MEDIUM with 3/3 confidence — not an automatic CRITICAL. Ask: what happens in production if this is never fixed? Use that answer to set severity. High agreement is a signal to look harder at consequence, not an override of the formula. |

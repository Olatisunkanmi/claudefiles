# Frontend Workflow

## Scope Expansion Before UI Changes (CRITICAL)

When asked to change **anything** on a UI page, before writing a single line of code:

1. **Screenshot with Playwright** — if Playwright MCP tools are available and the app is running, take a live screenshot of the affected page(s)
2. **Identify the full surface** — find *everything* on the page related to the request, not just the literal ask
3. **Check sibling pages** — the same pattern almost always appears on related pages (e.g., one list page → all list pages; one sort column → all sort columns; one form → all forms)
4. **Present the full scope to the user** — one plan covering all of it, before implementing anything

**Why this matters:** Scoping to the literal request creates 3–4 follow-up prompts. One screenshot + sibling check prevents the entire loop.

**Example of the wrong approach:**
> User: "add sort indicators to the dashboard"
> Claude: *implements dashboard sort indicators only*
> User: "now do the same for the schedule list"
> (repeat for each page)

**Example of the right approach:**
> User: "add sort indicators to the dashboard"
> Claude: *screenshots dashboard and schedule list, notices list has the same unsorted pattern*
> Claude: "I see the dashboard and schedule list both need this. Here's the plan for both."

## After Implementing UI Changes

Take fresh screenshots to verify the change looks right before committing. Visual bugs only appear in screenshots — code review alone is not sufficient for UI work.

## Screenshots Before Any Design Review (MANDATORY)

Before running **any** frontend design review — UX audit, interface design critique, HCD review, anti-pattern scan — always get visual context first:

1. Check for an existing `.claude/audits/screenshots/current/` directory; if present and recent, read those screenshots
2. If Playwright MCP tools are available and a dev server is running, take fresh screenshots of all main pages and save to `.claude/audits/screenshots/current/`
3. Read each screenshot alongside the code — visual review catches overflow, clipping, empty states, contrast failures, and density issues that are invisible in code alone

This applies regardless of which skill or command triggers the review. Individual skill files do not need to repeat this step.

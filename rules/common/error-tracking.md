# Error Tracking

Track non-trivial errors so failed approaches survive context compaction.

## Error File

Create once per session: `get-skill-tmpdir claude-errors`, then use `<dir>/errors.md`. Append-only, per-session.

## When to Track

Only errors that cost real effort: wrong API usage, architectural dead-ends, dependency conflicts, configuration mysteries, silently wrong results. Skip typos, lint errors, obvious first-attempt failures.

## Entry Format

```markdown
### [short description] — Attempt N
- **Tried:** what approach was taken
- **Result:** why it failed
- **Next:** what to try differently (or "Resolved: [how]")
```

Before retrying a failed approach, read the error file first.

# Lenses Reference

## Parameters

| Lens | Tool | Options | Also Gather |
|------|------|---------|-------------|
| restore-context | recent_chats | `--n 5 --verbose` | `git status`, `git log -10` |
| extract-learnings | recent_chats | `--n 20` | — |
| find-gaps | search_conversations | `--query "confused struggling"` | — |
| review-process | recent_chats | `--n 20 --verbose` | recent git log |
| run-retro | recent_chats | `--n 20 --project NAME --verbose` | full git history |
| extract-decisions | search_conversations | `--query "decided chose trade-off"` | — |
| find-antipatterns | search_conversations | `--query "again same mistake repeated"` | — |

## Core Questions

| Lens | Ask |
|------|-----|
| restore-context | What's unfinished? What were the next steps? |
| extract-learnings | Where did understanding shift? What mistakes became lessons? |
| find-gaps | What topics recur? Where is guidance needed repeatedly? |
| review-process | Is there planning before coding? Is debugging systematic? |
| run-retro | How did the solution evolve? What worked? What was painful? |
| extract-decisions | What trade-offs were discussed? What was rejected and why? |
| find-antipatterns | What mistakes repeat? What confusions persist? |

**Follow-ups**: find-gaps suggests `learn-anything`. extract-decisions suggests `/update-claudemd`.

## Supplementary Search Patterns

When recent retrieval doesn't surface enough, use targeted searches:

| Lens | Query |
|------|-------|
| extract-learnings | `--query "learned realized understand clicked"` |
| find-gaps | `--query "confused struggling help don't understand"` |
| extract-decisions | `--query "decided chose instead trade-off because"` |
| find-antipatterns | `--query "again same mistake repeated forgot"` |

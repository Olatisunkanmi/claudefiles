# Tool Reference

## recent_chats.py

Retrieve recent conversation sessions with all messages.

```bash
cm-recent-chats --n 3
```

| Option                    | Effect                                                 |
| ------------------------- | ------------------------------------------------------ |
| `--n N`                   | Number of sessions (1-20, default 3)                   |
| `--sort-order`            | 'desc' (newest first, default) or 'asc'                |
| `--before DATE`           | Sessions before this datetime (ISO)                    |
| `--after DATE`            | Sessions after this datetime (ISO)                     |
| `--project NAME`          | Filter by project name(s), comma-separated             |
| `--verbose`               | Include files_modified and commits                     |
| `--format`                | 'markdown' (default) or 'json'                         |
| `--include-notifications` | Include task notification messages (hidden by default) |

Use `--verbose` for lenses that need file/commit context (restore-context, review-process, run-retro).

## search_conversations.py

Search for sessions containing keywords using full-text search (FTS5/FTS4/LIKE cascade).

```bash
cm-search-conversations --query "keyword"
```


| Option | Effect |
|--------|--------|
| `--query` | Required - substantive keywords |
| `--max-results N` | Limit results (1-10, default 5) |
| `--project NAME` | Filter by project name(s), comma-separated |
| `--verbose` | Include files_modified and commits |
| `--format` | 'markdown' (default) or 'json' |
| `--include-notifications` | Include task notification messages (hidden by default) |

**Output**: Default markdown format (token-efficient):
```
## myproject | 2026-02-01 10:00
Session: abc123

### Conversation

**User:** ...
**Assistant:** ...
```

Use `--format json` when structured data is needed.

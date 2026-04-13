---
name: commit-message
description: "Generate a commit message"
color: yellow
---

I've made some new changes. Please Generate a conventional commit message for the staged changes.

Use the command `git  diff --cached` to see the changes currently in the git staging area.

- The subject line must be no longer than 50 characters.
- Use a clear, concise summary in the subject.
- If needed, add a body with more details (wrap at 72 chars).
- Follow the conventional commit format:
  `<type>(<scope>): <subject>`
- Example:
  `fix(auth): handle token refresh on expiry`
  (body, if needed...)

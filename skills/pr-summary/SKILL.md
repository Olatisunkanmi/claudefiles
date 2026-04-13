---
name: pr-summary
description: Generate a PR summary
color: red
---

Please generate a PR summary for the changes in the current branch compared to the default branch.

Find the default branch using the git command `git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'`

Your task is to create a concise and informative summary that captures the essence of these changes. Please follow these guidelines:

1. **Overview**: Begin with a brief description of the purpose of the pull request.
2. **Key Changes**: List the main modifications made, including:
   - New features added
   - Bugs fixed
   - Refactoring completed
3. **Impact**: Explain how these changes affect the project or codebase.
4. **Related Issues**: Mention any related issue numbers or discussions that the pull request addresses.
5. **Testing**: Include notes on any testing that should be conducted by testers and reviewers of the pull request.

Save this PR summary as a mardown file. Use the branch name and append the current date time as the file name.

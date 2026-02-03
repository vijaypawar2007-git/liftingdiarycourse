Commit all changes in the current branch with an appropriate commit message.

## Pre-commit Checks

1. **Branch Protection**: First check if on `master` or `main` branch. If so, REFUSE to commit and inform the user that changes should be merged via pull request instead.

2. **Gather All Changes**: Run `git status` to identify:
   - Modified files (staged and unstaged)
   - Untracked files (new files not yet added to git)
   - Deleted files

## Staging Requirements

**CRITICAL**: You MUST stage ALL changes before committing:
- Use `git add <file>` for each modified file
- Use `git add <file>` for each untracked/new file
- Do NOT use `git add .` or `git add -A` (may include sensitive files)
- Explicitly list and add every file shown in `git status`

## Commit Message

1. Run `git log --oneline -5` to understand the commit message style
2. Run `git diff --staged` to analyze all staged changes
3. Write a clear, descriptive commit message that:
   - Summarizes the nature of changes (feature, fix, refactor, docs, etc.)
   - Focuses on "why" not just "what"
   - Follows the repository's existing style

## Verification

After committing, run `git status` to confirm:
- No unstaged changes remain
- No untracked files were missed
- The commit was successful

If any files were missed, stage and amend the commit or create a follow-up commit.
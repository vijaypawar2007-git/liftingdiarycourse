Push the current branch to remote and create a pull request to merge into master.

## Pre-flight Checks

1. **Branch check**: Verify you are NOT on master/main branch
   - If on master/main, REFUSE and explain that PRs should be from feature branches

2. **Uncommitted changes**: Run `git status` to check for uncommitted changes
   - If changes exist, ask user if they want to commit first before pushing

3. **Remote tracking**: Check if branch already tracks a remote branch

## Execution Steps

1. **Push to remote**: Run `git push -u origin <current-branch-name>`
   - The `-u` flag sets up tracking for future pushes

2. **Analyze changes for PR**:
   - Run `git log master..HEAD --oneline` to see all commits in this branch
   - Run `git diff master...HEAD` to see the full diff against master
   - Review ALL commits, not just the latest one

3. **Create Pull Request**: Use `gh pr create` with:
   - **Title**: Short, descriptive (under 70 characters), follows repo style
   - **Body**: Include:
     - Summary section with bullet points of changes
     - Test plan section if applicable
     - Footer with Claude Code attribution

## PR Format

```
gh pr create --title "Title here" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] Manual testing steps

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Post-PR Actions

1. Run `gh pr view` to confirm PR was created
2. Report the PR URL to the user
3. If PR checks fail, review the errors and suggest fixes

## Error Handling

- If push is rejected, check if branch needs rebasing on master
- If PR creation fails, report the specific error from GitHub
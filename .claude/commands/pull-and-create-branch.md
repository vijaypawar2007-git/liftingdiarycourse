Switch to master, pull latest changes, and create a new feature branch.

## Branch Name

The new branch will be named: `$ARGUMENTS`

## Pre-flight Checks

1. **Check for uncommitted changes**: Run `git status` first
   - If there are uncommitted changes, STOP and ask the user what to do:
     - Commit them first
     - Stash them
     - Discard them
   - Do NOT proceed with uncommitted changes as they may be lost

2. **Verify remote access**: Ensure the remote repository is accessible

## Execution Steps

1. **Switch to master**: Run `git checkout master`
   - If checkout fails due to local changes, report the error

2. **Pull latest changes**: Run `git pull origin master`
   - Ensure the local master is up-to-date with remote

3. **Create new branch**: Run `git checkout -b $ARGUMENTS`
   - This creates and switches to the new branch in one command

## Verification

After completion, run `git branch` to confirm:
- You are on the new branch (marked with *)
- The branch was created from the latest master

## Error Handling

- If branch name already exists, inform the user and ask if they want to:
  - Switch to the existing branch
  - Delete and recreate it
  - Use a different name
- If pull fails due to conflicts, report and let user resolve
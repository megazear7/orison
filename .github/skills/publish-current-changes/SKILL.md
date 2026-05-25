---
name: publish-current-changes
description: When you are asked to publish the current work
argument-hint: Optional commit message or publishing target
user-invocable: true
---

# Publish Current Changes

## When to Use

- When you are asked to publish the current work.

## Procedure

1. Inspect the current git state and review the current changes.
2. Bump the minor version in `package.json`.
3. Create a new branch for the changes with a descriptive name based on the commit message or change summary.
4. Validate before publishing by running `npm run test`.
5. Stage everything.
6. Commit the changes and provide a detailed commit message.
7. Push the current branch.
8. Open a pull request on Github using `gh` cli.
9. Update the pull request description with lots of details.
10. Merge the pull request.
11. Check out main and pull the latest changes to ensure the local repository is up to date.
12. Use `npm publish` and ask me to authenticate with npm.

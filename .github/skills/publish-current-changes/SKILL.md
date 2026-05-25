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
5. Run `npm run fix` to automatically fix any linting issues.
6. Stage everything.
7. Commit the changes and provide a detailed commit message.
8. Push the current branch.
9. Open a pull request on Github using `gh` cli.
10. Update the pull request description with lots of details.
11. Merge the pull request.
12. Check out main and pull the latest changes to ensure the local repository is up to date.
13. Use `npm publish` and ask me to authenticate with npm.

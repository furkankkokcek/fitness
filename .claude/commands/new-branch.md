Create a new feature or fix branch from the latest main.

Steps:
1. Switch to main and pull latest: `git checkout main && git pull origin main`
2. Create and switch to new branch: `git checkout -b <branch-name>`

Branch naming conventions used in this repo:
- `feature/<short-description>` — new feature
- `fix/<short-description>` — bug fix
- `refactor/<short-description>` — code restructure

Always develop on a branch, never commit directly to main.

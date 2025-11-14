## Contributing

Thank you for helping improve this project — we welcome contributions. This document explains how to get set up, branch and commit, run tests, and prepare PRs so reviews are fast.

**Getting Started**
- Install dependencies: `npm install` (or `pnpm install` / `yarn`).
- Start dev server: `npm run dev`.
- Run type checks and build locally: `npm run build` or `npm run type-check` if available.

**Branching & Commit Style**
- Branches: use concise prefixes: `feature/`, `bugfix/`, `chore/`, `hotfix/` (e.g. `feature/payroll-import`).
- Commit messages: follow Conventional Commits (type(scope): subject). Example: `feat(payroll): add CSV importer`.
- Keep PRs small and focused. If a change is large, open a draft PR and split work into follow-ups.

**Testing & Linting**
- Run tests: `npm test` (or `pnpm test`).
- Lint: `npm run lint`.
- Run type checks (TypeScript): `npm run type-check` or `npm run build`.
- Add tests for new features or bug fixes. PRs that change behavior must include tests when feasible.

**Continuous Integration (CI)**
- All PRs must pass CI checks: linting, tests, and type-check/build before merging.
- Do not merge when CI is red. If CI is flaky, note it in the PR and re-run the job.

**Pull Request Checklist**
Include this checklist in your PR description and mark items as completed:
- [ ] Linked to an issue (or created a new issue explaining the change)
- [ ] Descriptive title and summary
- [ ] Tests added/updated for new behavior
- [ ] Linting and typechecks pass locally
- [ ] Screenshots or GIFs included for UI changes
- [ ] Any database/migration steps documented (if applicable)
- [ ] Changelog entry added (if this repo keeps a changelog)

**Review & Merge**
- Request 1–2 reviewers depending on scope.
- Use GitHub’s squash merge for feature branches unless instructed otherwise.
- Add a short summary in the merge commit message if the PR is large.

If you have questions or need help, open an issue and tag a maintainer.

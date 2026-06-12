## ADDED Requirements

### Requirement: GitHub CI verifies supported Node runtimes
The repository SHALL run GitHub Actions verification on Windows for both the minimum supported Node.js runtime declared by `package.json` and the current stable Node.js runtime used by the project workflow.

#### Scenario: CI verifies minimum Node support
- **WHEN** code is pushed to `main`, `master`, or `codex/**`, or a pull request targets `main` or `master`
- **THEN** GitHub Actions runs install, typecheck, tests, build, and strict OpenSpec validation on Node `20.19.0`

#### Scenario: CI verifies current Node support
- **WHEN** code is pushed to `main`, `master`, or `codex/**`, or a pull request targets `main` or `master`
- **THEN** GitHub Actions runs install, typecheck, tests, build, and strict OpenSpec validation on Node `24`

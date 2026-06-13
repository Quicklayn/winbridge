# agent-orchestration Specification

## Purpose
Defines Codex/OpenSpec orchestration, subagent review gates, and repository workflow expectations for safe development.
## Requirements
### Requirement: OpenSpec-first workflow
The project SHALL use OpenSpec proposals, specs, design notes, and tasks for behavior changes that affect remote assistance, security, networking, native Windows APIs, installer behavior, or user-visible workflows.

#### Scenario: New remote capability requested
- **WHEN** a task adds or changes a remote capability
- **THEN** Codex creates or updates an OpenSpec change before implementation

### Requirement: Scoped subagent delegation
Codex SHALL delegate to subagents only for explicit, bounded work with disjoint file ownership, documented safety invariants, and a clear handoff output.

#### Scenario: Worker receives implementation task
- **WHEN** a worker subagent is assigned implementation work
- **THEN** the prompt names allowed files or modules, out-of-scope areas, acceptance criteria, tests, and stop conditions

### Requirement: Security review gate
Changes touching capture, input, authentication, authorization, relay routing, tokens, logging, installer behavior, startup behavior, privilege elevation, or background services SHALL receive an explicit security review before release.

#### Scenario: Pull request touches input handling
- **WHEN** a pull request modifies remote input code
- **THEN** the reviewer verifies authenticated, authorized, active, visible-session gating and tests denial/revocation paths

### Requirement: Handoff traceability
Each delegated result SHALL report assumptions, edited paths or inspected paths, verification performed, and any OpenSpec impact.

#### Scenario: Subagent completes work
- **WHEN** a subagent returns a result
- **THEN** the main thread records how the result was used or why it was rejected

### Requirement: GitHub CI verifies supported Node runtimes
The repository SHALL run GitHub Actions verification on Windows for both the minimum supported Node.js runtime declared by `package.json` and the current stable Node.js runtime used by the project workflow.

#### Scenario: CI verifies minimum Node support
- **WHEN** code is pushed to `main`, `master`, or `codex/**`, or a pull request targets `main` or `master`
- **THEN** GitHub Actions runs install, typecheck, tests, build, and strict OpenSpec validation on Node `20.19.0`

#### Scenario: CI verifies current Node support
- **WHEN** code is pushed to `main`, `master`, or `codex/**`, or a pull request targets `main` or `master`
- **THEN** GitHub Actions runs install, typecheck, tests, build, and strict OpenSpec validation on Node `24`

### Requirement: GitHub CI uses least-privilege bounded jobs
The repository SHALL run verification-only GitHub Actions jobs with explicit read-only repository contents permissions and an explicit job timeout. These workflow hardening controls MUST NOT change the verified Node runtime matrix or skip install, typecheck, tests, build, or strict OpenSpec validation.

#### Scenario: CI declares read-only repository permissions
- **WHEN** GitHub Actions runs the verification workflow
- **THEN** the workflow requests only read access to repository contents
- **AND** the workflow does not request write-capable repository permissions

#### Scenario: CI jobs are timeout bounded
- **WHEN** GitHub Actions runs each Windows Node matrix verification job
- **THEN** the job has an explicit timeout
- **AND** the job still runs install, typecheck, tests, build, and strict OpenSpec validation

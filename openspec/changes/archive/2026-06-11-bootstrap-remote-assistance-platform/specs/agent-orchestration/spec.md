## ADDED Requirements

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

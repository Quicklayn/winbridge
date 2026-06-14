## MODIFIED Requirements

### Requirement: Stable local test runner
The repository SHALL run local `npm test` through serial per-file Vitest invocations using a process-based worker pool. The runner MUST discover `.test.ts` files under `apps/` and `packages/`, invoke each discovered file once, include `--pool forks`, `--maxWorkers 1`, `--minWorkers 1`, and `--no-file-parallelism` for each invocation, and MUST NOT pass `--no-isolate`. The runner MAY invoke a discovered file one additional time only when the first invocation exits non-zero and its captured Vitest output contains a recognized transient IPC worker failure signature such as `ERR_IPC_CHANNEL_CLOSED` or `Channel closed`. Non-transient test failures MUST fail immediately without a retry.

#### Scenario: Runtime integration tests avoid thread worker IPC
- **WHEN** `npm test` runs in a Windows-compatible local development environment
- **THEN** `apps/agent-shell/src/runtime.integration.test.ts` and `apps/relay/src/server.integration.test.ts` are executed with the process-based Vitest worker pool
- **AND** the runner does not special-case either runtime integration test onto the thread-based worker pool

#### Scenario: Test discovery remains complete
- **WHEN** the test runner enumerates tests
- **THEN** it discovers `.test.ts` files under both `apps/` and `packages/`
- **AND** it invokes each discovered test file once with serial execution flags unless the bounded transient IPC retry condition applies

#### Scenario: Fork isolation remains enabled
- **WHEN** the test runner starts Vitest for a discovered test file
- **THEN** the invocation omits `--no-isolate`
- **AND** Vitest keeps its default forks isolation while still running only that test file

#### Scenario: Transient IPC failure is retried once
- **WHEN** a discovered test file's first Vitest invocation exits non-zero with captured output containing a recognized transient IPC worker failure signature
- **THEN** the runner retries that test file at most one time with the same serial forks invocation
- **AND** the runner exits non-zero if the retry also fails

#### Scenario: Non-transient test failure is not retried
- **WHEN** a discovered test file's first Vitest invocation exits non-zero without a recognized transient IPC worker failure signature
- **THEN** the runner exits non-zero without invoking that test file again

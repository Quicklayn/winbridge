## Context

`npm test` uses `scripts/run-tests.mjs` to discover `.test.ts` files under `apps/` and `packages/`, then invokes Vitest once per file with `--pool forks`, single-worker settings, and file-parallelism disabled. Recent local runs show transient Vitest worker IPC failures on Windows can still occur, but a blanket retry for every non-zero exit can make genuine test failures noisier and less deterministic.

## Goals / Non-Goals

**Goals:**

- Retry at most once only when the first Vitest run exits non-zero and its output contains a recognized transient IPC channel-closed signature.
- Fail immediately for ordinary assertion, type, startup, or configuration failures that do not match the transient signature.
- Keep per-file discovery, prioritization, forks pool, single-worker execution, and default isolation behavior.
- Make the retry policy testable without recursively running the full suite from inside a test.

**Non-Goals:**

- No product runtime behavior changes.
- No new dependencies.
- No capture, input, relay, token, audit, installer, service, startup, or privilege behavior changes.
- No attempt to hide failing tests or suppress Vitest output.

## Decisions

- Extract runner policy helpers into `scripts/run-tests-lib.mjs`.
  - Rationale: unit tests can import pure classification and argument-building helpers without spawning the full suite.
  - Alternative considered: test `scripts/run-tests.mjs` by spawning it. That risks recursive test execution and slower, brittle tests.

- Capture child stdout/stderr in the runner, replay it to the parent process, and classify the combined output.
  - Rationale: transient IPC failure signatures appear in Vitest output, while `spawnSync` status alone cannot distinguish assertion failures from worker-channel instability.
  - Alternative considered: retry based on exit code only. That preserves current behavior but continues to retry real failures.

- Match a narrow signature: `ERR_IPC_CHANNEL_CLOSED` or `Channel closed`.
  - Rationale: these are the observed Node/Vitest IPC failure markers. Keeping the signature narrow avoids treating arbitrary failures as transient.

## Risks / Trade-offs

- [Risk] A future Vitest transient failure may use a different message and will not retry.
  → Mitigation: fail visibly, then extend the signature through another OpenSpec-tracked change if the failure mode is real.

- [Risk] Capturing and replaying output changes buffering slightly.
  → Mitigation: preserve stdout/stderr streams in order per stream for each child run and keep reporter output intact.

- [Risk] A real assertion failure could include the string `Channel closed`.
  → Mitigation: the retry is still bounded to one attempt and the second failure exits non-zero.

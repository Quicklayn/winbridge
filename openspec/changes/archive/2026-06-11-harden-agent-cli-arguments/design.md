## Context

The agent shell is a non-native protocol exerciser, not a production client. It still drives consent and visible-session workflow simulations, so CLI mistakes should be explicit. The current parser lives inside `index.ts`, exits directly, and starts runtime at module load, which makes focused parser tests awkward.

## Goals / Non-Goals

**Goals:**

- Make CLI parsing unit-testable without starting WebSocket runtime.
- Reject unknown flags and malformed consent-sensitive option values.
- Keep usage failures bounded and avoid echoing raw secret-like argument values.
- Preserve current defaults for valid omitted options.

**Non-Goals:**

- No new remote action capability.
- No production CLI framework or dependency.
- No changes to the runtime consent state machine, relay protocol, capture, input, installer, services, startup, or privilege behavior.

## Decisions

- Introduce a small `args.ts` parser module that exports `parseArgs`, `AgentShellUsageError`, and a usage string. This keeps index startup simple and allows direct parser tests.
- Throw a bounded usage error instead of calling `process.exit` from the parser. The CLI entrypoint remains responsible for printing usage and exiting.
- Reject unknown and duplicate flags. Silent typos are risky for consent workflow exercises, especially around `--visible-session`, `--host-decision`, and permission-related flags.
- Parse `--visible-session` as a strict boolean. Omitted remains false; provided values must be `true` or `false`.

## Risks / Trade-offs

- Existing local scripts that pass unknown options will fail instead of being ignored -> intentional because ignored consent workflow options are misleading.
- Refactoring startup parsing touches CLI entrypoint code -> keep runtime behavior unchanged after successful parse and cover parser behavior with focused tests.

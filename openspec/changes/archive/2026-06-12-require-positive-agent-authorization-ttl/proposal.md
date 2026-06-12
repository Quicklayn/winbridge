## Why

The agent shell currently accepts `--authorization-ttl-ms 0` through the same timer parser used for lifecycle delays, while the shared authorization model rejects zero TTL before creating records. This creates a fail-late development path where a host can emit an approval with an immediately expired authorization window instead of rejecting the unsafe consent option before connecting.

## What Changes

- Require `--authorization-ttl-ms` and direct runtime `authorizationTtlMs` values to be positive integers from `1` through the safe timer delay bound.
- Keep lifecycle simulation delays such as revoke, pause, resume, terminate, and disconnect at the existing `0` through safe timer delay bound, because immediate lifecycle simulations are valid after visible activation.
- Update expiration-boundary tests to use a positive, very short authorization TTL rather than zero.
- Document the agent shell's positive authorization TTL requirement.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: require the development agent shell to reject zero authorization TTL inputs before relay connection or workflow scheduling.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/runtime.ts`, and focused agent-shell tests.
- Affected docs/specs: agent shell consent workflow OpenSpec and security/architecture documentation for the development CLI.
- Security impact: touches authorization/consent workflow validation. It tightens fail-closed behavior and aligns CLI/runtime behavior with the existing session authorization model.
- Non-goals: no native Windows capture/input, relay transport change, installer/startup/service behavior, token handling, logging format change, privilege elevation, hidden session behavior, persistence, credential access, AV/EDR evasion, or Windows prompt bypass.

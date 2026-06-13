## Why

Host indicator events correctly deactivate when a viewer disconnects or a host session ends, but the read-only host status snapshot can still be derived from the last authorization snapshot instead of the deactivated indicator. Host UI wiring needs status to fail closed to inactive after deactivation and, when safe, expose a bounded inactive cause without leaking private reason text.

## What Changes

- Prefer the last inactive host indicator when formatting host status, so status stays inactive after peer disconnect, local disconnect, expiration, revocation, termination, socket close, or runtime stop.
- Add optional bounded `inactiveCause` metadata to host status snapshots and host status CLI output only when the local host indicator is inactive.
- Keep status reads local and read-only: no protocol sends, audit writes, permission grants, signaling, reconnect, lifecycle control, or authorization mutation.
- Keep peer ids, display names, tokens, pairing codes, signal payloads, raw close reason text, and private lifecycle reasons out of host status output.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Host status snapshots and host status CLI output reflect inactive local indicator state and bounded inactive cause metadata after local host indicator deactivation.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/host-control-prompt.ts`, and focused tests.
- Affected docs/specs: `README.md`, `docs/security-model.md`, and `openspec/specs/agent-shell-consent-workflow/spec.md` via this change's delta.
- No dependency changes.
- Does not touch capture, input, auth, relay behavior, installer, startup, services, tokens, log persistence, or privilege elevation.

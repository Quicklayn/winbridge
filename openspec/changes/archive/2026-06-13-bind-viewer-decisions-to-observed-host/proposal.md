## Why

The viewer runtime currently accepts a `session-authorization-decision` addressed to the local viewer without first proving that the decision's `hostPeerId` is the observed opposite-role host. A forged or misdirected development lifecycle stream can therefore bind viewer authorization to an unobserved host id before later lifecycle messages authorize viewer-originated `signal` sends.

## What Changes

- Require viewer-side authorization decisions to match the observed opposite-role host before local `received` event emission or authority binding.
- Keep decisions for another viewer, legacy host-consent decisions, unbound lifecycle state, mismatched authority updates, and denied-decision follow-up handling fail-closed.
- Update synthetic lifecycle integration tests so valid host lifecycle streams include explicit trusted host presence.
- Add focused coverage proving unobserved-host decisions are ignored without leaking host ids, authorization ids, reasons, grant scopes, or signal payloads.
- Non-goals: no relay protocol change, no reconnect behavior, no native capture/input, no hidden access, no credential collection, and no consent bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: strengthen viewer authorization authority binding by requiring local observation of the host authority before accepting a `session-authorization-decision`.

## Impact

- Code: `apps/agent-shell/src/runtime.ts`
- Tests: `apps/agent-shell/src/runtime.integration.test.ts`
- Specs: `openspec/specs/agent-shell-consent-workflow/spec.md`
- Safety impact: prevents unobserved or spoofed host identities from seeding viewer-side signal authorization state.
- Touches: agent shell authorization workflow and local logs/events. Does not touch capture, input, relay, installer, startup, services, tokens, privilege elevation, or Windows APIs.

## Why

The agent shell currently records any same-session `peer-disconnected` notice for a non-local peer as remote disconnect state. A forged or misdirected notice for an unobserved or different peer can suppress delayed revoke/pause/terminate/expiration workflow, block public sends, and deactivate the host indicator even though the trusted remote peer is still present.

## What Changes

- Require inbound `peer-disconnected` notices to match the already observed opposite-role peer before they can change local disconnect state.
- Treat unbound, same-role, or mismatched disconnect notices as unsafe inbound protocol input before local `received` event emission.
- Add integration coverage proving ignored disconnect notices do not deactivate the host indicator, suppress delayed host workflow, or leak peer metadata in local diagnostics.
- Non-goals: no reconnect behavior, no capture/input implementation, no hidden session behavior, no relay protocol expansion, and no acceptance of peer-originated forged disconnects.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: tighten peer disconnect state handling so only trusted bound remote peer disconnect notices affect local workflow and indicator state.

## Impact

- Code: `apps/agent-shell/src/runtime.ts`
- Tests: `apps/agent-shell/src/runtime.integration.test.ts`
- Specs: `openspec/specs/agent-shell-consent-workflow/spec.md`
- Safety impact: improves lifecycle abuse resistance by preventing unbound disconnect notices from suppressing revocation/audit timers or hiding active host indicators.
- Touches: agent shell lifecycle, authorization workflow state, logs/events. Does not touch capture, input, installer, startup, services, tokens, privilege elevation, or Windows APIs.

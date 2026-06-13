## Why

After a host issues the explicit `disconnect` command, the development host
control prompt can remain open even though the local host session is being
closed. That leaves a stale-looking control surface after the host has chosen
the strongest immediate revocation action.

## What Changes

- Stop the interactive host control prompt after a successful host `disconnect`
  command.
- Keep the prompt open when `disconnect` fails so the operator can see the
  sanitized runtime error and choose another valid command.
- Preserve the existing managed runtime disconnect gate; this change only
  updates prompt lifecycle behavior after success.
- Add regression coverage and documentation for the prompt shutdown behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host control prompt lifecycle after a
  successful explicit host disconnect.

## Impact

- Affected code: `apps/agent-shell/src/host-control-prompt.ts` and tests.
- Affected docs: README and safety/architecture notes for host controls.
- Security impact: improves visible local operator state after immediate host
  disconnect; does not add capture, input, relay, installer, startup, service,
  token, log, privilege, or persistence behavior.
- Non-goals: no native Windows UI, no screen capture, no remote input, no
  reconnect, no hidden session behavior, and no protocol shape changes.

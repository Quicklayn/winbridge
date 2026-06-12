## Why

Interactive host consent is specified and documented as accepting exact `approve` or `deny` responses, but the current prompt parser trims input before comparison. That can treat whitespace-padded input such as ` approve ` as approval, weakening the explicit-response contract.

## What Changes

- Require the interactive host consent prompt parser to accept only exactly `approve` or exactly `deny`.
- Treat whitespace-padded, differently cased, blank, cancelled, or otherwise invalid prompt input as `none`.
- Add focused tests proving whitespace-padded prompt input fails closed and does not produce approval or denial.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: interactive host consent prompt responses must be exact, with whitespace-padded approval or denial input failing closed.

## Impact

- Affected code: `apps/agent-shell/src/host-consent-prompt.ts`.
- Affected tests: `apps/agent-shell/src/host-consent-prompt.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches host consent input parsing only. Does not touch native Windows APIs, capture, input injection, clipboard sync, file transfer, relay routing, installer behavior, startup persistence, services, tokens, production identity, or privilege elevation.

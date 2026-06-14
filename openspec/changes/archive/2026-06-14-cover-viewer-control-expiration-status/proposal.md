## Why

The viewer control prompt already prints viewer status through the shared viewer status formatter, but its requirement and tests do not explicitly pin authorization expiration metadata. Since expiration is a consent boundary, the interactive status path should be covered the same way as the one-shot viewer status path.

## What Changes

- Clarify that viewer control prompt `status` output may include bounded `expiresAt` metadata for active or paused authorizations.
- Add focused viewer control prompt coverage showing `expiresAt` is printed without invoking controls, public sends, or host-only operations.
- Keep inactive, remote-disconnect, local-leave, and local-socket-close viewer control status output from retaining stale expiration metadata through the existing viewer status snapshot contract.
- No runtime protocol field, relay behavior, capture, input, reconnect, native Windows, installer, service, startup, token, log, or privilege behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: clarify and test viewer control prompt status output for bounded authorization expiration metadata.

## Impact

- Affected code: `apps/agent-shell/src/viewer-control-prompt.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Affected behavior: no new behavior; this pins an existing local CLI status rendering path to the same consent-boundary metadata contract as viewer status output.
- Safety impact: improves regression coverage for local consent visibility metadata and does not add remote capability.
- Touch areas: user-visible local CLI status workflow and tests. This does not touch capture, input, auth decisions, relay routing, installer behavior, startup persistence, services, tokens, logs, privilege elevation, Windows security prompts, or native Windows APIs.

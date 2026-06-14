## Why

Session authorization records are consent-bearing state: they decide whether remote actions can be approved, activated, paused, revoked, or denied. The authorization schema already rejects secret-bearing `authorizationId` values, but its fixed `sessionId`, `hostPeerId`, and `viewerPeerId` fields still use the base identifier schemas, leaving a gap where raw token-like or credential-like text can become trusted authorization metadata.

## What Changes

- Reject secret-bearing metadata in session authorization record `sessionId`, `hostPeerId`, and `viewerPeerId` values before creating pending authorization state, parsing stored records, processing lifecycle transitions, or authorizing remote actions.
- Preserve existing safe development identifiers such as `session-demo`, `host-1`, and `viewer-1`.
- Add focused protocol tests proving rejection diagnostics are bounded and do not echo raw rejected identifiers.
- No new remote-access capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Adds non-secret fixed identifier requirements for authorization records.
- `protocol-identifiers`: Extends the shared secret-bearing identifier classifier requirement to cover session authorization fixed identifiers.

## Impact

- Affected code: `packages/protocol/src/authorization.ts` and `packages/protocol/src/authorization.test.ts`.
- Affected specs: `openspec/specs/session-authorization/spec.md` and `openspec/specs/protocol-identifiers/spec.md`.
- Safety impact: strengthens auth metadata validation and fail-closed behavior before any consent, host visibility, permission grant, capture, input, reconnect, clipboard, file-transfer, diagnostics, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.
- Touches auth and token-adjacent validation. It does not touch relay, installer, startup, services, logs, native Windows APIs, capture, input, or privilege elevation.

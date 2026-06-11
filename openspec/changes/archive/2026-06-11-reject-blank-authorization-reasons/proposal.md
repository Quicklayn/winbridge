## Why

Authorization denial, revocation, pause, resume, termination, and protocol request reasons are audit metadata for consent-first remote assistance. Some schemas still accept whitespace-only reason strings, which weakens explicit host intent and auditability without adding useful protocol meaning.

## What Changes

- Reject blank or whitespace-only authorization lifecycle reasons in the shared authorization schema.
- Reject blank or whitespace-only reason fields in authorization-related protocol messages.
- Preserve optional reasons where they are currently optional; reject them only when provided but blank, or when a required/denied reason is missing or blank.
- Add focused tests for state-machine helpers, direct schema parsing, and protocol message parsing.
- Non-goals: no new remote actions, capture, input, clipboard, file transfer, installer, startup, service, token, privilege elevation, or native Windows behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: require authorization record and transition reasons to be non-blank when present or required.
- `session-authorization-protocol`: require authorization-related protocol reason fields to be non-blank when present or required.

## Impact

- Affected code: `packages/protocol/src/authorization.ts`, `packages/protocol/src/authorization.test.ts`, `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`.
- Affected specs: `openspec/specs/session-authorization/spec.md`, `openspec/specs/session-authorization-protocol/spec.md` through this delta.
- Safety impact: improves auditability and explicit host intent; does not grant or automate remote access.

# Change: Type authorization snapshots as read-only

## Why
Session authorization records and consent-bound session grants are already deep-frozen at runtime after validation. Their exported TypeScript snapshot types still describe top-level fields and permission collections as mutable. That weakens the type contract around authorization evidence, granted permission scope, and visible-host requirements.

This change aligns the exported TypeScript snapshot types with the existing immutable authorization runtime behavior.

## What Changes
- Mark returned `SessionAuthorization` snapshots read-only at the TypeScript type level, including the permission list.
- Mark returned consent-bound `SessionGrant` snapshots read-only at the TypeScript type level, including consent flags and the permission list.
- Keep schema input construction and permission list parsing mutable-friendly.
- Update tests that intentionally attempt runtime mutation to use explicit mutable test casts.

## Safety Impact
- Touches authentication/authorization type contracts and focused authorization/grant tests.
- Does not change authorization lifecycle behavior, grant validation, permission parsing, protocol messages, relay routing, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens consent-first safety by making direct mutation of returned authorization evidence a compile-time error for ordinary callers.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No changes to available permissions, authorization transitions, grant expiration, host visibility requirements, or audit emission timing.

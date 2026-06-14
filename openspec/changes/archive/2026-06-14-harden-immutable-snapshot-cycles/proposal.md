# Change: Harden immutable snapshot helper against cycles

## Why
The shared protocol `deepFreeze()` helper recursively freezes trusted snapshots returned by protocol factories and parsers. It currently revisits object references without tracking them, so a cyclic or repeated local object graph can recurse unnecessarily or fail before freezing the snapshot root.

Validated protocol outputs are expected to be JSON-compatible and acyclic, but the helper is shared and generic. Making it cycle-safe aligns it with the audit-log helper and prevents recursion failure without changing protocol object shapes.

## What Changes
- Add visited-object tracking to the shared protocol `deepFreeze()` helper.
- Preserve existing behavior for primitives, `null`, already frozen values, arrays, nested objects, and JSON serialization.
- Add focused tests for cyclic and repeated references.

## Safety Impact
- Touches shared immutable snapshot infrastructure and focused immutable snapshot tests.
- Does not change validation, redaction, authorization, pairing, relay routing, protocol encoding, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens consent-first safety by keeping trusted snapshots resistant to caller mutation even when local helper inputs contain repeated or cyclic references.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No change to accepted protocol schemas, authorization grants, host visibility requirements, pairing rules, relay registration, or audit emission timing.

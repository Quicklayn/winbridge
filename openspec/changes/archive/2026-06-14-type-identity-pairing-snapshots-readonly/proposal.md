# Change: Type identity and pairing snapshots as read-only

## Why
Device identity records, pairing tickets, consumed pairing tickets, and paired-device records are already deep-frozen at runtime after validation. Their exported TypeScript types still describe trusted identity and pairing snapshots as mutable. That weakens the type contract around device identity evidence, pairing ticket replay resistance, and paired-device binding.

This change aligns the exported TypeScript snapshot types with the existing immutable identity and pairing runtime behavior.

## What Changes
- Mark returned `DeviceIdentity` snapshots read-only at the TypeScript type level.
- Mark returned `PairingTicket` snapshots read-only at the TypeScript type level.
- Mark returned `PairedDevice` snapshots read-only at the TypeScript type level.
- Keep schema input construction, relay audit construction, and local test builders mutable-friendly.
- Update tests that intentionally attempt runtime mutation to use explicit mutable test casts.

## Safety Impact
- Touches identity and pairing type contracts, a relay audit builder type that consumes device identity metadata, and focused identity tests.
- Does not change pairing code hashing, pairing ticket consumption, paired-device validation, relay registration, authorization grants, permission parsing, protocol messages, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens consent-first safety by making direct mutation of returned identity and pairing evidence a compile-time error for ordinary callers.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No changes to accepted identity fields, ticket expiration, ticket use consumption, paired-device binding, grant authorization, host visibility requirements, or audit emission timing.

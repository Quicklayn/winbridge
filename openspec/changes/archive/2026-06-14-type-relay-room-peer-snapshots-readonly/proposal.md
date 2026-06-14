# Change: Type relay room peer snapshots as read-only

## Why
The relay room registry already freezes registered peer records and returned room membership arrays at runtime. Its exported TypeScript types still describe `RelayPeer`, join results, leave results, and peer lookup collections as mutable. That makes caller code appear able to mutate trusted routing identity or callback references even though runtime rejects those mutations.

This change aligns the public type contract with the existing immutable relay snapshot behavior.

## What Changes
- Mark exported relay peer records as read-only at the TypeScript type level.
- Mark relay join, leave, and peer lookup collections as read-only arrays.
- Update relay tests so intentional runtime mutation checks use explicit mutable test casts.
- Preserve the serialized/runtime shape and existing relay behavior.

## Safety Impact
- Touches relay room registry type contracts and focused relay tests.
- Does not change protocol envelopes, routing decisions, pairing validation, authorization, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens abuse resistance by making mutation of trusted relay routing snapshots a compile-time error for ordinary callers.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No changes to NAT traversal, transport encryption, pairing semantics, relay message forwarding, or disconnect behavior.

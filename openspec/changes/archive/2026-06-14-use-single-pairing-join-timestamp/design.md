## Overview

`RoomRegistry.join()` already keeps pairing state inside the room boundary and records a viewer only after the host-created pairing ticket is consumed. This change narrows the time-of-check/time-of-record window by taking one `Date` snapshot for a viewer join attempt and passing that same value to both `consumePairingTicket()` and `createPairedDevice()`.

## Security Rationale

The pairing timestamp is authorization-adjacent metadata. A single timestamp makes the decision auditable and deterministic without widening access: expired tickets still fail, consumed tickets still fail, mismatched pairing codes still fail, and self-pairing still fails before registration. The raw pairing code remains confined to validation and is not stored, forwarded, logged, or audited.

## Alternatives Considered

- Leave separate `now()` calls in place: simpler, but it makes boundary behavior depend on clock-call timing and injected clock implementations.
- Relax paired-device validity checks at the expiration boundary: rejected because it would weaken the existing ticket validity invariant.

## Safety Impact

This change does not introduce a remote action capability. It only makes the existing relay join gate use one timestamp for a single viewer pairing decision. It does not add hidden sessions, unattended access, persistence, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, capture, input, token handling, or privilege elevation.

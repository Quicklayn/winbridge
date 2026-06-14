## Overview

`getHostStatus()` and `getViewerStatus()` each assemble fresh plain-object snapshots from runtime state. This change freezes those returned objects before exposing them to callers, keeping the status API read-only by construction while preserving the existing serialized shape.

## Security Rationale

Status surfaces carry host-visible state, authorization status, permission count, and bounded disconnect metadata. Freezing prevents caller code from widening or hiding a locally observed status object after validation. This does not change the underlying authorization state machine; it only hardens the boundary between trusted runtime state and caller-observable status metadata.

## Alternatives Considered

- Leave snapshots mutable and rely on documentation: rejected because "read-only" is stronger when enforced at runtime.
- Clone on every formatter call instead of freezing at the runtime API: rejected because it leaves direct runtime callers with mutable snapshots and duplicates defensive behavior across formatters.

## Safety Impact

This change does not introduce a remote action capability. It does not send protocol messages, alter consent decisions, activate host visibility, grant permissions, start capture, send input, reconnect peers, store secrets, or bypass host controls. Existing status metadata remains bounded and secret-safe.

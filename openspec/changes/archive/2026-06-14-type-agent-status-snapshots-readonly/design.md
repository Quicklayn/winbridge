## Overview

Wrap `AgentShellHostStatusSnapshot` and `AgentShellViewerStatusSnapshot` field definitions in TypeScript `Readonly<...>`. The runtime already freezes returned objects; this change aligns the public compile-time contract with runtime behavior and documentation.

## Implementation

- Change the exported status snapshot type aliases in `apps/agent-shell/src/runtime.ts` to `Readonly<{ ... }>` while preserving every field name and optionality.
- Keep `freezeStatusSnapshot()` unchanged except for type compatibility if needed.
- Update integration test helper typing so tests can still attempt runtime mutation intentionally without weakening the public exported types.
- Rename immutable lifecycle test titles so test output matches the contract.

## Safety Rationale

Status snapshots are local observability data. A read-only type prevents accidental compile-time mutation patterns in future host/viewer UI adapters while preserving the existing fail-closed runtime gates. Type-level readonly does not authorize sessions, grant permissions, start signaling, reconnect peers, invoke controls, start capture, send input, or bypass consent.

## Alternatives

- Keep only runtime `Object.freeze`: rejected because TypeScript consumers still see writable fields.
- Introduce a new wrapper object or class: rejected because it would change the public shape unnecessarily.
- Deep-readonly helper: rejected for now because status snapshots contain only scalar optional metadata fields.

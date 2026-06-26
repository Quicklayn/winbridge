## Context

The command kit has two relay configuration inputs:

- `--relay-host`, a shortcut that accepts only a host and builds
  `ws://<host>:8787/`.
- `--relay`, a full URL for custom hosts, schemes, and ports.

The shortcut already rejects loopback and unspecified hosts because it is meant
for two-PC command generation. The full URL validator rejects credentials,
query, fragments, token parameters, unsupported schemes, and unsafe scalars,
but it does not explicitly reject unspecified connect targets or non-root
paths.

## Goals / Non-Goals

**Goals:**

- Reject unspecified relay URL hosts for full `--relay` values.
- Reject non-root relay URL paths before rendering commands.
- Preserve valid localhost and LAN root relay URLs.
- Preserve bounded diagnostics and non-executing behavior.

**Non-Goals:**

- No changes to runtime relay URL parsing in agent-shell.
- No network probing or address discovery.
- No production relay deployment behavior.
- No changes to relay bind configuration beyond documentation.

## Decisions

- Validate full `--relay` URLs after `new URL()` normalization.
  - Rationale: normalized hostname/path checks are less brittle than ad hoc
    string parsing.
- Reject unspecified hosts but continue accepting localhost for `--relay`.
  - Rationale: localhost remains the default same-machine development workflow;
    unspecified addresses are bind targets, not connect targets.
- Reject paths other than `/`.
  - Rationale: the development relay endpoint is root WebSocket service
    semantics; paths are not part of the reviewed MVP command contract.

## Risks / Trade-offs

- Operators using a pathful reverse proxy URL would need a future explicit
  design change.
  - Mitigation: current MVP relay is development-scoped and root-only; a future
    deployment topology should get its own OpenSpec change.
- Some URL forms normalize differently across Node versions.
  - Mitigation: tests cover fixed unsafe forms and representative valid
    localhost/LAN root URLs.

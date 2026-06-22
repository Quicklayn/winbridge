# Design

## Overview

Add critical agent-shell modules to `REQUIRED_MVP_ENTRYPOINT_FILES`:

- host control prompt,
- viewer control prompt,
- viewer local control surface,
- viewer frame output,
- screen frame output,
- CLI shutdown path used to close local handles.

The existing entrypoint check already reports only the bounded
`missing-entrypoint` reason, so no new diagnostic path is needed.

## Safety

The doctor remains read-only. It still uses `exists()` checks only and does not
import runtime modules, start processes, open sockets, capture, apply input, or
write files.

## Testing

Update doctor tests to assert the critical module list is included and that a
missing viewer surface module fails with `missing-entrypoint` without echoing
the raw path.

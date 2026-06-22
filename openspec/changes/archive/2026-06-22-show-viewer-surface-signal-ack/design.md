# Design

## Overview

The local viewer surface already polls `/status` and renders bounded lifecycle
metadata. `/status` already sanitizes `authorizationId` but preserves safe
viewer status fields, including optional `signalProbeAckReceived`.

The generated page will append `signalProbeAckReceived=true` to the visible
status text only when the sanitized status value is exactly `true`.

## Safety

This remains read-only local status display:

- no protocol sends,
- no host-control invocation,
- no new input path,
- no raw signal payload exposure,
- no authorization ids in `/status`,
- no permission grant or readiness-to-authorization coupling.

The runtime remains authoritative for signal probe trust and for clearing stale
acknowledgement metadata after authorization loss.

## Testing

Add focused surface tests for:

- `/status` preserving bounded acknowledgement metadata while omitting
  authorization id,
- generated HTML rendering the acknowledgement flag from status JSON,
- generated HTML not referencing raw signal markers.

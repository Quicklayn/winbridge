## Overview

Update the project-facing documentation that describes `getHostStatus()` and `getViewerStatus()` so it matches the existing immutable snapshot behavior. The implementation already freezes returned status objects; this change makes README and security guidance explicit for future UI/native consumers.

## Documentation Plan

- In `README.md`, change the host one-shot status description from read-only-only wording to immutable read-only local snapshot wording.
- In `README.md`, change viewer status and signal acknowledgement text to say the returned metadata lives on immutable status snapshots and remains non-authorizing.
- In `docs/security-model.md`, update the development shell consent simulation section so host and viewer status snapshots are described as immutable local metadata snapshots.

## Safety Rationale

Status snapshots are local observability surfaces. Documentation must not imply that mutating returned objects can influence authorization, visibility, permissions, signaling, host controls, or workflow state. Calling out immutability makes future UI adapters treat status reads as snapshots rather than state handles.

This is documentation-only. It does not touch capture, input, relay forwarding, authentication, tokens, audit sinks, installer behavior, startup persistence, services, native Windows APIs, or privilege elevation.

## Alternatives

- Leave docs as "read-only" only: rejected because "read-only" describes intended use but does not tell integrators the object itself is frozen.
- Add runtime changes now: rejected because the runtime contract and tests already cover immutable status snapshots.

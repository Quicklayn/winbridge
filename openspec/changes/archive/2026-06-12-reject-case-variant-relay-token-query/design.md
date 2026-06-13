## Overview

This change makes relay token query handling canonical and fail-closed. The only accepted query parameter name for the development shared token remains lowercase `token`. Any parameter whose name case-insensitively equals `token` but is not exactly lowercase is treated as a token-bearing attempt and rejected before room registration.

## Security Rationale

The development relay token is not production authorization, but it is still a sensitive development access gate. Accepting or ignoring case-variant token names would create unclear behavior:

- Agent-shell URLs could carry token-like secrets through the relay URL path instead of the dedicated token option.
- A relay without shared-token configuration could silently ignore `Token=...` even though the URL is token-bearing.
- Audits could report token presence inconsistently.

Rejecting case variants keeps a single canonical client contract, avoids accidental token exposure in URLs, and maintains the current fail-closed behavior without broadening accepted authentication inputs.

## Implementation

- Add a small query-name predicate that checks whether a URL query parameter name case-insensitively equals `token`.
- In agent-shell CLI parsing and managed runtime validation, reject relay URLs containing any canonical or case-variant token query parameter.
- In the relay, collect token-like query entries case-insensitively:
  - `presented` is true when any token-like entry is present.
  - `value` is returned only when there is exactly one entry and its name is exactly `token`.
  - duplicate entries or non-canonical names produce no accepted value and therefore fail closed.
- Keep audit details metadata-only and continue excluding raw token values.

## Alternatives Considered

- Accept `Token` or `TOKEN` as aliases for `token`: rejected because it expands accepted authentication input and weakens the canonical contract.
- Reject broad names such as `accessToken` or `token_hint`: rejected for this increment because it could create false positives for future non-auth metadata. This change only covers exact case variants of `token`.

## Safety Impact

This change does not add remote access capability. It strengthens development relay admission checks and maintains the consent-first invariants: no hidden session, no unattended access, no credential harvesting, no security prompt bypass, and no native capture/input behavior.

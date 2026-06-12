## Context

The development relay uses in-memory rate limiters for repeated invalid shared-token attempts and malformed or rejected protocol messages. Their environment configuration is already exact enough to reject whitespace, fractions, negatives, and partial strings, but the current digit-only parser accepts leading-zero values such as `05` and `060000`.

## Goals / Non-Goals

**Goals:**

- Reject leading-zero development rate-limit environment values before constructing limiters.
- Preserve omitted defaults for invalid-token and invalid-message limiters.
- Preserve current minimum bounds and accepted canonical values.
- Keep diagnostics bounded to the variable name and generic constraint text.

**Non-Goals:**

- No changes to rate-limit algorithms, keys, audit detail schema, or close reasons.
- No distributed production abuse protection.
- No changes to consent, authorization, screen capture, input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, shared-token matching semantics, or production authentication.

## Decisions

1. Use a canonical positive decimal parser for rate-limit env values.
   - Rationale: rate-limit thresholds are security-relevant startup configuration. Canonical decimal strings avoid ambiguity in docs, tests, and deployment environments.
   - Alternative considered: keep accepting leading zeros. Rejected because other relay startup numeric settings already reject non-canonical representations.

2. Keep `0` syntactically parseable but rejected by the existing minimum bounds.
   - Rationale: this preserves current error behavior for zero-limit and too-small-window values while making leading-zero positive values invalid.
   - Alternative considered: reject `0` in the regex. Rejected because bound-specific errors are clearer and already covered.

3. Keep parser errors generic.
   - Rationale: environment values may expose deployment conventions. The variable name and constraint are enough to remediate.
   - Alternative considered: echo the rejected raw value. Rejected as unnecessary and inconsistent with bounded relay startup diagnostics.

## Risks / Trade-offs

- [Risk] A development setup with leading-zero rate-limit env values will fail at startup. -> Mitigation: use canonical values such as `5` and `60000`.
- [Risk] This remains single-process development abuse protection. -> Mitigation: keep production distributed abuse protection as a separate future OpenSpec design.

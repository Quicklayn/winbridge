## Context

The agent shell is a development exerciser for consent, visibility, authorization lifecycle, and relay behavior. Shared session authorization records already reject zero or negative TTL values before a record can be created, but the agent shell currently parses `--authorization-ttl-ms` through the generic workflow timer path that also permits immediate lifecycle delays.

Lifecycle delays and authorization TTL have different safety meanings:

- `--revoke-after-ms 0`, `--pause-after-ms 0`, `--terminate-after-ms 0`, and `--disconnect-after-ms 0` are immediate simulations that still happen after explicit approval and visible activation.
- `--authorization-ttl-ms 0` represents a zero-length consent window and can produce an approval/state sequence that contradicts the authorization model's positive expiration invariant.

## Goals / Non-Goals

**Goals:**

- Reject zero, negative, fractional, non-finite, and oversized authorization TTL values before relay connection or workflow scheduling.
- Preserve existing zero-delay lifecycle simulation behavior for revoke, pause, resume, terminate, and disconnect.
- Keep CLI validation and direct runtime validation aligned.
- Keep diagnostics bounded and generic; do not expose raw tokens, protocol payloads, private reasons, display names, screenshots, screen contents, or input contents.

**Non-Goals:**

- No change to relay protocol, relay role exclusivity, token handling, audit record shape, or native Windows behavior.
- No capture, input, installer, startup, service, privilege elevation, hidden session, persistence, credential access, AV/EDR evasion, or Windows prompt bypass work.
- No new production authorization store; this remains development agent-shell validation.

## Decisions

1. Split authorization TTL validation from generic workflow delay validation.

   Rationale: authorization TTL is a consent grant window and MUST be positive; lifecycle delays are post-activation simulation timers and can remain zero. Reusing one parser hides that safety distinction.

   Alternative considered: change all workflow timers to require `>= 1`. Rejected because immediate revocation/termination/pause simulations are valid failure-path tests after the host-visible active state exists.

2. Validate direct runtime options at construction time.

   Rationale: tests and future internal callers can bypass CLI parsing. Runtime creation should fail before opening a socket or sending `join-session`, matching other consent-sensitive runtime option checks.

   Alternative considered: rely on CLI parsing only. Rejected because it leaves a direct runtime fail-late path.

3. Replace zero-TTL expiration-boundary tests with positive short TTL tests.

   Rationale: expiration ordering still needs coverage, but tests should not encode an authorization window that the model rejects.

   Alternative considered: keep direct runtime zero TTL as a private test-only shortcut. Rejected because it would preserve inconsistent development behavior for a consent-sensitive option.

## Risks / Trade-offs

- Existing local scripts that used `--authorization-ttl-ms 0` will fail fast. Mitigation: use `--authorization-ttl-ms 1` for near-immediate expiration tests.
- Short-TTL integration tests can be timing-sensitive. Mitigation: keep lifecycle delays at `0` and use wait helpers that observe emitted expired state rather than assuming exact timer order.
- There are two validation entry points. Mitigation: add focused CLI and runtime tests so drift is caught.

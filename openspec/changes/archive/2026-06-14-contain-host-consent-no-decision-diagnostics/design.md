## Context

The host runtime resolves interactive host consent through a provider. If the provider times out or returns anything other than `"approve"` or `"deny"`, the runtime returns `"none"` and the authorization request remains unapproved.

The current timeout and invalid-decision branches log bounded diagnostics directly. These log lines are observability only. They are not consent evidence and must not decide whether the fail-closed no-decision path remains stable.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic logger failures for interactive host consent timeout and invalid/no-accepted-decision branches.
- Preserve fail-closed no-approval behavior for timeout and invalid provider responses.
- Preserve bounded diagnostic text when the logger works.
- Add regression coverage that logger failure is secret-safe and non-authorizing.

**Non-Goals:**

- No change to interactive prompt parsing, timeout values, host decision provider semantics, grant narrowing, authorization TTL, relay behavior, or status snapshots.
- No change to provider-thrown-error diagnostics, which already use the best-effort runtime diagnostic path.
- No new audit event, persistent queue, external dependency, native UI, capture, input, clipboard, file-transfer, diagnostics collection, installer, service, startup persistence, or privilege-elevation behavior.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, display names, credentials, private reasons, or remote content.

## Decisions

- Route only the timeout and invalid/no-accepted-decision diagnostic logger calls through the existing best-effort runtime log helper.
  - Rationale: the consent outcome is already non-approving; optional observability must not convert it into runtime error behavior.
  - Alternative considered: report runtime errors for logger failures. Rejected because logger failures in no-decision branches do not indicate a consent provider failure or trusted workflow event.

- Keep provider-thrown-error handling unchanged.
  - Rationale: thrown provider errors already produce sanitized runtime diagnostics and fail closed through the existing best-effort path.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss why interactive consent produced no decision.
  - Mitigation: working loggers still receive the same bounded text, while the security outcome remains fail-closed and non-authorizing.

- [Risk] Over-broad containment could hide provider failures.
  - Mitigation: containment is limited to explicit timeout and invalid/no-decision diagnostics; thrown provider errors continue through the existing runtime error diagnostic path.

# Security Review

## Scope

Reviewed relay-originated trusted viewer disconnect handling, local host audit
correlation and metadata, terminal-state behavior, post-cleanup scheduling,
failure containment, protocol-send absence, focused tests, documentation, and
OpenSpec artifacts.

## Findings

No blocking findings.

- The relay derives disconnect notices from the registered socket peer and
  rejects client-originated `peer-disconnected` messages.
- The runtime accepts a notice only for the current session and already
  observed opposite-role viewer, rejects self and mismatched notices, and
  requires a current host authorization snapshot before creating evidence.
- Remote disconnect is terminal for later `hello` and disconnect input, so a
  same-id rebind attempt cannot restore peer binding or create a second record.
- The local record uses a fixed action, accepted outcome, current session and
  authorization correlation, and an allowlisted bounded detail object.
- Input and capture blocking, recipient clearing, signal invalidation, and host
  indicator deactivation complete before the single `setImmediate` audit write.
- The path sends no protocol audit or disconnect message and performs no retry,
  reconnect, authorization change, or permission change.
- Slow or hostile sinks and failing callbacks or loggers cannot undo cleanup or
  expose raw failure text through the bounded audit-failure diagnostics.

## Safety Invariants

The change preserves explicit host consent, visible active-session state,
immediate host revocation and disconnect controls, authorization gates, and
fail-closed capture and input behavior. It introduces no hidden or unattended
session, persistence, credential access, keylogging, privilege elevation, or
security-product evasion path.

## Residual Risks

- Accepted disconnect summary logging may include the bounded peer id and role
  under the existing main specification; audit detail and audit-failure
  diagnostics remain more restrictive.
- The default MVP smoke still stops at an independent viewer required-action
  mapping mismatch even though both host and viewer audit summaries contain
  canonical disconnect evidence. That verifier-only drift is scoped to a
  separate OpenSpec change.

Neither item weakens the reviewed runtime boundary.

## Verification

- `npm run check`: passed.
- Focused agent-shell integration tests: 322 passed.
- `npm run verify`: passed, including all tests, build, and 21 strict OpenSpec
  items.
- Strict current-change validation: passed.
- Default non-native MVP smoke: all pre-audit checks passed; host disconnect
  evidence passed, with the independent viewer mapping mismatch recorded.
- Native Windows capture and input were not invoked by the review.

## OpenSpec Impact

The delta matches the reviewed implementation after terminal-state and
diagnostic-scope clarifications. No additional runtime capability is required
for this change.

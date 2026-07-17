## 1. Server frame freshness boundary

- [x] 1.1 Track stable frame-file versions with bounded opaque per-run generations and monotonic observation time.
- [x] 1.2 Return generation metadata only for stable `/frame` reads and keep unchanged versions from refreshing their age.
- [x] 1.3 Require bounded generation evidence on `/input` and atomically reject missing, malformed, unseen, superseded, or stale last-served evidence before the runtime send path.

## 2. Held-input cleanup

- [x] 2.1 Track only successfully sent local-surface key and pointer down state plus last accepted fresh pointer coordinates.
- [x] 2.2 Permit exactly one matching release-only cleanup after freshness loss while rejecting forged, duplicate, or action-capable stale input.
- [x] 2.3 Serialize generated-page input transitions and provide server-authoritative release-all cleanup for ambiguous responses, freshness loss, page exit, and disconnect.

## 3. Generated viewer page

- [x] 3.1 Load same-origin frame blobs with validated generation metadata and reset freshness only after a different generation decodes.
- [x] 3.2 Disarm pointer mode, clear modifiers, disable action controls, and perform bounded server-authoritative held-input cleanup when freshness is lost.
- [x] 3.3 Include the displayed generation on local input requests without exposing it in visible status or diagnostics.

## 4. Coverage and documentation

- [x] 4.1 Add focused server tests for stable, repeated, stale, malformed, unseen, linearly superseded, replacement, and recovery generation paths.
- [x] 4.2 Add focused page-contract and release-only tests, including ordered pointer/key transitions, ambiguous-response cleanup, stale cleanup, and secret-safe failures.
- [x] 4.3 Update README and security model documentation for generation-bound local viewer input and the native release-on-close follow-up boundary.
- [x] 4.4 Update MVP smoke input and lifecycle-denial probes to validate a served frame, send matching key release, and require explicit revoke evidence, with focused tests.

## 5. Verification and review

- [x] 5.1 Run the focused agent-shell local-surface tests and resolve failures.
- [x] 5.2 Run typecheck, full tests, build, and strict OpenSpec validation.
- [x] 5.3 Complete and record a security review covering frame freshness, input cleanup, TOCTOU, redaction, consent, revoke, and disconnect invariants.

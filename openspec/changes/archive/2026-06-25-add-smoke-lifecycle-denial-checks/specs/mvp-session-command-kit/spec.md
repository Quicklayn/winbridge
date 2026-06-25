## ADDED Requirements

### Requirement: MVP smoke check verifies lifecycle-denial input failure

The root MVP smoke check SHALL verify that the local static workflow fails
input closed after a bounded lifecycle loss of input authorization. After the
happy-path pointer and keyboard input checks have succeeded, the smoke check
SHALL use existing host lifecycle control behavior to remove active input
authorization through pause, revocation, termination, or an equivalent existing
explicit host-side control, then SHALL verify that the token-protected loopback
viewer surface no longer accepts a bounded input command. The smoke check MUST
stop all child processes after success, failure, timeout, or interrupt. Human
and JSON output MUST represent this verification using only fixed safe smoke
subcheck metadata and bounded reason codes.

#### Scenario: Lifecycle-denial smoke subcheck passes

- **WHEN** the smoke workflow has verified frame, surface, signal, accepted
  pointer input, accepted keyboard input, and audit readiness
- **THEN** it performs a bounded lifecycle-denial input check using existing
  explicit host-side lifecycle control behavior
- **AND** it verifies that a subsequent token-protected local viewer surface
  input command is rejected
- **AND** it reports the fixed lifecycle-denial subcheck as passed

#### Scenario: Lifecycle-denial smoke subcheck fails closed

- **WHEN** lifecycle control cannot be applied, authorization loss is not
  observed, the local viewer surface still accepts input after authorization
  loss, or the check times out
- **THEN** the smoke helper exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, audit paths, raw audit
  contents, mutation tokens, authorization ids, raw signal payloads, raw input
  commands, tokens, pairing codes, credentials, private reasons, raw child
  output, screen contents, input contents, clipboard contents, file-transfer
  contents, diagnostics dumps, or full secrets

#### Scenario: Lifecycle-denial smoke output stays bounded

- **WHEN** the smoke check succeeds or fails with `--json`
- **THEN** the emitted JSON contains only bounded `ok`, optional safe reason,
  fixed per-check status records including the lifecycle-denial subcheck, and
  artifact cleanup metadata
- **AND** it MUST NOT include relay URLs, ports, frame paths, surface URLs,
  audit paths, mutation tokens, authorization ids, raw input commands, raw
  child output, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

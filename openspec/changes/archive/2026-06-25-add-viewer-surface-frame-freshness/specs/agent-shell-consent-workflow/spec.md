## ADDED Requirements

### Requirement: Local viewer surface displays bounded frame freshness

The opt-in viewer local control surface SHALL display bounded local freshness
metadata for the currently displayed frame. The generated page SHALL update
freshness based only on local browser time since the last successful displayed
frame replacement and SHALL mark the frame stale after a bounded local
threshold. Freshness text MUST NOT expose frame paths, frame bytes, frame URLs,
file timestamps, local filesystem metadata, raw fetch errors, mutation tokens,
authorization ids, peer ids, display names, pairing codes, relay tokens,
credentials, screen contents, input contents, clipboard contents, protocol
payloads, diagnostics dumps, or full secrets. Freshness display MUST NOT grant
permissions, send input, reconnect peers, start capture, hide host visibility,
or bypass runtime authorization gates.

#### Scenario: Freshness updates after a frame loads

- **WHEN** the generated local viewer page successfully loads and displays a
  replacement frame
- **THEN** the frame status text includes bounded freshness metadata such as
  `frameAgeMs=<bucket>`
- **AND** the status remains metadata-only and does not include frame paths,
  URLs, byte contents, authorization ids, tokens, pairing codes, credentials,
  private reasons, screen contents, input contents, raw errors, or protocol
  payloads

#### Scenario: Freshness marks stale displayed frames

- **WHEN** the generated local viewer page has a previously displayed frame and
  no successful replacement has loaded within the bounded stale threshold
- **THEN** the frame status text marks the displayed frame as stale
- **AND** the stale marker MUST NOT send input, grant permissions, reconnect
  peers, start capture, hide host visibility, suppress host controls, or bypass
  consent

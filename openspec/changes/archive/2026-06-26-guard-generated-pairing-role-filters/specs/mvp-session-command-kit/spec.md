## ADDED Requirements

### Requirement: Generated pairing is full-plan only

The MVP command kit SHALL reject `--generate-pairing` when combined with any
`--only` target before generating a pairing code. Role-filtered command output
SHALL remain available with the default pairing value or with an explicit
operator-provided `--pairing` value. Full text and JSON session command plans
MAY continue using `--generate-pairing` to render one consistent pairing code
across the host and viewer commands in the same non-executing output.

#### Scenario: Role-filtered generated pairing is rejected

- **WHEN** a developer runs the command kit with `--generate-pairing` and
  `--only relay`, `--only host`, `--only viewer`, `--only browser`, or
  `--only preflight` in either flag order
- **THEN** the command kit rejects the input before rendering commands
- **AND** it does not generate, render, or log a pairing code
- **AND** the error output remains bounded and does not echo raw unsafe input,
  relay URLs, local paths, tokens, generated pairing codes, or command bodies

#### Scenario: Full generated pairing remains consistent

- **WHEN** a developer runs the full command kit with `--generate-pairing`
- **THEN** the host and viewer commands use the same generated pairing code in
  the single rendered output
- **AND** the helper remains non-executing and does not start relay, host,
  viewer, capture, input, or browser processes

#### Scenario: Role-filtered explicit pairing remains available

- **WHEN** a developer runs the command kit with `--only host --pairing
  234-567` or `--only viewer --pairing 234-567`
- **THEN** the selected bounded command block renders with that explicit
  pairing value
- **AND** the helper does not generate a separate pairing code

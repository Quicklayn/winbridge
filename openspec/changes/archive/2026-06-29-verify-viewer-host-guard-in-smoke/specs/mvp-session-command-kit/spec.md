## ADDED Requirements

### Requirement: MVP smoke check verifies viewer surface Host guard

The root MVP smoke check SHALL verify that the live loopback viewer local
control surface rejects a fixed mismatched `Host` header before treating the
surface as guard-ready. This Host guard probe MUST be part of the existing
`surface-guards` smoke subcheck and MUST fail closed with the bounded
`surface-guards-not-ready` reason when the mismatched Host request is accepted,
times out, returns malformed output, returns a server error, or returns any
unexpected shape. The probe and smoke output MUST NOT expose local URLs, ports,
origins, Host values, mutation tokens, frame bytes, authorization ids, command
bodies, child output, pairing codes, credentials, screen contents, input
contents, clipboard contents, or full secrets.

#### Scenario: Mismatched Host rejection is required for smoke readiness

- **WHEN** the root MVP smoke check reaches the local viewer surface guard step
- **THEN** it sends a fixed mismatched-Host request to the live local viewer
  surface
- **AND** the smoke check continues only when the surface returns bounded
  rejection metadata

#### Scenario: Host guard drift fails the surface guard subcheck

- **WHEN** the live local viewer surface accepts, errors, times out, or returns
  malformed output for the mismatched-Host probe
- **THEN** the smoke helper exits non-zero with the bounded
  `surface-guards-not-ready` reason
- **AND** JSON output marks only fixed smoke check names without exposing local
  URLs, ports, Host values, mutation tokens, frame bytes, commands, child
  output, credentials, input contents, or full secrets

## MODIFIED Requirements

### Requirement: MVP session command kit fails closed on malformed input

The MVP command kit MUST reject malformed, duplicate, ambiguous, unsafe, or
secret-bearing options before rendering relay, host, viewer, browser, token, or
preflight commands. It MUST reject raw relay token values and accept only a
bounded environment variable name for token references. It MUST reject relay
URLs that contain credentials, token query parameters, search parameters,
fragments, non-root paths, unspecified connect-target hosts, unsupported
schemes, or unsafe scalar characters. It MUST reject unsafe file paths, unsafe
identifiers, invalid ports, invalid capture cadence values, invalid signal
probe delay values, invalid `--generate-pairing` combinations, invalid
preflight-only combinations, unsafe host or viewer display names, unsafe
request reasons, and invalid JSON/preflight flags without echoing raw unsafe
input in diagnostics. The `--relay-host` shortcut MUST be rejected when it is
malformed, loopback, unspecified, secret-bearing, or combined with `--relay`.
The `--capture-duration-minutes` option MUST be rejected when malformed,
combined with `--capture-count`, or when its derived finite frame count exceeds
the supported command-kit frame-stream bound.

#### Scenario: Unsafe signal probe delay is rejected

- **WHEN** a developer supplies a blank, fractional, negative, oversized,
  non-numeric, or unsafe `--viewer-signal-probe-after-ms` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** the error output remains bounded and does not echo raw unsafe input

#### Scenario: Unsafe full relay URL connect target is rejected

- **WHEN** a developer supplies a full `--relay` URL with an unspecified host,
  non-root path, credentials, query, fragment, unsupported scheme, or unsafe
  scalar content
- **THEN** the command kit rejects the input before rendering relay, host,
  viewer, or browser commands
- **AND** diagnostics MUST NOT echo the raw relay URL, credentials, query
  values, path, pairing code, token references, local paths, command text,
  stdout, stderr, or child output

#### Scenario: Root localhost and LAN relay URLs remain valid

- **WHEN** a developer supplies a full root `ws://localhost:<port>/` or
  `ws://<lan-host>:<port>/` relay URL without credentials, query, fragment, or
  unsafe scalar content
- **THEN** the command kit renders the non-executing command plan
- **AND** non-loopback relay URLs still include the reviewed relay bind setting
  for the relay terminal only

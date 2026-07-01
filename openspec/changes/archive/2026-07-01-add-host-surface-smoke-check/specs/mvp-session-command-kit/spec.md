## ADDED Requirements

### Requirement: MVP smoke verifies host local surface readiness

The root MVP smoke check SHALL start the local smoke host with the existing
host-only local control surface enabled on ephemeral loopback port `0` and
verify a fixed `host-surface` subcheck before reporting success. The subcheck
MUST extract a single bounded `http://127.0.0.1:<port>/` host surface URL from
host output, fetch the host surface HTML and sanitized `/status` metadata, and
verify that status reports an active visible host session with a positive
permission count. The subcheck MUST reject missing, malformed, duplicate,
credential-bearing, query-bearing, fragment-bearing, path-bearing, non-loopback,
privileged-port, or non-HTTP host surface URLs. The smoke helper MUST NOT print
the host surface URL, mutation token, raw child output, generated command
strings, authorization ids, raw permission arrays, relay URLs, local paths,
tokens, pairing codes, credentials, screen contents, input contents,
clipboard contents, diagnostics dumps, or full secrets in success or failure
diagnostics.

#### Scenario: Host surface smoke subcheck passes

- **WHEN** the smoke host reaches active visible authorization and logs a
  bounded host local control surface URL
- **THEN** the smoke check fetches the host surface and sanitized status
- **AND** the smoke result includes the fixed `host-surface` subcheck as
  passed
- **AND** output remains bounded and does not expose the URL, mutation token,
  authorization id, permission list, child output, screen contents, input
  contents, credentials, or secrets

#### Scenario: Host surface URL drift fails closed

- **WHEN** host output omits the host surface URL, reports multiple different
  host surface URLs, or reports an unsafe host surface URL
- **THEN** the smoke check exits non-zero with the bounded
  `host-surface-not-ready` reason
- **AND** diagnostics include only fixed smoke subcheck metadata

### Requirement: MVP smoke verifies host local surface mutation guards

The root MVP smoke check SHALL verify fixed host local surface mutation guard
denials before reporting the `host-surface` subcheck as passed. The guard
verification MUST send only fixed negative probes for mismatched `Host`, missing
mutation token, foreign `Origin`, and unsafe content type. Each probe MUST be
rejected before host lifecycle controls are invoked or host authorization state
is read for mutation handling. The smoke check MUST NOT use the host surface to
approve sessions, grant permissions, pause, resume, revoke, terminate,
disconnect, capture the screen, apply input, reconnect peers, install services,
configure startup persistence, elevate privileges, run unattended, collect
credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the active
host session indicator.

#### Scenario: Host surface guard subcheck passes

- **WHEN** the smoke workflow has verified the host surface HTML and status
- **THEN** it sends fixed negative mutation probes to the host surface
- **AND** each probe is rejected with bounded metadata
- **AND** the smoke helper reports only the fixed `host-surface` subcheck
  metadata

#### Scenario: Host surface guard failure fails closed

- **WHEN** any fixed host surface guard probe is accepted, times out, or
  returns an unexpected unsafe result
- **THEN** the smoke helper exits non-zero with the bounded
  `host-surface-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics do not expose mutation tokens, URLs, response bodies,
  command contents, authorization ids, child output, pairing codes,
  credentials, screen contents, input contents, or full secrets

### Requirement: MVP ready accepts host surface smoke metadata

The root MVP ready helper SHALL accept bounded smoke JSON containing the fixed
`host-surface` subcheck for default, LAN-style, token, and LAN-token smoke
checks when those checks are explicitly included. It MUST fail closed when
smoke JSON omits `host-surface`, duplicates it, changes its shape, marks it
passed while another required subcheck is missing, or includes unexpected
subcheck names. Failure output MUST remain bounded and MUST NOT echo smoke
command output, child output, generated commands, host surface URLs, mutation
tokens, relay URLs, token values, token environment values, pairing codes,
credentials, local paths, frame bytes, input contents, diagnostics, or full
secrets.

#### Scenario: Ready preserves host surface subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded smoke
  JSON containing a passed `host-surface` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for all
  included smoke variants
- **AND** ready output remains bounded and secret-safe

#### Scenario: Ready rejects missing host surface subcheck

- **WHEN** an included smoke result omits, duplicates, malforms, or renames the
  fixed `host-surface` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

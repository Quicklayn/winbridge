## MODIFIED Requirements

### Requirement: MVP smoke check verifies viewer surface Host guard

The root MVP smoke check SHALL verify that the live loopback viewer local
control surface rejects a fixed mismatched `Host` header before treating the
surface as guard-ready. The probe MUST connect directly only to the literal
`127.0.0.1` address and non-privileged port from the already validated
uncredentialed `http://127.0.0.1:<port>/` surface URL, send the exact fixed
mismatched `Host` value on the wire to the fixed `/status` path, and MUST NOT
follow redirects or accept caller-selected endpoints, methods, paths, headers,
or bodies. It MUST bound request time and response bytes and release the
request on every outcome. Its time bound MUST be an absolute wall-clock bound
that slow response activity cannot extend, and smoke process cleanup MUST abort
an active probe before returning control.

This Host guard probe MUST be part of the existing `surface-guards` smoke
subcheck and MUST fail closed with the bounded `surface-guards-not-ready`
reason when the URL is unsafe, the exact mismatched Host cannot be sent, the
request is accepted, times out, aborts, redirects, returns malformed or
oversized output, returns a server error, or returns any unexpected shape. The
probe and smoke output MUST NOT expose local URLs, ports, origins, Host values,
mutation tokens, frame bytes, authorization ids, command bodies, response
bodies, child output, pairing codes, credentials, screen contents, input
contents, clipboard contents, or full secrets.

#### Scenario: Mismatched Host rejection is required for smoke readiness

- **WHEN** the root MVP smoke check reaches the local viewer surface guard step
- **THEN** it sends the fixed mismatched `Host` value over a direct bounded HTTP
  request to the validated live loopback viewer `/status` endpoint
- **AND** the smoke check continues only when the surface returns the exact
  bounded rejection metadata

#### Scenario: Host guard drift fails the surface guard subcheck

- **WHEN** the live local viewer surface accepts, errors, times out, redirects,
  returns an oversized body, or returns malformed output for the exact
  mismatched-Host wire probe
- **THEN** the smoke helper exits non-zero with the bounded
  `surface-guards-not-ready` reason
- **AND** JSON output marks only fixed smoke check names without exposing local
  URLs, ports, Host values, mutation tokens, frame bytes, commands, response
  bodies, child output, credentials, input contents, or full secrets

#### Scenario: Unsafe viewer probe URL opens no connection

- **WHEN** the direct Host guard probe receives a credential-bearing,
  non-loopback, privileged-port, path-bearing, query-bearing, fragment-bearing,
  non-HTTP, or malformed surface URL
- **THEN** it fails closed before opening a socket or emitting a request

#### Scenario: Viewer probe slow-drip and cleanup remain bounded

- **WHEN** the viewer Host guard response emits data without completing past
  the fixed deadline or smoke cleanup begins while the request is active
- **THEN** the request and response are aborted within the absolute bound and
  the guard subcheck fails without waiting for socket inactivity

### Requirement: MVP smoke verifies host local surface mutation guards

The root MVP smoke check SHALL verify fixed host local surface mutation guard
denials before reporting the `host-surface` subcheck as passed. The guard
verification MUST send only fixed negative probes for mismatched `Host`, missing
mutation token, foreign `Origin`, and unsafe content type. The mismatched-Host
probe MUST connect directly only to literal `127.0.0.1` and the non-privileged
port from the already validated uncredentialed
`http://127.0.0.1:<port>/` host surface URL, send the exact fixed mismatched
`Host` on the wire to fixed `/control`, use only the existing fixed pause body,
local origin and bounded mutation token, follow no redirects, bound request
time and response bytes, and release the request on every outcome. Each probe
MUST be rejected before host lifecycle controls are invoked or host
authorization state is read for mutation handling.

After host surface readiness, the mismatched-Host mutation probe MUST run first
and exactly once. If it is accepted, times out, aborts, or returns any unsafe
result, the smoke helper MUST fail that subcheck immediately without polling,
retrying the pause request, or running later negative mutation probes. Its time
bound MUST be an absolute wall-clock bound that slow response activity cannot
extend, and smoke process cleanup MUST abort an active probe before returning
control.

The smoke check MUST NOT use the host surface to approve sessions, grant
permissions, pause, resume, revoke, terminate, disconnect, capture the screen,
apply input, reconnect peers, install services, configure startup persistence,
elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR,
bypass Windows prompts, or hide the active host session indicator.

#### Scenario: Host surface guard subcheck passes

- **WHEN** the smoke workflow has verified the host surface HTML and status
- **THEN** it sends the fixed negative mutation probes to the host surface,
  including the exact mismatched-Host value through direct bounded loopback
  HTTP
- **AND** each probe is rejected with exact bounded metadata
- **AND** the smoke helper reports only the fixed `host-surface` subcheck
  metadata

#### Scenario: Host surface guard failure fails closed

- **WHEN** any fixed host surface guard probe is accepted, times out, aborts,
  redirects, exceeds the response bound, or returns an unexpected unsafe result
- **THEN** the smoke helper exits non-zero with the bounded
  `host-surface-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics do not expose mutation tokens, URLs, Host values,
  response bodies, command contents, authorization ids, child output, pairing
  codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Accepted mismatched Host probe is never retried as guarded

- **WHEN** the live host surface accepts the fixed direct mismatched-Host pause
  request instead of returning exact rejection metadata
- **THEN** the guard check fails immediately for that attempt and MUST NOT
  classify the accepted mutation response as guarded
- **AND** it sends no second mismatched-Host pause request under that surface
  readiness result

#### Scenario: Unsafe host probe URL opens no connection

- **WHEN** the direct host mutation guard probe receives a credential-bearing,
  non-loopback, privileged-port, path-bearing, query-bearing, fragment-bearing,
  non-HTTP, or malformed surface URL
- **THEN** it fails closed before opening a socket or sending the mutation
  token or pause body

#### Scenario: Host probe slow-drip and cleanup remain bounded

- **WHEN** the host Host guard response emits data without completing past the
  fixed deadline or smoke cleanup begins while the request is active
- **THEN** the request and response are aborted within the absolute bound and
  no second pause request is sent

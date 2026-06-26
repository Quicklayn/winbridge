## MODIFIED Requirements

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor, root MVP native preflight, root MVP localhost command-plan
validation, root MVP representative LAN command-plan validation, root MVP
shared-token command-plan validation, and fixed role-filter command validation
for `mvp:commands -- --only relay`, `host`, `viewer`, `browser`, and
`preflight` sequentially, stop after the first failed check, and report only
bounded check status metadata. The helper SHALL support explicit role-scoped
readiness with `--role relay`, `--role host`, and `--role viewer` without
changing the default aggregate plan. Role-scoped relay readiness SHALL run only
the root MVP doctor and relay role-filter command validation. Role-scoped host
readiness SHALL run the root MVP doctor, root MVP native preflight, and host
role-filter command validation. Role-scoped viewer readiness SHALL run the root
MVP doctor, root MVP native preflight, viewer role-filter command validation,
and browser role-filter command validation. Role mode MAY be combined with
`--json` and MUST reject `--include-smoke`.

The localhost command-plan validation SHALL run the existing non-executing MVP
command kit in bounded JSON mode, verify that it emits an `ok=true`
non-executing session command plan with the fixed command names
`preflight.ready`, `preflight.doctor`, `preflight.native`, `preflight.smoke`,
`relay`, `host`, `viewer`, and `browser`, and MUST NOT surface raw command
strings, local paths, relay URLs, pairing codes, relay tokens, token environment
values, stdout, stderr, or child output in readiness output. The LAN
command-plan validation SHALL run the same non-executing command kit with a
representative safe LAN relay host, verify the expected relay URL only as
internal readiness metadata, and verify that the relay command binds with the
reviewed `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` setting for the LAN trial
path. The shared-token command-plan validation SHALL run the same non-executing
command kit with a fixed relay token environment variable name and verify the
expected token environment reference only as internal readiness metadata. The
role-filter command validations SHALL run the same non-executing command kit in
text mode with exactly one fixed `--only` target per check, verify bounded
target-specific output for the selected relay, host, viewer, browser, or
preflight block, reject malformed or cross-target command text, and MUST NOT
echo the filtered command block, pairing, relay URL, local URLs, paths, tokens,
token environment values, stdout, stderr, or child output in readiness output.
With `--include-smoke`, the default helper SHALL also run the root MVP smoke
check and root MVP LAN smoke check in bounded JSON mode after the default checks
pass. Without `--include-smoke`, the default helper SHALL mark smoke and LAN
smoke as explicitly skipped metadata only. The helper MUST stop on the first
failed check and MUST NOT start relay, host, viewer, browser, capture, input,
services, startup persistence, unattended access, privilege elevation, remote
discovery, network probing, firewall changes, clipboard access, file transfer,
diagnostics dumps, AV/EDR evasion, Windows prompt bypass, hidden sessions, or
production deployment behavior.

#### Scenario: Ready rejects LAN command plan with unsafe relay bind

- **WHEN** the representative LAN command-plan JSON routes host and viewer to
  the expected LAN relay URL but omits the `0.0.0.0` relay bind or uses a
  different bind value
- **THEN** `mvp:ready` fails closed at the fixed `lan-command-plan` check
- **AND** output includes only fixed check metadata and a safe reason code
- **AND** output MUST NOT echo relay commands, relay URLs, ports, token
  references, stdout, stderr, child output, package JSON content, paths,
  pairing codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Role-scoped ready runs only selected local checks

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`, `--role host`,
  or `--role viewer`
- **THEN** the helper runs only the fixed readiness checks for that role
- **AND** host and viewer roles include native preflight while relay role does
  not
- **AND** output includes only bounded check status metadata
- **AND** output MUST NOT echo generated command strings, relay URLs, local
  URLs, local paths, pairing codes, tokens, stdout, stderr, child output,
  credentials, screen contents, input contents, or full secrets

#### Scenario: Role-scoped ready rejects smoke

- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-smoke`
- **THEN** the helper rejects the invocation before running checks
- **AND** diagnostics remain bounded and do not echo raw unsafe input

## MODIFIED Requirements

### Requirement: MVP ready validates trial helper plan output

The root MVP ready helper SHALL validate the two-PC trial helper plan output as
part of default aggregate readiness and role-scoped readiness. Default
readiness MUST run the non-executing `mvp:trial -- --json` plan and accept it
only when the bounded JSON reports `ok=true`, `mode=plan`,
`nonExecuting=true`, fixed relay, host, viewer, browser, and evidence role
records, reviewed relay/host/viewer `mvp:run` command-reference templates with
placeholder session and pairing values, `--token-env
WINBRIDGE_RELAY_SHARED_TOKEN`, `--i-understand-foreground`, reviewed
host/viewer LAN probe command-reference steps, reviewed browser
command-reference steps, and the reviewed safety reminders. Relay, host, and
viewer role-scoped readiness MUST run the matching non-executing
`mvp:trial -- --role <role> --json` plan and accept it only when exactly that
role record is present. Viewer role-scoped readiness MUST also run the
non-executing `mvp:trial -- --role browser --json` plan and accept it only
when the reviewed browser record is present, because the browser surface is
opened on the viewer PC. Readiness MUST fail closed on missing, duplicated,
malformed, renamed, extra, evidence-mode, cross-role, raw-token, raw-relay-URL,
concrete-pairing, or missing-foreground-ack trial metadata. Failure output
MUST remain bounded and MUST NOT echo generated commands, relay URLs, local
URLs, token values, token environment values, pairing codes, local paths,
audit paths, audit records, frame bytes, screen contents, input contents,
stdout, stderr, child output, credentials, diagnostics, or full secrets. The
validation MUST remain non-executing and MUST NOT start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, LAN discovery, firewall
changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready validates full trial plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates bounded `mvp:trial -- --json` output
- **AND** it accepts only the fixed relay, host, viewer, browser, and evidence
  workflow records with reviewed role-runner templates, reviewed LAN probe
  references, reviewed browser command-reference, and reviewed safety reminders
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Role ready validates matching trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates bounded
  `mvp:trial -- --role host --json` output
- **AND** it accepts the host record only when the reviewed host role-runner
  template and host LAN probe reference are present
- **AND** it fails closed if relay, viewer, browser, evidence, or malformed
  role metadata is present

#### Scenario: Viewer ready validates browser trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates bounded
  `mvp:trial -- --role viewer --json` output
- **AND** it validates bounded `mvp:trial -- --role browser --json` output
- **AND** the browser trial plan is accepted only when the reviewed browser
  command-reference and viewer readiness reminder are present

#### Scenario: Trial readiness drift fails closed

- **WHEN** trial helper JSON omits required safety reminders, changes mode,
  reports evidence mode, includes duplicate roles, omits the requested role,
  omits a required role-runner template, omits the browser section from the
  full plan, replaces `--token-env` with raw `--token`, prints a raw relay URL,
  prints a concrete pairing code, or omits `--i-understand-foreground`
- **THEN** `mvp:ready` treats the matching trial-plan check as failed
- **AND** diagnostics do not echo command strings, URLs, paths, audit records,
  stdout, stderr, child output, credentials, frame bytes, input contents, or
  secrets

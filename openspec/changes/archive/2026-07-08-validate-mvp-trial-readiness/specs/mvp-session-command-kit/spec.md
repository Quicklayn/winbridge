## ADDED Requirements

### Requirement: MVP ready validates trial helper plan output

The root MVP ready helper SHALL validate the two-PC trial helper plan output as
part of default aggregate readiness and role-scoped readiness. Default
readiness MUST run the non-executing `mvp:trial -- --json` plan and accept it
only when the bounded JSON reports `ok=true`, `mode=plan`,
`nonExecuting=true`, fixed relay, host, viewer, and evidence role records, and
the reviewed safety reminders. Relay, host, and viewer role-scoped readiness
MUST run the matching non-executing
`mvp:trial -- --role <role> --json` plan and accept it only when exactly that
role record is present. Readiness MUST fail closed on missing, duplicated,
malformed, renamed, extra, evidence-mode, or cross-role trial metadata. Failure
output MUST remain bounded and MUST NOT echo generated commands, relay URLs,
local URLs, token values, token environment values, pairing codes, local paths,
audit paths, audit records, frame bytes, screen contents, input contents,
stdout, stderr, child output, credentials, diagnostics, or full secrets. The
validation MUST remain non-executing and MUST NOT start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, LAN discovery, firewall
changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready validates full trial plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates bounded `mvp:trial -- --json` output
- **AND** it accepts only the fixed relay, host, viewer, and evidence workflow
  records with reviewed safety reminders
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Role ready validates matching trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates bounded
  `mvp:trial -- --role host --json` output
- **AND** it fails closed if relay, viewer, evidence, or malformed role
  metadata is present

#### Scenario: Trial readiness drift fails closed

- **WHEN** trial helper JSON omits required safety reminders, changes mode,
  reports evidence mode, includes duplicate roles, or omits the requested role
- **THEN** `mvp:ready` treats the matching trial-plan check as failed
- **AND** diagnostics do not echo command strings, URLs, paths, audit records,
  stdout, stderr, child output, credentials, frame bytes, input contents, or
  secrets

### Requirement: MVP doctor validates trial helper script alignment

`npm run mvp:doctor` SHALL require the root `mvp:trial` script to preserve the
reviewed `node scripts/mvp-trial.mjs` entrypoint. If the root script is
missing, renamed, reordered into an unsafe wrapper, or points to another
entrypoint, doctor MUST fail closed with bounded `script-misaligned` or
`missing-root-script` metadata. Diagnostics MUST NOT echo raw script bodies,
package JSON content, local paths, tokens, pairing codes, credentials, stdout,
stderr, child output, frame bytes, screen contents, input contents, or full
secrets. The alignment check MUST NOT execute the trial helper, relay, host,
viewer, browser, capture, input, services, startup persistence, unattended
access, privilege elevation, sockets, HTTP listeners, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior.

#### Scenario: Doctor accepts reviewed trial script

- **WHEN** the root package script maps `mvp:trial` to
  `node scripts/mvp-trial.mjs`
- **THEN** `npm run mvp:doctor` accepts the scripts check
- **AND** doctor output remains bounded metadata only

#### Scenario: Doctor rejects trial script drift

- **WHEN** the root `mvp:trial` script is missing or no longer points to the
  reviewed helper entrypoint
- **THEN** doctor exits non-zero with bounded script failure metadata
- **AND** diagnostics do not echo raw script bodies, package JSON content,
  paths, stdout, stderr, child output, credentials, or secrets

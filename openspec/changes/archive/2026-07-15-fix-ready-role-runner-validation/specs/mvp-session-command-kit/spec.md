## MODIFIED Requirements

### Requirement: MVP role runner supports non-executing dry-run metadata

The MVP role runner SHALL support `--dry-run` and `--json` modes that validate
the requested role and metadata but MUST NOT start child processes. Dry-run
output MUST include only bounded fixed metadata such as `ok`, `role`,
`foreground`, `nonExecuting`, `command`, and sanitized `args` suitable for
readiness drift checks. Dry-run and JSON output MUST NOT include raw token
values, token environment values, pairing codes, raw relay URLs, local URLs,
local paths, child output, frame bytes, screen contents, input contents,
clipboard contents, credentials, diagnostics dumps, or full secrets. When
aggregate readiness invokes the root `mvp:run` package script for relay, host,
or viewer dry-run validation, it MUST suppress npm lifecycle banners before
capturing stdout so only the bounded dry-run JSON contract is presented to the
strict parser. Readiness MUST accept only the complete ordered reviewed `args`
and `env` arrays for the requested runner role and MUST reject missing,
reordered, duplicated, or extra argument and environment metadata. Readiness
MUST NOT strip, ignore, or relax whole-output leak checks to accept
banner-contaminated or appended metadata.

#### Scenario: Dry-run reports reviewed role metadata

- **WHEN** a developer runs `npm run mvp:run -- --role host --dry-run --json`
  with valid explicit metadata
- **THEN** the helper emits bounded reviewed host runner metadata
- **AND** it does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, or child processes

#### Scenario: Ready validates runner dry-run drift

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** readiness invokes the root `mvp:run` package script without npm
  lifecycle banners and validates bounded dry-run metadata for relay, host, and
  viewer runner roles
- **AND** it fails closed if the metadata omits or changes reviewed role,
  consent, capture, input, audit, frame-output, or surface markers
- **AND** it fails closed if captured output includes session, pairing, relay,
  token, path, URL, child-output, credential, or secret-bearing banner text
- **AND** it fails closed if `args` or `env` contains missing, reordered,
  duplicated, extra, or secret-bearing metadata

#### Scenario: Silent runner validation remains non-executing

- **WHEN** aggregate readiness performs relay, host, and viewer runner checks
- **THEN** every runner check uses dry-run JSON mode through the reviewed root
  package script
- **AND** it MUST NOT start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access,
  privilege elevation, firewall changes, or hidden-session behavior

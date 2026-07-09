## ADDED Requirements

### Requirement: MVP role runner starts one reviewed foreground role

The project SHALL provide a root `npm run mvp:run` helper that starts exactly
one reviewed development MVP role in the current foreground terminal when
invoked with `--role relay`, `--role host`, or `--role viewer`. Live runner
invocations MUST require explicit `--session`, `--pairing`, one relay target
as `--relay` or `--relay-host`, and the acknowledgement flag
`--i-understand-foreground`. The runner MUST accept relay shared tokens only
through `--token-env <ENV_NAME>` and MUST NOT accept raw token values. Host and
viewer runs MUST preserve the reviewed visible consent, host control, audit,
finite Windows capture, viewer frame-output, viewer surface, and input request
options from the MVP command kit.

The runner MUST launch children using fixed npm entrypoints and validated argv
arrays, not by executing arbitrary rendered shell strings. It MUST run the
child in the foreground with inherited stdio and return the child exit code.
It MUST NOT start more than one role, launch browsers, create hidden windows,
detach processes, install services, configure startup persistence, run
unattended, elevate privileges, perform firewall changes, perform LAN
discovery, collect credentials, read clipboard data, transfer files, collect
diagnostics dumps, evade AV/EDR, bypass Windows prompts, or hide host session
visibility.

Failure output MUST remain bounded and MUST NOT echo raw relay URLs, token
values, token environment values, pairing codes, generated command strings,
child stdout, child stderr, local URLs, local paths, frame bytes, screen
contents, input contents, clipboard contents, credentials, diagnostics dumps,
or full secrets.

#### Scenario: Relay role runs in the foreground

- **WHEN** a developer runs `npm run mvp:run -- --role relay` with valid
  explicit session, pairing, relay target, token-env, and foreground
  acknowledgement
- **THEN** the helper starts the reviewed relay entrypoint in the current
  foreground terminal
- **AND** it passes reviewed relay bind, port, and token environment metadata
  without printing the token value

#### Scenario: Host role preserves consent and control flags

- **WHEN** a developer runs `npm run mvp:run -- --role host` with valid
  explicit session, pairing, relay target, token-env, and foreground
  acknowledgement
- **THEN** the helper starts the reviewed host agent entrypoint in the current
  foreground terminal
- **AND** the host argv includes interactive host consent, visible session,
  host control prompt, host local surface, audit log, host input opt-in, finite
  Windows capture, and host signal acknowledgement options

#### Scenario: Viewer role preserves frame and input flags

- **WHEN** a developer runs `npm run mvp:run -- --role viewer` with valid
  explicit session, pairing, relay target, token-env, and foreground
  acknowledgement
- **THEN** the helper starts the reviewed viewer agent entrypoint in the current
  foreground terminal
- **AND** the viewer argv includes the reviewed screen/input permission
  request, request reason, audit log, viewer frame output, viewer surface, and
  viewer signal probe options

#### Scenario: Unsafe live runner input fails closed

- **WHEN** a developer omits required explicit metadata, supplies duplicate or
  malformed flags, supplies a raw token, combines `--relay` with
  `--relay-host`, requests an unsupported role, or omits
  `--i-understand-foreground` for a live run
- **THEN** the runner exits before starting a child process
- **AND** diagnostics remain bounded and secret-safe

### Requirement: MVP role runner supports non-executing dry-run metadata

The MVP role runner SHALL support `--dry-run` and `--json` modes that validate
the requested role and metadata but MUST NOT start child processes. Dry-run
output MUST include only bounded fixed metadata such as `ok`, `role`,
`foreground`, `nonExecuting`, `command`, and sanitized `args` suitable for
readiness drift checks. Dry-run and JSON output MUST NOT include raw token
values, token environment values, pairing codes, raw relay URLs, local URLs,
local paths, child output, frame bytes, screen contents, input contents,
clipboard contents, credentials, diagnostics dumps, or full secrets.

#### Scenario: Dry-run reports reviewed role metadata

- **WHEN** a developer runs `npm run mvp:run -- --role host --dry-run --json`
  with valid explicit metadata
- **THEN** the helper emits bounded reviewed host runner metadata
- **AND** it does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, or child processes

#### Scenario: Ready validates runner dry-run drift

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** readiness validates bounded dry-run metadata for relay, host, and
  viewer runner roles
- **AND** it fails closed if the metadata omits or changes reviewed role,
  consent, capture, input, audit, frame-output, or surface markers

### Requirement: MVP doctor validates role runner script alignment

`npm run mvp:doctor` SHALL require the root `mvp:run` script to preserve the
reviewed `node scripts/mvp-role-runner.mjs` entrypoint. If the root script is
missing, renamed, reordered into an unsafe wrapper, or points to another
entrypoint, doctor MUST fail closed with bounded `script-misaligned` or
`missing-root-script` metadata. Diagnostics MUST NOT echo raw script bodies,
package JSON content, local paths, tokens, pairing codes, credentials, stdout,
stderr, child output, frame bytes, screen contents, input contents, or full
secrets.

#### Scenario: Doctor accepts reviewed role runner script

- **WHEN** the root package script maps `mvp:run` to
  `node scripts/mvp-role-runner.mjs`
- **THEN** `npm run mvp:doctor` accepts the scripts check
- **AND** doctor output remains bounded metadata only

#### Scenario: Doctor rejects role runner drift

- **WHEN** the root `mvp:run` script is missing or no longer points to the
  reviewed helper entrypoint
- **THEN** doctor exits non-zero with bounded script failure metadata
- **AND** diagnostics do not echo raw script bodies, package JSON content,
  paths, stdout, stderr, child output, credentials, or secrets

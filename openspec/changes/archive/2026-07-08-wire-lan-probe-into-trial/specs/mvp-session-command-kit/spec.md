## MODIFIED Requirements

### Requirement: MVP LAN probe verifies relay pairing readiness

The project SHALL provide a root `npm run mvp:lan-probe` helper that performs
a bounded live relay/session reachability probe for a two-PC MVP trial before
authorization, capture, input, browser, or audit evidence workflows are
started. The helper MUST require an explicit `--role host|viewer`, session id,
pairing code, peer id, device id, and bounded timeout. It MUST accept exactly
one relay target as either a full relay URL through `--relay` or a bounded
two-PC LAN host shortcut through `--relay-host <host>`. The `--relay-host`
shortcut MUST reject malformed, loopback, unspecified, or secret-bearing hosts
and MUST derive the default relay URL internally without printing it. The helper
MUST connect one operator-run peer to the relay, send only a schema-valid
`join-session` envelope for that role, wait until the relay reports paired room
readiness for the local peer, close its own socket, and exit. It MUST support a
shared relay token only through `--token-env <ENV_NAME>` and MUST read only that
environment variable value without printing it. The helper MUST support bounded
text output and bounded JSON output with fixed check names and reason codes.

#### Scenario: Relay host shortcut is accepted for LAN probes

- **WHEN** a developer runs a host or viewer LAN probe with
  `--relay-host 192.168.1.10`
- **THEN** the helper validates the host shortcut and uses the reviewed default
  relay port internally
- **AND** success and failure output do not include the derived relay URL,
  pairing code, token value, token environment value, protocol payloads, or
  secrets

#### Scenario: Unsafe relay host shortcut fails closed

- **WHEN** a developer supplies a duplicate, malformed, loopback, unspecified,
  secret-bearing, or `--relay`-combined relay-host shortcut
- **THEN** the helper exits non-zero before connecting to the relay
- **AND** diagnostics remain bounded and do not echo the unsafe host value,
  relay URL, pairing code, token value, stdout, stderr, child output, or secrets

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed relay, host, viewer, and post-run evidence sections that
reference the existing role-scoped `mvp:ready` gates, the existing
role-filtered `mvp:commands` outputs, reviewed host/viewer `mvp:lan-probe`
command-reference steps, and the strict
`mvp:audit-summary -- --require-mvp-evidence` post-run gate. Host and viewer
probe references MUST use placeholders for session and pairing metadata and
MUST use the bounded relay-host shortcut rather than printing generated relay
URLs. The helper MUST support text output by default and bounded JSON output
with `--json`. It MUST support `--role relay`, `--role host`, `--role viewer`,
and `--role evidence` filters without changing the default full workflow. Plan
output MUST remain bounded and MUST NOT echo raw relay URLs, pairing codes,
token values, token environment values, generated command strings, local URLs,
local paths, stdout, stderr, audit records, frame bytes, screen contents, input
contents, clipboard contents, credentials, diagnostics dumps, or full secrets.
The helper MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Trial plan includes host and viewer probe references

- **WHEN** a developer runs `npm run mvp:trial -- --relay-host 192.168.1.10`
- **THEN** the host and viewer workflow sections include bounded
  `mvp:lan-probe` command-reference steps using `--relay-host 192.168.1.10`
- **AND** those references retain placeholders for session and pairing metadata
- **AND** the output does not include generated relay URLs, concrete pairing
  codes, token values, stdout, stderr, child output, screen contents, input
  contents, or secrets

### Requirement: MVP doctor validates trial helper script alignment

`npm run mvp:doctor` SHALL require the root `mvp:trial` and `mvp:lan-probe`
scripts to preserve the reviewed `node scripts/mvp-trial.mjs` and
`node scripts/mvp-lan-probe.mjs` entrypoints. If either root script is missing,
renamed, reordered into an unsafe wrapper, or points to another entrypoint,
doctor MUST fail closed with bounded `script-misaligned` or
`missing-root-script` metadata. Diagnostics MUST NOT echo raw script bodies,
package JSON content, local paths, tokens, pairing codes, credentials, stdout,
stderr, child output, frame bytes, screen contents, input contents, or full
secrets. The alignment check MUST NOT execute the trial helper, LAN probe,
relay, host, viewer, browser, capture, input, services, startup persistence,
unattended access, privilege elevation, sockets, HTTP listeners, AV/EDR
evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Doctor accepts reviewed LAN probe script

- **WHEN** the root package script maps `mvp:lan-probe` to
  `node scripts/mvp-lan-probe.mjs`
- **THEN** `npm run mvp:doctor` accepts the scripts check
- **AND** doctor output remains bounded metadata only

#### Scenario: Doctor rejects LAN probe script drift

- **WHEN** the root `mvp:lan-probe` script is missing or no longer points to
  the reviewed helper entrypoint
- **THEN** doctor exits non-zero with bounded script failure metadata
- **AND** diagnostics do not echo raw script bodies, package JSON content,
  paths, stdout, stderr, child output, credentials, or secrets

## Context

WinBridge now has development pieces for a consent-bound MVP session: a relay,
an agent shell host that can keep the session visible, reviewed Windows capture
and input adapters, viewer frame persistence, and a loopback viewer control
surface. Running those pieces still requires manually assembling long commands,
which makes MVP verification fragile.

The command kit is a root-level development helper. It prints a reviewed,
ready-to-run sequence for relay, host, viewer, and browser terminals. It does
not execute those commands, supervise processes, persist startup state, or add
new remote capabilities.

## Goals / Non-Goals

**Goals:**

- Produce a repeatable local MVP session workflow from validated CLI options.
- Keep defaults visible and consent-bound: host approval is explicit, host
  visibility is enabled, host controls stay in the terminal, input application
  is opt-in, audit logs are configured, capture is finite, and the viewer
  surface is loopback-only.
- Fail closed before printing commands when input values are malformed or
  shaped like secrets in unsafe places.
- Keep diagnostics bounded and avoid echoing raw rejected values.

**Non-Goals:**

- No command execution, process supervisor, background service, installer,
  startup persistence, unattended access, or production identity system.
- No clipboard, file transfer, diagnostics collection, remote shell, privilege
  elevation, AV/EDR evasion, Windows prompt bypass, or hidden capture/input.
- No raw relay token argument. Tokenized runs must use an environment variable
  reference so generated diagnostics do not receive a token value.

## Decisions

1. Add `scripts/mvp-session-commands.mjs` instead of extending agent shell.

   Rationale: command generation is orchestration, not agent runtime behavior.
   Keeping it in `scripts/` avoids adding new relay, capture, or input paths.
   Alternative considered: a new agent-shell mode. That would broaden the CLI
   surface that can connect to the relay, so it is unnecessary for this helper.

2. Generate commands but never run them.

   Rationale: explicit terminals make consent, visibility, and stop controls
   obvious during the MVP. Auto-starting processes would create lifecycle and
   shutdown responsibilities that belong in a future reviewed UI or installer.
   Alternative considered: a process launcher. Deferred because it risks
   background handles and unclear host control boundaries.

3. Prefer safe defaults over maximum configurability.

   Rationale: the MVP path should exercise the already-reviewed feature set:
   `screen:view`, `input:pointer`, `input:keyboard`, host audit, viewer audit,
   finite Windows capture, latest-frame output, and loopback viewer surface.
   Options are limited to values needed for a local Windows-to-Windows test.

4. Use token environment variable references, not raw token arguments.

   Rationale: relay tokens are sensitive. The kit may print a command that
   references `$env:NAME`, but it must not accept or validate raw token values.
   Alternative considered: `--token <value>`. Rejected because usage errors,
   command history, or generated output would carry the secret.

## Risks / Trade-offs

- [Risk] Printed commands still include pairing codes and local paths. →
  Mitigation: pairing is expected in a command kit output, but error messages
  stay generic and the helper warns not to share generated commands.
- [Risk] Static host approval can be misunderstood as unattended access. →
  Mitigation: the host must explicitly run the visible host terminal command,
  the active-session indicator remains enabled, and host terminal controls can
  pause, revoke, terminate, or disconnect immediately.
- [Risk] A helper script can become a hidden launcher over time. → Mitigation:
  spec and tests assert no process spawning and no service/startup behavior.

## Migration Plan

Add the script and root npm command. Existing relay and agent shell commands
continue to work unchanged. Rollback is deleting the script and npm entry.

## Open Questions

- A future native UI should replace this development command kit for production
  MVP usage, after a separate OpenSpec security review.

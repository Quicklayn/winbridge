## Context

`mvp:commands` prints reviewed PowerShell command blocks for the relay, host,
viewer, and browser. `mvp:trial` now points operators at a generated full plan
for shared session and pairing metadata, but each machine still requires manual
copy/paste of long role commands. That is error-prone during the live two-PC
MVP path, especially for token-env, relay-host, capture, input, audit, and
surface flags.

This change introduces a small root runner for one foreground role process. It
does not replace the existing command kit or the explicit host consent prompt;
it only reduces operator transcription errors after the session and pairing
metadata have already been coordinated.

## Goals / Non-Goals

**Goals:**

- Add `npm run mvp:run -- --role relay|host|viewer` as a foreground-only
  helper for the current terminal.
- Reuse the same option validation and command construction semantics as
  `mvp:commands` where practical.
- Require explicit shared `--session`, `--pairing`, relay selection, and
  `--i-understand-foreground` before process launch.
- Provide `--dry-run` and `--json` modes that never start children, suitable
  for `mvp:ready` drift checks.
- Keep output bounded and secret-safe, especially around token env names,
  generated commands, child output, and local URLs.

**Non-Goals:**

- No process supervisor, daemon, reconnect manager, background launcher, or
  multi-role orchestration.
- No browser launch, hidden window, service install, startup persistence,
  privilege elevation, firewall changes, LAN discovery, or remote log retrieval.
- No production auth, account identity, production pairing lifecycle, or token
  generation.
- No change to host consent, visible session, capture, input, audit, relay, or
  authorization semantics inside the existing runtime.

## Decisions

1. Add a new `mvp:run` script instead of making `mvp:commands` executable.

   Rationale: `mvp:commands` is intentionally non-executing and heavily tested
   as a planning surface. A separate script keeps that contract intact while
   making executable behavior explicit.

2. Launch only one selected role per invocation.

   Rationale: a two-PC MVP needs relay, host, and viewer on different visible
   terminals/machines. A multi-role launcher would blur operator ownership,
   make shutdown harder, and move toward unattended orchestration.

3. Build argv arrays directly instead of executing rendered shell strings.

   Rationale: direct argv avoids shell injection and makes tests
   deterministic. The runner CLI accepts only token environment variable names
   and keeps token values out of dry-run, JSON, usage, and failure output. For
   live host/viewer child processes, the token value is resolved from the named
   environment variable and forwarded only to the existing reviewed runtime
   token option without printing or shell-rendering it. Relay bind/port/token
   env values are passed through the child environment rather than shell
   prefixes.

4. Require `--i-understand-foreground` for live runs.

   Rationale: process startup is the new side effect. The acknowledgement makes
   live foreground behavior explicit and prevents accidental launch while
   allowing `--dry-run`/`--json` planning without the acknowledgement.

5. Keep `browser` out of the runner.

   Rationale: browser launch is already a visible command reference from the
   command kit. Automatic browser launch is not necessary for the foreground
   role helper and would add UI/process behavior outside the current terminal.

## Risks / Trade-offs

- [Risk] The runner may be mistaken for production deployment tooling.
  -> Mitigation: name and docs keep it in the development MVP workflow, require
  visible foreground invocation, and reject service/background semantics.
- [Risk] A role process can run until interrupted.
  -> Mitigation: this is the same foreground lifecycle as the printed command;
  Ctrl+C remains visible and local, and host controls still provide pause,
  revoke, terminate, and disconnect.
- [Risk] Token handling could leak secrets through command text.
  -> Mitigation: live runs accept only `--token-env <NAME>`, read no raw token
  from CLI args, pass env through to children, and keep dry-run/json output to
  bounded argv/script metadata without token values.
- [Risk] Runner drift could bypass reviewed host/viewer flags.
  -> Mitigation: focused tests and readiness checks require the reviewed native
  capture/input, consent, audit, surface, and frame-output markers for host and
  viewer dry-run metadata.

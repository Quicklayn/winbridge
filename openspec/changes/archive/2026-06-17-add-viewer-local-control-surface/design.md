## Context

The development agent shell already supports consent-bound frame delivery to an
explicit viewer output file and explicit one-command input sends from the
terminal viewer prompt. The remaining MVP usability gap is that the viewer must
open the frame file separately and type normalized pointer coordinates by hand.

This change keeps the agent shell non-native and development-scoped while
adding a local browser surface that can display the latest persisted frame and
send explicit control commands through the same runtime gates.

## Goals / Non-Goals

**Goals:**

- Add an opt-in viewer-only loopback HTTP surface for development MVP usage.
- Bind only to `127.0.0.1` and require an explicit port.
- Require the existing explicit `--viewer-screen-frame-output` path so frame
  serving cannot choose arbitrary files.
- Reuse the viewer control command parser and route input through
  `runtime.sendInputEvent()`.
- Provide metadata-only JSON responses and CLI startup diagnostics.
- Stop the HTTP surface during normal CLI shutdown.

**Non-Goals:**

- No externally reachable HTTP server, authentication cookies, browser storage,
  public tunnel, production viewer app, clipboard, file transfer, diagnostics,
  remote shell, services, startup persistence, privilege elevation, unattended
  access, hidden sessions, keylogging, AV/EDR evasion, or Windows prompt
  bypass.

## Decisions

1. Use a loopback-only HTTP server in `apps/agent-shell`.

   The surface is a development MVP helper, so a Node built-in HTTP server keeps
   the dependency footprint small and avoids introducing a production web app
   architecture. Binding to `127.0.0.1` prevents LAN exposure even if the user
   has permissive firewall rules.

2. Serve only the configured latest-frame file.

   The viewer surface will not accept a path parameter. `GET /frame` reads the
   already validated `--viewer-screen-frame-output` path and returns either the
   current PNG/JPEG bytes or `404` when no authorized frame has been persisted
   yet. This avoids directory traversal, file browsing, and arbitrary file read
   behavior.

3. Reuse exact control commands and runtime authorization gates.

   Browser pointer events are converted to the same exact command strings used
   by the terminal prompt. Server-side parsing uses the existing viewer control
   parser and sends through `runtime.sendInputEvent()` only after the current
   viewer status is active, visible, and bound to an authorization id. The
   runtime remains authoritative for permission, peer routing, audit-before-send,
   socket state, pause, revoke, expiration, disconnect, and redaction.

4. Keep keyboard control explicit and page-local.

   The first surface will offer a command box and page-local key buttons rather
   than global keyboard hooks. It will not buffer typed text, record keystrokes,
   provide paste/text macros, or capture keys outside the visible browser page.

5. Keep diagnostics metadata-only.

   HTTP responses report bounded status values such as `accepted`, `rejected`,
   and input kind. They do not echo pointer coordinates, key names, frame bytes,
   raw request bodies, tokens, pairing codes, private reasons, or exception
   text.

## Risks / Trade-offs

- Local browser input can drive an opted-in host -> mitigated by active visible
  host consent, granted permissions, host opt-in for native input application,
  audit-before-send, audit-before-native-input, and host pause/revoke/disconnect.
- A loopback HTTP surface is not a production authenticated viewer -> mitigated
  by binding only to `127.0.0.1`, requiring explicit CLI opt-in, and keeping it
  development-scoped.
- Refreshing a latest-frame file is less efficient than a real video stream ->
  acceptable for MVP validation; production streaming can be specified later.
- Command-box keyboard input is less ergonomic than full desktop keyboard focus
  -> keeps the MVP out of keylogging/global-hook territory while still enabling
  controlled keyboard tests.

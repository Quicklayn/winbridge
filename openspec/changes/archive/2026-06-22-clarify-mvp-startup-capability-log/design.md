# Design: Clarify MVP Startup Capability Log

## Behavior

On WebSocket open, the runtime continues to print static bounded startup
diagnostics. The capability line should say that production desktop UI and
unattended access are not implemented, while the development MVP uses explicit
host consent, finite capture, viewer surface, and host input opt-in.

## Security Rationale

The message must remain static and secret-free. It must not include relay URLs,
tokens, pairing codes, local paths, protocol payloads, screen contents, or input
contents, and logger failures remain best-effort as already specified.

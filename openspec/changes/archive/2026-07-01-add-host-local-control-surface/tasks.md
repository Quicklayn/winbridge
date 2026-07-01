## 1. Host Surface Implementation

- [x] 1.1 Export shared host lifecycle command execution from the existing host control prompt.
- [x] 1.2 Add a host-only loopback local control surface with bounded HTML, status, mutation guards, command parsing, redacted responses, and terminate/disconnect listener shutdown.
- [x] 1.3 Add CLI parsing and startup/shutdown wiring for the host local control surface option.

## 2. Tests and Documentation

- [x] 2.1 Add unit tests for host local surface status, Host guard, mutation token/Origin/content-type guards, lifecycle command routing, malformed command rejection, and listener shutdown.
- [x] 2.2 Add CLI parser tests for host-only option acceptance, role rejection, unsafe ports, and status-output conflicts.
- [x] 2.3 Update README and MVP doctor coverage for the new host local control surface.

## 3. Verification and Closeout

- [x] 3.1 Run focused tests for agent-shell host local surface and argument parsing.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform security review for token handling, local binding, lifecycle controls, redaction, and prohibited capabilities.

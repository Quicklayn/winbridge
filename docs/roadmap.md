# Roadmap

## Phase 0: Bootstrap

- OpenSpec workflow.
- Safety boundary.
- Protocol schemas.
- Development relay.
- Non-native agent shell.
- GitHub CI and templates.

## Phase 1: Identity and Consent

- Account or local-device identity model.
- Pairing code lifecycle.
- Host consent UI.
- Session indicator.
- Permission grant and revoke model.
- Audit persistence.

## Phase 2: Media Transport

- WebRTC signaling.
- Screen frame transport design after consent, authorization, visibility, revoke, and audit gates are specified.
- Agent-shell development `screen-frame` CLI exerciser for one-shot metadata-redacted transport checks.
- Agent-shell finite frame stream loop for metadata-redacted cadence and authorization-loss checks.
- Agent-shell Windows capture source wired through metadata-only capture audit and existing consent-bound `screen-frame` gates.
- Agent-shell viewer output file for latest authorized inbound frame, gated by local audit and metadata-only diagnostics.
- Bandwidth and quality controls.
- Pause/resume.
- Timeout and reconnect behavior.

## Phase 3: Windows Native Host

- Windows input adapter package boundary after a dedicated OpenSpec design and
  security review.
- Agent-shell development host input application wired through metadata-only
  input audit and existing consent-bound `input-event` gates.
- Production native capture UX/media pipeline beyond the development agent-shell source.
- Production host input application UX and hardening beyond the development
  agent-shell opt-in path.
- Visible host status surface.
- Disconnect hotkey or tray control.
- Permission enforcement.
- Installer without hidden behavior, unauthorized persistence, or service startup surprises.

## Phase 4: Windows Viewer

- Viewer UI.
- Agent-shell loopback-only local viewer control surface for development MVP
  frame display and explicit input sends through existing consent-bound gates.
- Root MVP command kit for printing a validated visible relay/host/viewer
  launch sequence without starting background processes.
- Production viewer local status surface.
- Production remote pointer/keyboard UX after production host/viewer control
  surfaces, revocation, visibility, audit, and abuse-case handling are
  specified.
- Agent-shell interactive viewer control prompt for explicit one-event
  pointer/keyboard command sends through existing consent-bound input gates.
- Agent-shell development `input-event` CLI exerciser for one-shot metadata-redacted transport checks.
- Permission request UX.
- Session logs.

## Phase 5: Hardening

- Threat model update.
- E2E tests.
- Abuse-case tests.
- Security review.
- Signed builds.
- Production relay deployment.

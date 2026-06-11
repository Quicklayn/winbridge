# Security Model

## Product Boundary

WinBridge is for authorized remote assistance. It is not a covert administration tool.

Every sensitive action must satisfy:

1. Authenticated viewer.
2. Authorized session.
3. Explicit host approval.
4. Active visible host session.
5. Permission grant for that action.
6. Audit event.
7. Immediate host revocation path.

## Sensitive Actions

Sensitive actions include:

- Viewing the host screen.
- Moving pointer or sending keyboard input.
- Clipboard reads or writes.
- File transfer.
- Restart/reconnect behavior.
- Installer, service, startup, or privilege changes.
- Access to logs, tokens, diagnostics, or identity data.

## Abuse Prevention Rules

The implementation must reject:

- Hidden screen capture.
- Hidden input.
- Keylogging.
- Credential collection.
- Unapproved startup persistence.
- Evasion of security software.
- Bypassing UAC or Windows consent prompts.
- Silent install/uninstall flows that hide the product from the host user.

## Review Gates

### Design Gate

Before implementation, confirm:

- Threat model.
- Consent flow.
- Visible session indicator.
- Disconnect/revoke control.
- Audit events.
- Failure behavior.

### Implementation Gate

Every PR touching remote capability code must verify:

- Denied consent blocks the action.
- Revoked permission stops the action.
- Session timeout stops the action.
- Local disconnect terminates the action.
- Audit events are emitted.

### Release Gate

Before release, documentation must describe:

- What data is transmitted.
- Who can connect.
- How the host sees and stops a session.
- How to revoke access.
- How to uninstall.
- Where audit records live.

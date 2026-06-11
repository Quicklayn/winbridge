# Agent Orchestration

## Main Thread Ownership

The main Codex thread owns:

- Product safety boundary.
- Architecture integration.
- OpenSpec consistency.
- Final review and verification.
- Git/GitHub state.

Subagents are used for bounded, parallel work only.

## Subagent Roles

- `safety-architect`: consent, visibility, disconnect, revocation, audit, abuse resistance.
- `windows-client-engineer`: Windows UI, capture, input, and native helpers after specs exist.
- `networking-engineer`: relay, signaling, NAT traversal, reconnect, transport encryption.
- `auth-audit-engineer`: identity, MFA, device pairing, RBAC, tokens, logs, audit persistence.
- `qa-test-engineer`: unit/integration/E2E coverage for consent, revoke, timeout, auth failure, and reconnect.
- `security-reviewer`: diff review for capture, input, auth, relay, installer, startup, services, tokens, logs, privilege elevation.
- `docs-release-engineer`: user docs, privacy notices, release checklist, GitHub templates.

## When to Delegate

Delegate when:

- The task is concrete and bounded.
- The task can run in parallel.
- The write scope is disjoint.
- Acceptance criteria are clear.
- Safety invariants are understood.

Do not delegate:

- Overall architecture ownership.
- Product safety policy.
- Ambiguous high-risk work.
- Tasks requiring hidden access, stealth, credential access, or evasion.

## Handoff Template

```text
Task:
- Concrete goal:

Scope:
- Allowed files/areas:
- Out of scope:

Safety invariants:
- Explicit host consent before session access.
- Active session is visible to the host.
- Host can disconnect immediately.
- Authentication and authorization are required.
- Sensitive actions emit audit events.
- Prohibited: stealth, hidden persistence, credential theft, keylogging,
  AV/EDR evasion, hidden screen capture, hidden remote input.

Acceptance criteria:
- Behavior:
- Tests:
- Audit/log evidence:

Output expected:
- Inspected or changed paths:
- Assumptions:
- Verification:
- OpenSpec impact:

Stop conditions:
- Unclear consent or visibility.
- Hidden startup or evasion requirement.
- Capture/input/auth changes without review gate.
```

## Review Gates

- **Design gate:** threat model, consent flow, visible indicator, disconnect control, audit events.
- **Implementation gate:** remote capture/input require authenticated, authorized, active, visible session.
- **Security gate:** installer, service, startup, privilege, credentials, tokens, logs, relay/networking.
- **Abuse gate:** no stealth, hidden persistence, credential dumping, keylogging, AV evasion.
- **Test gate:** consent denied, revoke, auth failure, timeout, audit failure, reconnect, local disconnect.
- **Release gate:** docs cover consent, visibility, auth, audit, data handling, uninstall and revoke paths.

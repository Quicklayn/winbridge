## Context

The current bootstrap has a shared authorization state machine, protocol messages, and an agent shell that simulates host approval, visible activation, revocation, termination, expiration, and audit events. The protocol already has `session-control` actions for `pause` and `resume`, but the authorization status enum does not include a paused state and the agent shell cannot exercise the pause workflow.

This change stays in the TypeScript protocol and non-native development shell. It creates a testable lifecycle contract for future Windows host UI, capture, and input adapters without implementing those remote capabilities.

## Goals / Non-Goals

**Goals:**

- Add `paused` as a non-terminal authorization status.
- Deny sensitive action checks while an authorization is paused.
- Allow resume only from paused, visible, unexpired authorization state.
- Add host shell pause/resume simulation that only runs after explicit approval and visible active state.
- Emit secret-safe pause/resume audit events.
- Suppress scheduled pause/resume work after terminal states.

**Non-Goals:**

- No screen capture, remote input, clipboard, file transfer, diagnostics, installer, startup, service, persistence, privilege, or Windows prompt behavior.
- No production account authentication or durable production policy engine.
- No hidden, unattended, or background session semantics.

## Decisions

1. **Represent pause as authorization status `paused`.**
   - Rationale: Future capture/input gates can use one shared status check and fail closed when the state is not `active`.
   - Alternative considered: Send only `session-control` pause without a state update. That would make pause advisory and easier for future components to ignore accidentally.

2. **Keep paused permissions but deny actions by status.**
   - Rationale: Pause is temporary host control, not revocation. Preserving the grant enables resume without rebuilding a new consent request while `assertSessionActionAuthorized` continues to deny because status is not `active`.
   - Alternative considered: Clear permissions on pause. That duplicates revocation semantics and makes resume ambiguous.

3. **Resume only from paused, visible, unexpired state.**
   - Rationale: Resume must not reactivate denied, revoked, terminated, expired, invisible, or stale authorization.
   - Alternative considered: Allow resume from any non-terminal state. That risks reactivating a grant without a visible host-controlled pause lifecycle.

4. **Agent shell timers are development-only and visible-gated.**
   - Rationale: The shell remains a protocol exerciser. Timers let integration tests prove ordering and suppression without adding native UI or remote actions.
   - Alternative considered: Add interactive CLI prompts. That is less deterministic for automated verification.

## Risks / Trade-offs

- **Risk: Pause could be confused with revocation.** -> Mitigation: specs and code keep pause non-terminal, retain permissions, and require explicit resume before actions are authorized again.
- **Risk: Resume could override terminal states.** -> Mitigation: shell scheduling and authorization helpers reject resume after revoked, terminated, expired, denied, or pending states.
- **Risk: Audit details leak private reasons.** -> Mitigation: audit messages record configured booleans/counts/status only and tests assert private reason text is absent.
- **Risk: Native adapters later bypass this state.** -> Mitigation: protocol tests and authorization helper tests make `assertSessionActionAuthorized` the deny-by-default gate future adapters should call.

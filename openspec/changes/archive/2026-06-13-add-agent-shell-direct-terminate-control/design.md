## Context

Delayed session termination already uses the host workflow state created during visible authorization activation. Direct local termination needs to use the same state so immediate host stop controls cannot conflict with delayed revoke, pause, resume, termination, expiration, or disconnect work.

## Design

1. **Expose `terminate()` on the managed runtime API.**
   - Only host runtimes can call it.
   - The current authorization must be visible, unexpired, and `active` or `paused`.
   - The host workflow state must exist and must not already be terminal.

2. **Refactor delayed termination into a shared helper.**
   - Delayed and direct termination both call one helper that writes the audit record first, marks the workflow terminal, updates the local host authorization snapshot, emits inactive indicator metadata, and sends the existing protocol sequence.
   - Direct termination does not schedule any new timers.

3. **Preserve lifecycle coherence after direct termination.**
   - Direct termination sets terminal status `terminated`; later delayed pause, resume, revoke, terminate, expiration, and disconnect checks observe the terminal state and skip.
   - Termination may run from active or paused visible authorization, and it always clears permissions in the terminal state.

4. **Keep audit fail-closed.**
   - Direct termination catches audit/send failures, emits sanitized runtime diagnostics, and throws the generic runtime error.
   - Audit failure happens before workflow mutation or protocol messages.

## Alternatives

- **Use public `send()` for `session-control` termination.** Rejected because public workflow-authority sends are intentionally blocked to preserve consent and authority gates.
- **Best-effort audit for direct termination.** Rejected because termination sends lifecycle messages and can preserve the existing audit-first safety model. Local disconnect remains the exception because it closes the local channel immediately.

## Risks And Mitigations

- Direct control invoked from viewer runtime: reject by role before audit or socket writes.
- Direct control invoked before visibility: reject by authorization snapshot before audit or socket writes.
- Direct control invoked after expiration or terminal state: reject before audit or socket writes.
- Audit sink leaks private error text: report only sanitized runtime event/log text with message byte length.
- Direct termination conflicts with delayed timers: both paths share workflow state and terminal status.

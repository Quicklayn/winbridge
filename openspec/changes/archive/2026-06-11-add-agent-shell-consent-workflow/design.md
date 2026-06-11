## Context

The current agent shell is a thin CLI that connects to the relay, sends a join message, sends hello, and prints messages. It has no testable lifecycle and does not exercise session authorization protocol messages.

## Goals / Non-Goals

**Goals:**

- Expose `createAgentShellRuntime` for tests and CLI.
- Preserve current join/hello behavior.
- Let viewer shells request scoped permissions.
- Let host shells explicitly approve or deny requests for development testing.
- Emit active state only when the host shell is configured with visible session state.
- Test behavior over a real relay runtime.

**Non-Goals:**

- No native Windows UI.
- No screen capture or input injection.
- No automatic or unattended approval.
- No production identity or authorization service.
- No persistent session storage.

## Decisions

1. **Use explicit CLI options for host decision.**
   - Rationale: Development approval should be deliberate and visible in the command invocation.
   - Alternative considered: Auto-approve all requests in host mode. That would undermine the consent-first design.

2. **Make visible session state an explicit option.**
   - Rationale: Approval is not enough; active authorization requires visible host session state.
   - Alternative considered: Treat approval as visible. That hides a safety-critical gate.

3. **Keep all behavior in a runtime module.**
   - Rationale: Tests and CLI should share one implementation.
   - Alternative considered: Test only CLI subprocesses. That would be slower and harder to assert.

## Risks / Trade-offs

- **Risk: Development flags are mistaken for production UX.** -> Mitigation: Docs and CLI text label this as non-native protocol simulation only.
- **Risk: Approval flow becomes too permissive.** -> Mitigation: Default host decision is `none`; active state requires `visibleToHost`.
- **Risk: Runtime tests become timing-sensitive.** -> Mitigation: Use deterministic event collection and real relay on local ephemeral port.

## Migration Plan

1. Add agent shell runtime.
2. Replace CLI with runtime wrapper.
3. Add viewer request and host decision/state behavior.
4. Add integration tests.
5. Run verification, archive, commit, and push.

## Context

This is a greenfield repository for a Windows-to-Windows remote assistance product. The domain is dual-use, so the first implementation must encode product limits before adding native capture, remote input, file transfer, or unattended access.

The local workstation currently has Node.js and npm, but no Rust, Cargo, or .NET SDK. The bootstrap therefore uses a TypeScript monorepo that can be validated immediately:

- `packages/protocol`: shared message schemas and consent/session contracts.
- `apps/relay`: a WebSocket relay MVP for pairing and message forwarding.
- `apps/agent-shell`: a non-native CLI shell that exercises the protocol and relay without screen capture or input injection.

Native Windows capture and input adapters will be separate future OpenSpec changes after the Windows stack is chosen.

## Goals / Non-Goals

**Goals:**

- Establish OpenSpec as the source of truth for feature requirements.
- Define a consent-first security model before remote control primitives exist.
- Provide a buildable/testable TypeScript foundation.
- Provide GitHub-ready CI, templates, and project setup instructions.
- Define Codex/subagent orchestration for future parallel work.

**Non-Goals:**

- No hidden or unattended remote access in this bootstrap.
- No stealth installation, persistence, credential collection, AV evasion, or Windows prompt bypass.
- No native screen capture, input injection, clipboard sync, file transfer, or service installer yet.
- No production relay deployment or billing/account system yet.

## Decisions

1. **Use TypeScript/npm workspaces for the bootstrap.**
   - Rationale: The available local toolchain can build and test it now.
   - Alternative considered: Rust or .NET from day one. Both are strong Windows choices, but neither SDK is installed locally, so using them now would make the initial repo unverified.

2. **Keep protocol contracts in a separate package.**
   - Rationale: Host, viewer, relay, tests, and future native adapters need a shared source of truth for session messages.
   - Alternative considered: Inline schemas in the relay. That would be faster but would make drift likely as clients appear.

3. **Relay is a pairing/message relay, not a trust boundary for remote-control authorization.**
   - Rationale: The host must approve viewer permissions, and clients must enforce granted permissions locally.
   - Alternative considered: Relay-side permission enforcement only. That is useful as defense in depth, but insufficient because high-risk actions happen on endpoints.

4. **Represent safety as both documentation and code-level schema constraints.**
   - Rationale: Remote assistance can become unsafe if safety is only written in README text.
   - Alternative considered: Leave safety to later security review. That delays core product constraints until after risky primitives exist.

5. **Use OpenSpec change packages for all meaningful behavior changes.**
   - Rationale: The project will involve security, native APIs, networking, and UX; durable specs reduce context loss.
   - Alternative considered: Track only GitHub issues. Issues are useful for execution, but OpenSpec provides repo-local requirements and archive history.

## Risks / Trade-offs

- **Risk: TypeScript shell is not a real Windows remote desktop client.** -> Mitigation: Treat this as protocol/relay foundation only and keep native Windows work as explicit future specs.
- **Risk: Relay MVP can be mistaken for production security.** -> Mitigation: Document it as a development relay, add shared-token support, and require stronger auth in a future identity change.
- **Risk: Dual-use feature creep.** -> Mitigation: Require OpenSpec safety review and explicit host-visible consent for each remote capability.
- **Risk: Subagents create inconsistent edits.** -> Mitigation: Assign disjoint file ownership and require each handoff to list edited paths, assumptions, tests, and spec impact.

## Migration Plan

1. Add repository instructions, OpenSpec context, docs, TypeScript workspace, relay, protocol package, and CI.
2. Run npm install, typecheck, tests, and OpenSpec validation.
3. Commit locally.
4. Create a GitHub repository or attach an existing remote, then push the initial branch.
5. Use follow-up OpenSpec changes for native Windows host/viewer UI, identity/auth, WebRTC media, input adapter, packaging, and deployment.

## Open Questions

- Which native Windows stack should own capture/input: Rust/Tauri, .NET/WPF, or Electron plus native helper?
- Should relay transport evolve toward WebRTC signaling only, QUIC, or a managed TURN/STUN model?
- What identity model is required for the first private beta: local pairing codes, GitHub/OIDC login, or organization accounts?

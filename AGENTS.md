# Repository Instructions

## Project

This repository builds **WinBridge**, a consent-first Windows-to-Windows remote assistance product.

This project is dual-use. All work MUST keep the product in the legitimate remote assistance category:

- The host user explicitly approves each session.
- The host machine shows a visible active-session indicator.
- The host user can pause, revoke permissions, or disconnect immediately.
- Authentication, authorization, and audit events are required for sensitive actions.
- Hidden sessions, stealth installation, unauthorized persistence, credential theft, keylogging, AV/EDR evasion, and bypassing Windows security prompts are prohibited.

If a requested change conflicts with these rules, stop and report the policy issue instead of implementing it.

## OpenSpec Workflow

Before behavior-changing work:

1. Read `openspec/config.yaml`.
2. Check active changes with `npx --yes @fission-ai/openspec@latest list`.
3. Read relevant specs under `openspec/specs/` and active change artifacts under `openspec/changes/`.
4. For changes touching remote assistance behavior, security, networking, native Windows APIs, installer behavior, services, or user-visible workflows, create or update an OpenSpec change first.

During implementation:

- Follow the selected change's `proposal.md`, `design.md`, `specs/**/spec.md`, and `tasks.md`.
- Mark each task complete immediately after it is implemented and verified.
- If implementation changes requirements, update OpenSpec artifacts before continuing.

After completion:

- Run strict OpenSpec validation.
- Archive completed changes when their implementation and verification are done.

## Subagent Orchestration

Use subagents only for explicit, bounded work that can run in parallel without losing main-thread ownership.

Preferred roles:

- `safety-architect`: reviews consent, visibility, revocation, audit, and abuse resistance.
- `windows-client-engineer`: owns Windows UI, capture, input, and native helper work after explicit specs exist.
- `networking-engineer`: owns relay, signaling, NAT traversal, reconnect, and transport encryption.
- `auth-audit-engineer`: owns identity, session grants, MFA, RBAC, logs, and audit persistence.
- `qa-test-engineer`: owns unit, integration, and E2E tests for consent, revoke, timeout, and failure paths.
- `security-reviewer`: reviews diffs touching capture, input, auth, relay, installer, startup, services, tokens, logs, and privilege elevation.
- `docs-release-engineer`: owns user-facing docs, privacy notices, release checklists, and GitHub templates.

Delegation rules:

- Assign disjoint files/modules and clear acceptance criteria.
- Include safety invariants and stop conditions in every handoff.
- Require final output to list inspected paths or changed paths, assumptions, verification, and OpenSpec impact.
- Do not delegate the overall architecture or safety policy ownership away from the main thread.

Stop conditions for any subagent:

- Unclear host consent or session visibility.
- Hidden startup, hidden session, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- Capture/input/auth changes without a review gate.

## Engineering Conventions

- Language/runtime for the bootstrap: TypeScript on Node.js.
- Package manager: npm workspaces.
- Keep protocol contracts in `packages/protocol`.
- Keep relay code in `apps/relay`.
- Keep non-native CLI exerciser code in `apps/agent-shell`.
- Prefer focused tests for protocol validation and relay behavior.
- Use `rg` for repo search when available.
- Keep edits scoped; do not rewrite unrelated files.

## Verification

Run before handing off meaningful changes:

```powershell
npm run check
npm test
npm run build
npm run openspec:validate
```

For frontend or native UI work in the future, add interactive/browser or Windows-specific verification appropriate to the change.

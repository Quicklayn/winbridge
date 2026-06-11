## Why

The repository is empty, but the product goal is large and security-sensitive: a Windows-to-Windows remote assistance application. We need a spec-first foundation that makes consent, visibility, authentication, auditability, and non-stealth behavior non-negotiable before any native screen or input code is added.

## What Changes

- Add a consent-first project charter and repository workflow for a legitimate remote assistance product.
- Add OpenSpec capabilities covering safety boundaries, brokered sessions, and Codex/subagent orchestration.
- Add a TypeScript monorepo foundation with a protocol package, a WebSocket relay MVP, and a non-native agent shell.
- Add GitHub-ready project files: CI, issue templates, pull request template, security policy, roadmap, and GitHub setup notes.
- Exclude covert remote access features from scope: hidden sessions, stealth installation, persistence without user-managed startup, credential collection, AV evasion, and bypassing Windows security prompts.

## Capabilities

### New Capabilities
- `safety-boundaries`: Mandatory product and implementation constraints for authorized, visible remote assistance.
- `session-broker`: Session pairing, peer relay, consent handshakes, and auditable connection lifecycle.
- `agent-orchestration`: How Codex and subagents plan, split, review, and verify work in this repository.

### Modified Capabilities

None.

## Impact

- Adds OpenSpec planning artifacts under `openspec/`.
- Adds repo-level engineering instructions in `AGENTS.md`.
- Adds documentation under `docs/`.
- Adds TypeScript workspaces under `packages/` and `apps/`.
- Adds GitHub automation under `.github/`.
- Introduces npm dependencies for TypeScript, validation, tests, and WebSocket relay development.

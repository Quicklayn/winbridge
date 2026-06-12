## Context

WinBridge is consent-first, so peer identity metadata shown to the host must be meaningful enough to support an explicit approval decision. The agent shell already rejects blank display names at CLI and runtime option boundaries, but `packages/protocol` still accepts strings such as `"   "` in shared identity and message schemas.

This change closes that gap at the protocol contract layer so relay, shell, and future adapters share the same baseline validation.

## Goals / Non-Goals

**Goals:**
- Reject whitespace-only display names in local device identity metadata.
- Reject whitespace-only `hello.displayName` presence metadata.
- Reject whitespace-only legacy `host-consent-required.viewerDisplayName` metadata.
- Reuse one shared schema so validation remains consistent.
- Keep validation at schema boundaries before metadata can be forwarded or displayed.

**Non-Goals:**
- No production account identity or durable device trust.
- No name uniqueness, impersonation prevention, or account binding.
- No UI rendering changes.
- No capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, privilege elevation, unattended access, or Windows security prompt handling.

## Decisions

1. Export `DeviceDisplayNameSchema` from `packages/protocol/src/identity.ts`.
   - Rationale: device identity is the current home for peer display-name semantics, and messages can import the same contract.
   - Alternative considered: duplicate `.refine()` calls in each message schema. Rejected because future changes could drift.

2. Preserve the stored display name exactly while rejecting names whose trimmed length is zero.
   - Rationale: the current CLI/runtime behavior validates blankness without normalizing user-provided labels. This avoids unexpected display changes while preventing empty-looking metadata.

3. Cover both modern and legacy consent surfaces.
   - Rationale: `hello` is presence metadata, `deviceIdentity` is join metadata, and `host-consent-required.viewerDisplayName` is still a consent prompt input. All three must fail closed for blank labels.

## Risks / Trade-offs

- Existing tests or callers that used whitespace-only display names will now fail. This is intended because blank labels are not usable consent metadata.
- This does not solve impersonation or verified identity. The security model must continue to describe local display names as metadata, not authentication.

## Migration Plan

1. Add and export the shared display-name schema.
2. Use it in identity, hello, and legacy consent request schemas.
3. Add focused protocol tests for rejected blank names.
4. Update docs and OpenSpec specs.
5. Run focused tests plus full check, test, build, and OpenSpec validation.

Rollback is restoring the previous string schemas, though that would reopen the blank consent metadata gap.

## Open Questions

- Production verified identity, account display names, device trust, and anti-impersonation remain future OpenSpec work.

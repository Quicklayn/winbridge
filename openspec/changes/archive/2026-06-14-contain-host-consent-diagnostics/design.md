## Context

The managed agent shell supports an interactive host decision provider for development consent workflows. Provider approval is authoritative only when it returns the exact accepted approval response and the session can still send the matching workflow messages. Provider failure must remain a denial-by-default path.

The current provider-failure catch path calls the general `reportRuntimeError()` helper and then logs that interactive consent failed closed. If the configured runtime `onEvent` callback or logger throws while reporting that diagnostic, the callback failure can escape before the catch path returns `"none"`.

## Goals / Non-Goals

**Goals:**

- Keep interactive host consent provider failure fail-closed even when diagnostic callbacks throw.
- Keep diagnostic event and logger callback failures best-effort only for this provider-failure path.
- Keep emitted diagnostics bounded and avoid raw provider, callback, logger, display-name, reason, pairing, token, protocol payload, credential, or remote-content text.
- Preserve existing approval, denial, active state, revocation, pause, resume, termination, expiration, and disconnect workflow gates.

**Non-Goals:**

- No protocol schema changes or new workflow messages.
- No native Windows UI, capture, input, clipboard, file transfer, diagnostics access, reconnect, installer, startup, service, privilege, credential, or hidden-session behavior.
- No change to the host prompt text or accepted `approve`/`deny` input contract.
- No production audit durability change.

## Decisions

1. Reuse a bounded best-effort runtime diagnostic helper for consent provider failures.
   - Rationale: provider failure is already a fail-closed consent path; diagnostics must not become an implicit authorization dependency.
   - Alternative considered: keep the general runtime diagnostic helper. Rejected because its callback/logger failures can escape the provider catch path.

2. Keep the consent failure order: attempt sanitized diagnostic, attempt static fail-closed log, return `"none"`.
   - Rationale: returning `"none"` prevents authorization decision sends in the existing host authorization request handler.
   - Alternative considered: throw after diagnostics. Rejected because this makes optional diagnostics influence the consent workflow and can obscure the explicit fail-closed result.

3. Do not include caught diagnostic callback or logger error text in logs or runtime events.
   - Rationale: callback errors may contain raw provider exception text, local file paths, tokens, or private markers.
   - Alternative considered: include diagnostic callback error classes for troubleshooting. Rejected because this path is consent-sensitive and must prioritize secret-safe fail-closed behavior.

## Risks / Trade-offs

- Diagnostic callback/logger failures become quieter on provider-failure handling. Mitigation: provider failure remains visible through bounded diagnostics when callbacks cooperate and through the static fail-closed log when logger logging works.
- Tests must avoid depending on long timers. Mitigation: trigger provider failure synchronously after the viewer request and wait for the local runtime request event before asserting no workflow messages.

## Context

The protocol already accepts `screen-frame` envelopes with `image/jpeg` or `image/png`, and the viewer local surface can serve either type based on the configured latest-frame file bytes with an extension fallback. The Windows capture adapter currently captures the full primary screen as PNG and rejects output above `DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES` (`48 KiB`). That keeps payloads bounded, but it makes real desktop frames unreliable for the MVP because ordinary full-screen PNG screenshots often exceed the limit.

## Goals / Non-Goals

**Goals:**

- Produce a real, bounded first-frame preview for the consent-first MVP workflow.
- Keep native capture behind the existing active visible `screen:view` grant, peer-connected state, and audit gates.
- Preserve metadata-only diagnostics and avoid raw frame data in logs, events, or errors.
- Keep the implementation dependency-free and local to the reviewed development capture path.

**Non-Goals:**

- No production streaming codec, delta encoding, hardware capture pipeline, media transport, or LAN/public relay hardening.
- No hidden capture, unattended access, service installation, startup persistence, privilege elevation, credential access, keylogging, or Windows prompt bypass.
- No change to authorization, pairing, relay routing, or input semantics.

## Decisions

- Emit JPEG preview by default from native PowerShell capture.
  - Rationale: JPEG is already allowed by the protocol and is much more likely than PNG to fit the existing 48 KiB frame bound for desktop previews.
  - Alternative considered: increase the protocol bound. Rejected for this MVP increment because it expands relay/message payload risk instead of making capture conform to the existing contract.

- Downscale and reduce JPEG quality before returning native output.
  - Rationale: a fixed quality alone can still exceed 48 KiB on high-detail or high-resolution desktops. The native script will attempt bounded preview dimensions and quality levels, then smaller dimensions if needed.
  - Alternative considered: return the first JPEG and let TypeScript reject oversize frames. Rejected because it preserves the current unreliable user-visible behavior.

- Keep adapter parser compatible with PNG and JPEG, but map the adapter's internal `"jpeg" | "png"` format to protocol MIME types in the runtime.
  - Rationale: it keeps the capture adapter independent from protocol envelope strings while ensuring the actual encoded format is preserved for viewers and audits.

- Treat the local viewer surface's configured latest-frame file as current-run state.
  - Rationale: a pre-existing frame file can otherwise be served before the current viewer runtime persists an authorized inbound frame. The surface will clear the configured path during startup and fail closed if it cannot.

- Bind local input and disconnect POSTs to the visible local page with a per-run token, same-origin check, and JSON content-type gate.
  - Rationale: the local surface is loopback-only, but browsers can still submit cross-origin requests to localhost. Mutation routes should reject before reading request bodies or authorization state unless the request came from the generated local page for the current surface run.

## Risks / Trade-offs

- Preview quality may be lower on high-detail screens -> mitigation: prefer 1280x720 and step down only when needed to fit the bound.
- The PowerShell script becomes more complex -> mitigation: keep all values numeric constants, avoid shell interpolation of user input, and cover command safety with tests.
- JPEG is lossy -> mitigation: this is an MVP remote-assistance preview path, not final production media.
- Some pathological screens may still exceed the bound -> mitigation: TypeScript validation remains fail-closed and diagnostics stay metadata-only.
- Local browser compatibility depends on standard same-origin POST behavior -> mitigation: the generated page performs same-origin JSON fetches and tests cover token, origin, and content-type rejection paths.

## Migration Plan

- Update tests and docs to expect JPEG for native capture while leaving static frames and protocol PNG support intact.
- Existing user-provided `.png` viewer output paths continue to work, but the command kit defaults to `.jpg` so the local surface content type matches native capture output.

## Open Questions

- None for this MVP increment.

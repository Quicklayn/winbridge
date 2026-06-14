## Context

The interactive host consent prompt is a development host workflow used before sending an authorization decision. The normal runtime path validates viewer peer id, display name, permissions, and request reason before passing metadata to the prompt provider. The prompt helper is also exported and testable directly, so its formatting boundary should not assume every caller already performed runtime validation.

## Goals / Non-Goals

**Goals:**

- Validate host-facing prompt metadata at the prompt rendering boundary.
- Avoid echoing unsafe optional display-name or request-reason text when the prompt helper is called directly.
- Preserve current exact-answer behavior and timeout fail-closed semantics.
- Reuse existing protocol validation rules instead of adding a new consent metadata format.

**Non-Goals:**

- No new permission, capture, input, clipboard, file-transfer, diagnostics, reconnect, unattended, or native Windows capability.
- No change to relay routing, protocol envelopes, audit persistence, token handling, installer behavior, startup persistence, services, or privilege elevation.
- No production identity model or native Windows consent UI.

## Decisions

- Validate required prompt fields during formatting and render bounded placeholders for invalid data.
  - Rationale: the prompt must remain readable to the host while avoiding raw unsafe metadata exposure.
  - Alternative considered: throw from the prompt helper. That would fail closed, but it would also make prompt cancellation/error behavior harder to distinguish in tests and could expose raw exception text through future callers.
- Use existing protocol schemas and classifiers for prompt metadata.
  - Rationale: `PeerIdSchema`, `DeviceDisplayNameSchema`, `PermissionSchema`, and `hasSecretBearingAuditMetadata` already encode the local bootstrap safety rules.
  - Alternative considered: duplicate full validation strings in the prompt module. That increases drift risk.
- Keep request-reason rendering optional and sanitized.
  - Rationale: the host benefits from safe context, but private reason text must never be echoed when unsafe or malformed.
  - Alternative considered: remove request reason from prompt text entirely. That would reduce context and regress existing consent UX.

## Risks / Trade-offs

- Invalid required metadata can still render a placeholder prompt, which might be less informative to the host. Mitigation: the normal runtime path rejects invalid metadata before reaching the prompt; the placeholder behavior exists for direct helper hardening and tests.
- Safe request reasons still appear in prompt text for host review. Mitigation: rejected unsafe reasons render as `unavailable`, and raw rejected values are covered by tests.
- Protocol schema imports add coupling from prompt rendering to protocol validation. Mitigation: the agent shell already depends on `@winbridge/protocol`, and this keeps one validation source.

## Context

The development agent shell already supports viewer authorization requests and protocol-level request reasons through `session-authorization-request.reason`. Runtime reason fields are already redacted from local trusted events and validated by protocol schemas, but there is no CLI/runtime option that lets a viewer supply a safe request reason for the host to consider.

Interactive host consent prompts currently show trusted viewer identity and requested permissions. Adding a bounded, validated request reason improves explicit consent context without adding remote access capability.

## Goals / Non-Goals

**Goals:**

- Add a viewer-only request reason option that uses existing agent-shell reason validation before relay startup.
- Carry the reason into outbound `session-authorization-request.reason`.
- Show the request reason in the interactive host consent prompt using the already validated inbound request field.
- Keep local runtime event redaction unchanged so raw reason text is not emitted in trusted local protocol events.
- Reject malformed, untrimmed, oversized, control-character, formatting-control, or secret-bearing request reasons before connecting to the relay.

**Non-Goals:**

- No new permissions or remote capability.
- No capture, input, clipboard, file-transfer, diagnostics, reconnect, native Windows API, installer, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.
- No production identity/authentication changes.
- No relay routing or protocol schema changes.

## Decisions

- Reuse `parseOptionalReason` and runtime workflow reason validation for request reasons.
  - Rationale: request reasons have the same safety profile as lifecycle reasons: bounded text, no controls, and no raw secrets.
  - Alternative considered: create a looser viewer-only parser. Rejected because consent text can be displayed to the host and must remain secret-safe.
- Make `--request-reason` viewer-only.
  - Rationale: only viewers originate authorization requests. Host-mode use would be confusing workflow metadata and should fail before runtime startup.
  - Alternative considered: allow host mode and ignore it. Rejected because no-op sensitive workflow options have been consistently rejected in this repo.
- Require `--request-reason` to accompany a non-empty viewer permission request.
  - Rationale: a request reason is only meaningful when an authorization request will be sent, and silently accepting unused sensitive workflow metadata would make CLI behavior harder to audit.
  - Alternative considered: accept a reason without `--request` and send nothing. Rejected because the configured reason would not be host-visible and could mislead automation.
- Display `unavailable` when no reason is provided.
  - Rationale: prompts stay stable and explicit without inventing a reason.
  - Alternative considered: omit the prompt line. Rejected because a stable prompt line is easier to test and future UI wiring can preserve the same field.

## Risks / Trade-offs

- [Risk] Request reason text is intentionally host-visible, unlike redacted runtime events.
  - Mitigation: validate the reason before relay startup and only display the parsed protocol reason in the host prompt.
- [Risk] Adding another CLI option could weaken role separation.
  - Mitigation: reject the option in host mode and test that rejection happens before runtime startup.
- [Risk] The host prompt could accidentally display private rejected values.
  - Mitigation: malformed or secret-bearing values fail before sending; inbound protocol schema and prompt tests cover safe display behavior.

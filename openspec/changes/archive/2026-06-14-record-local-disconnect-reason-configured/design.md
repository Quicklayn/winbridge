## Context

Host-local disconnect paths close the local WebSocket with either a default reason or `options.hostDisconnectReason`. The raw close reason is already validated, redacted from local diagnostics, and excluded from audit records. Other lifecycle audit records use `reasonConfigured` to preserve a bounded signal that an operator supplied custom lifecycle text without recording the text.

## Goals / Non-Goals

**Goals:**

- Add `reasonConfigured` to local `agent-shell.session.disconnected` audit details.
- Ensure the boolean is true for both scheduled host disconnect simulation and direct managed host disconnect when `hostDisconnectReason` is configured.
- Ensure the boolean is false when the runtime uses the built-in default local disconnect reason.
- Preserve best-effort cleanup behavior when disconnect audit persistence fails.
- Keep raw disconnect reason text out of audit records, protocol messages, logs, and runtime event payloads.

**Non-Goals:**

- No change to WebSocket close reason validation, close codes, relay `peer-disconnected` notices, reconnect behavior, authorization gates, host visibility, or protocol lifecycle messages.
- No new capture, input, clipboard, file-transfer, diagnostics, unattended access, installer, startup, service, token, credential, privilege, native Windows, or Windows prompt capability.

## Decisions

- Compute `reasonConfigured` from `options.hostDisconnectReason !== undefined`.
  - Rationale: validation already normalizes the option boundary, and this matches whether the operator configured a local reason rather than whether the final close reason string is non-default.
  - Alternative considered: compare the final close reason to default strings. That is more fragile and couples audit behavior to display text.
- Add the boolean in the existing local disconnect audit detail object.
  - Rationale: it reuses the current accepted audit event and avoids creating new protocol-visible messages.
  - Alternative considered: emit a separate audit action. That would add noise and increase failure cases for a small bounded detail.

## Risks / Trade-offs

- Boolean metadata reveals that a custom local disconnect reason existed. Mitigation: this is bounded lifecycle metadata, contains no raw text, and is limited to the configured audit sink.
- Audit schema drift could break tests if boolean details are not accepted. Mitigation: existing lifecycle audit records already use boolean detail fields, and focused tests will assert persistence.

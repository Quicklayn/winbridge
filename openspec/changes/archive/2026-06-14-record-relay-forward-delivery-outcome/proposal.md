## Why

The relay now writes accepted `relay.message.forwarded` audit before recipient
delivery, which preserves accepted-forward evidence. However, the relay does
not separately record whether the post-audit transport send attempt succeeded
or failed. Disconnect notifications already record sent/failed counts; regular
forwarded peer messages should have comparable bounded delivery-outcome
observability without weakening the pre-delivery audit gate.

## What Changes

- After accepted forward audit succeeds and the relay attempts recipient
  delivery, write a bounded `relay.message.delivery` audit record.
- Include message type, validated `messageId`, safe recipient routing metadata,
  target/sent/failed counts, and permitted non-secret authorization id metadata
  where already allowed for forward audit.
- Treat recipient send failure as delivery outcome metadata, not as an invalid
  sender message.
- Keep post-send delivery audit failure non-retroactive: it must not emit
  `relay.message.rejected`, must not send a peer-facing `relay-error`, and must
  not expose raw protocol payloads or private transport error text.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: forwarded peer-message delivery attempts now have bounded
  post-send audit outcome metadata.

## Impact

- Affected code: `apps/relay/src/server.ts`, relay integration tests.
- Affected docs/specs: `openspec/specs/relay-runtime/spec.md`,
  `docs/security-model.md`.
- Safety impact: improves transport observability after an already accepted
  relay forwarding decision. This does not add capture, input, clipboard,
  file-transfer, diagnostics, installer, startup, service, privilege,
  production identity, production relay, hidden-session, credential,
  keylogging, evasion, prompt-bypass, or native Windows behavior.
- Review: security review is required because this touches relay routing and
  logging/audit behavior.

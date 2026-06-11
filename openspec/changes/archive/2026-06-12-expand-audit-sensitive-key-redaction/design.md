## Context

All development audit sinks call `createAuditRecord`, which validates records and redacts sensitive detail fields before storing or emitting them. The current redaction is intentionally key-based and recursive, but the key list is incomplete for common authentication material names.

Audit redaction should fail closed for obvious secret-bearing fields while avoiding over-redaction of safe lifecycle identifiers that are useful for debugging and traceability.

## Goals / Non-Goals

**Goals:**

- Redact additional common secret-bearing audit detail keys: API keys, authorization headers, auth headers, cookies, set-cookie values, session cookies, and private keys.
- Preserve safe identifiers such as `authorizationId` when they are not secret values.
- Keep recursive behavior for nested objects and arrays.
- Add tests for nested objects, arrays, and safe authorization identifiers.

**Non-Goals:**

- No value-content scanning or entropy detection.
- No audit schema or sink interface changes.
- No protocol, relay routing, authorization lifecycle, consent workflow, capture/input, installer, or privilege changes.

## Decisions

1. Use normalized key matching instead of broad regex-only matching.

   Keys will be normalized by lowercasing and removing non-alphanumeric separators. Existing broad matches for `token`, `credential`, `password`, `secret`, `pairingcode`, `keystroke`, `screenshot`, `screendata`, and `screencontent` remain. Additional exact or substring matches cover `apikey`, `authorization`, `authorizationheader`, `authheader`, `cookie`, `setcookie`, `sessioncookie`, and `privatekey`.

   Alternative considered: match any key containing `auth`. Rejected because it would redact useful non-secret fields such as `authorizationId` and reduce audit usefulness.

2. Keep redaction key-based.

   Value scanning can produce false positives, performance cost, and unclear behavior for structured audit details. Key-based redaction matches the current contract and is predictable.

## Risks / Trade-offs

- Some benign fields with `cookie` or `apiKey` in their name may be redacted -> acceptable for audit safety.
- Secret values stored under non-secret-looking names remain caller responsibility -> documented residual risk; this change strengthens obvious-key coverage without changing the model.
- Exact `authorization` is redacted but `authorizationId` is not -> intentional distinction between credential/header material and lifecycle identifiers.

# Security Review: Token-env role readiness validation

## Scope
Non-executing `mvp:ready -- --role host|viewer` validation for role-filtered command output rendered with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`.

## Findings
- Consent and visibility invariants are unchanged; no runtime session is started.
- Raw token values remain prohibited. The validator checks for the bounded environment-variable reference and rejects output without it.
- Readiness output remains fixed check metadata only and does not echo generated command blocks or child output.
- No hidden session, persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass behavior is introduced.

## Decision
Approved for implementation as a readiness hardening increment.

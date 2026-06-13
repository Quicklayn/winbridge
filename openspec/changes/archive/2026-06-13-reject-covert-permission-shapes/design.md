## Context

The current bootstrap exposes a small `PermissionSchema` enum for consent-bound remote assistance: screen view, pointer/keyboard input, clipboard read/write, and file transfer. Diagnostics denial is now explicitly covered, but similarly risky names that resemble remote shell, unattended access, persistence, service installation, privilege elevation, credential access, keylogging, stealth, or Windows prompt bypass are only rejected implicitly by the closed enum.

## Goals / Non-Goals

**Goals:**

- Preserve a single closed permission vocabulary as the enforcement point.
- Add regression tests proving representative covert and high-risk administrative permission shapes are rejected across authorization and protocol entry points.
- Update documentation so these strings cannot be confused with planned or consentable current permissions.

**Non-Goals:**

- No new permission names.
- No remote shell, unattended access, installer, startup, service, privilege, credential, keylogging, stealth, evasion, prompt-bypass, capture, input, or diagnostics implementation.
- No production identity or Windows-native behavior.

## Decisions

1. Keep enforcement in `PermissionSchema`.
   - Rationale: the enum is already the shared authorization/protocol contract; adding a parallel deny-list would create drift risk.
   - Alternative considered: add a separate unsafe-permission matcher. Rejected because the product needs an allow-list permission vocabulary, not a blacklist.

2. Test representative unsafe shapes at all relevant boundaries.
   - Rationale: tests should prove request creation, host grants, parsed state, consent-bound grants, revocation, action authorization, and protocol envelopes fail closed.
   - Alternative considered: only test `PermissionSchema` directly. Rejected because regressions usually appear at API and wire-message boundaries.

3. Document the distinction between prohibited and future-review areas.
   - Rationale: credential theft, keylogging, stealth, evasion, and prompt bypass are prohibited; installer, startup, service, privilege, administrative, and native Windows areas require explicit future OpenSpec/security review before any legitimate consent-first capability can exist.

## Risks / Trade-offs

- Representative list misses a future dangerous string -> Mitigated by the closed allow-list enum and by documenting that all non-vocabulary strings are rejected.
- Future legitimate service/installer work conflicts with these tests -> Mitigated by requiring a future OpenSpec change to explicitly add or change permission vocabulary and update regression tests.
- Tests duplicate diagnostics denial shape -> Accepted because this change covers a different abuse class and protects future refactors.

## Migration Plan

No runtime migration is required. The current implementation already rejects unknown permission strings through `PermissionSchema`; this change adds specs, tests, and docs.

## Open Questions

None.

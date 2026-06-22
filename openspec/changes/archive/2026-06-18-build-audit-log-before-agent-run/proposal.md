# Change: Build audit log before agent runs

## Why

The root `npm run dev:agent` helper starts agent-shell, and agent-shell imports `@winbridge/audit-log` for all audited MVP paths. The audit-log workspace exports built `dist` files, so the helper should build that workspace before agent-shell to keep the generated MVP commands runnable from a fresh checkout.

## What Changes

- Build `@winbridge/audit-log` in the root `dev:agent` chain after protocol and before packages that consume it.
- Extend the MVP command kit regression test to assert the audit-log dependency is built.
- Update the MVP command kit spec dependency-readiness scenario.

## Impact

No protocol, authorization, capture, input, or audit semantics change. The helper still only runs after the user explicitly starts the printed command in a visible terminal.

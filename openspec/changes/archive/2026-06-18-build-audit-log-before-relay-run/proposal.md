# Change: Build audit log before relay runs

## Why

The MVP command kit prints `npm run dev:relay` as the first visible terminal step. The relay imports `@winbridge/audit-log`, whose package export points to built `dist` files. A fresh checkout should not require the operator to know that this internal workspace must be built before running the printed relay command.

## What Changes

- Build `@winbridge/audit-log` in the root `dev:relay` chain after protocol and before starting relay.
- Extend the MVP command kit regression test to assert relay helper dependency readiness.
- Update the MVP command kit spec dependency-readiness scenario.

## Impact

This is a development run-readiness change only. It does not change relay authorization, pairing, message forwarding, audit semantics, network binding, or any hidden/background behavior.

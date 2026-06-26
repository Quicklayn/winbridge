# Design

## Parser Guard

Add a fail-closed parser check after flag parsing and before option parsing or
pairing generation. If `onlyTarget` and `generatePairing` are both set, throw
the existing bounded `MvpSessionCommandKitUsageError`.

Checking before pairing generation ensures invalid role-filtered invocations do
not generate or expose a transient pairing code.

## Compatibility

Full-session text and JSON command plans continue supporting
`--generate-pairing`. Role-filtered output remains available with either the
default pairing or an explicit shared `--pairing` argument.

## Safety

The guard is non-executing CLI validation only. It preserves the command kit's
bounded diagnostics and must not echo raw invalid values, generated pairing
codes, relay URLs, paths, tokens, or other secret-bearing input.

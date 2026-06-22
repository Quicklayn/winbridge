# Design: Add Generated Pairing to MVP Command Kit

## CLI Behavior

`--generate-pairing` is a flag-only option accepted by the full command kit and
JSON command plan modes.

Rules:

- It generates a bounded pairing code matching `NNN-NNN`.
- It is rejected when `--pairing` is also provided.
- It is rejected in `--preflight-only` mode because preflight output contains no
  host/viewer pairing commands.
- Duplicate or valued usage fails closed through bounded usage diagnostics.

## Generation

Use `crypto.randomInt(0, 1000)` twice and zero-pad both parts to three digits.
Tests may inject a deterministic pairing generator.

## Security Rationale

Generated pairing reduces accidental reuse of the fixed development pairing code
for real two-PC trials. It is not a replacement for host approval and visible
session controls.

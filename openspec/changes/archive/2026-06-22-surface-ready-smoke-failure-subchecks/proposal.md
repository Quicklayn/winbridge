## Why

`mvp:smoke --json` can now emit bounded subcheck metadata for known failure
steps, but `mvp:ready --json --include-smoke` still collapses included smoke
failures to a single aggregate failure. Local automation should preserve the
safe failure location without exposing child output or runtime contents.

## What Changes

- Allow `mvp:ready` to parse bounded smoke failure subchecks from included
  `mvp:smoke -- --json` output.
- Include those fixed smoke subchecks in aggregate JSON and text output when
  the included smoke check fails with safe metadata.
- Keep aggregate failure reasons bounded to existing ready helper reason codes.
- Do not expose smoke stdout/stderr, generated commands, paths, URLs, ports,
  frame bytes, audit contents, tokens, pairing codes, credentials, signal
  payloads, input contents, private reasons, or raw exceptions.
- Do not add capture, input, auth, relay, installer, startup, service, token,
  log sink, or privilege behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP ready helper may surface fixed safe smoke
  failure subcheck records from the included smoke check.

## Impact

- Affected code: `scripts/mvp-ready.mjs` and focused ready helper tests.
- Affected specs: `openspec/specs/mvp-session-command-kit/spec.md` via this
  change's delta spec.
- No dependency, protocol, runtime remote-action, relay, auth, installer,
  service, native Windows API, token, or audit sink changes.

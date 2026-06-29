## Why

The MVP command kit prints host commands that enable interactive consent but
does not expose the already-supported host consent timeout in the generated
plan. Making the timeout explicit improves two-PC trial predictability without
changing the consent model or adding runtime behavior.

## What Changes

- Add a bounded `--host-consent-timeout-ms <ms>` option to `npm run
  mvp:commands`.
- Print `--host-consent-timeout-ms` in generated host commands whenever
  `--host-consent-prompt 'true'` is printed.
- Keep the default timeout aligned with the existing agent-shell default of
  `60000` ms.
- Validate malformed, duplicate, fractional, zero, negative, oversized, or
  unsafe timeout values before rendering commands.
- Extend readiness validation so command-plan drift fails closed when the host
  consent timeout argument disappears or changes unexpectedly.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: add explicit host consent timeout rendering and
  readiness validation for the non-executing MVP command plan.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README/OpenSpec docs.
- Touches user-visible command generation for host consent only.
- Does not change capture, input application, authentication, relay protocol,
  installer behavior, startup persistence, services, tokens, logs, privilege
  elevation, hidden sessions, or Windows security prompt behavior.

## Why

The MVP command kit currently prints the full relay/host/viewer/browser plan,
which is useful for review but cumbersome during a real two-PC trial. Operators
need a bounded way to print only the command block for the machine they are on
without weakening the consent-first workflow.

## What Changes

- Add a command-kit option that filters the non-executing output to one fixed
  target: relay, host, viewer, browser, or preflight.
- Preserve the existing default full command plan and bounded JSON session plan
  behavior.
- Reject malformed, duplicate, or incompatible role-filter options without
  echoing unsafe input.
- Document the filtered command workflow for two-PC trials.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: command kit can print fixed machine-specific
  non-executing command blocks while preserving validation and safety bounds.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, README, and OpenSpec docs.
- Affected systems: non-executing MVP command generation only.
- Safety impact: no new capture, input, relay, authentication, audit,
  installer, startup, service, token, log, or privilege behavior. The change
  only narrows printed commands to reduce operator mistakes.
- Non-goals: no automatic process launching, no remote discovery, no network
  probing, no firewall configuration, no hidden sessions, no unattended access,
  no native UI changes, and no changes to consent, authorization, capture, or
  input execution paths.

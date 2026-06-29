# Design

## Help Text

Replace the stale two-line default-mode description with bounded text that
names the categories already present in the default readiness plan:

- doctor and native preflight;
- non-executing command-plan validation;
- role-filter, LAN, token-env, and ephemeral browser output validation;
- explicit smoke opt-in.

The usage output remains static, contains no command results, and does not
include local paths, relay URLs, tokens, pairing codes, or child output.

## Tests

Tests should verify that `MVP_READY_USAGE` does not contain the stale "only
doctor and native preflight" claim and that it names the default validation
categories. Keep the assertion focused on static usage text and default plan
names rather than duplicating every command argument.

## Non-Goals

- Do not change the default readiness plan.
- Do not run smoke by default.
- Do not change command-kit output, relay behavior, token handling, capture, or
  input behavior.

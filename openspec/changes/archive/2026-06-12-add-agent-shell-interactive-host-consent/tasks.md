## 1. Runtime Consent Provider

- [x] 1.1 Add a validated host decision provider option that is available only for host runtimes and mutually exclusive with static approval/denial.
- [x] 1.2 Route provider decisions through the existing approval/denial workflow so audit ordering, visible activation, indicator events, and lifecycle simulations remain unchanged.
- [x] 1.3 Fail closed without sending workflow messages when the provider returns no valid decision, throws, or is unavailable.

## 2. CLI Prompt

- [x] 2.1 Add an opt-in CLI flag for interactive host consent and reject invalid role/static-decision combinations before runtime start.
- [x] 2.2 Implement a secret-safe stdin/stdout prompt adapter that accepts only exact approval or denial responses.
- [x] 2.3 Update docs for static versus interactive development host consent.

## 3. Tests And Review

- [x] 3.1 Add focused argument and prompt tests for valid configuration, invalid configuration, accepted responses, and fail-closed invalid/cancelled responses.
- [x] 3.2 Add integration tests for interactive approval, interactive denial, fail-closed invalid provider result, provider failure, and visible-session gating.
- [x] 3.3 Run focused tests for agent-shell prompt/runtime behavior.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.5 Perform security review for the host consent/auth/logging change and archive the completed OpenSpec change.

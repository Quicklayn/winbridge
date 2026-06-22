# Design: Add MVP doctor preflight

## Context

`mvp:commands` prints the manual two-PC workflow and `mvp:smoke` verifies a
static local path. Neither command tells the developer whether the current
machine is suitable for a Windows-to-Windows MVP trial before they start the
visible session commands.

## Approach

Add `scripts/mvp-doctor.mjs` with exported pure helpers for testability:

- parse and compare the current Node.js version against `>=20.19.0`,
- read the root `package.json`,
- check required root scripts exist,
- check required workspace `package.json` files exist,
- check `process.platform === "win32"`.

The CLI prints success only when all checks pass. On failure, it prints a
generic reason code selected from a fixed allowlist. Diagnostics do not include
paths, environment values, tokens, pairing codes, command output, or stack
traces.

## Alternatives

- Run `npm run build` from doctor: heavier and duplicates existing smoke/check
  commands.
- Try native capture/input calls: closer to full readiness, but higher-risk and
  outside a read-only preflight.

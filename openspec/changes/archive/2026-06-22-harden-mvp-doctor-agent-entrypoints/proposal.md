# harden-mvp-doctor-agent-entrypoints

## Why

`mvp:doctor` currently verifies the root agent-shell entrypoint but not the
MVP-specific agent-shell modules used by the generated two-PC workflow. A fresh
checkout could pass doctor while missing the local viewer surface, frame output,
or host/viewer control prompt modules required for practical MVP operation.

## What Changes

- Extend the doctor entrypoint list with critical MVP agent-shell source files.
- Keep doctor read-only and bounded.
- Keep failure output path-free and secret-safe.

## Impact

- Affected spec: `mvp-session-command-kit`
- Affected code: `scripts/mvp-doctor.mjs`
- Affected tests: `scripts/mvp-doctor.test.ts`

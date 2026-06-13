## 1. Runtime Status

- [x] 1.1 Make host status prefer the last inactive host indicator over stale active authorization state.
- [x] 1.2 Add optional bounded `inactiveCause` metadata to host status snapshots only for inactive local indicator state.

## 2. CLI Output And Docs

- [x] 2.1 Print optional host status `inactiveCause` when present without invoking controls or sending protocol messages.
- [x] 2.2 Update README and security-model documentation for inactive host status semantics and non-goals.

## 3. Tests And Verification

- [x] 3.1 Add focused unit/integration coverage for inactive host status after terminal and disconnect deactivation paths.
- [x] 3.2 Run focused tests for changed host status behavior.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 1. Shared Token Config

- [x] 1.1 Add relay tests for omitted shared token, valid shared token, and blank configured shared token.
- [x] 1.2 Add shared-token config helper and runtime validation that rejects empty or whitespace-only configured tokens.
- [x] 1.3 Wire the relay CLI entrypoint through the shared-token config helper.
- [x] 1.4 Update docs to clarify omitted vs blank shared token behavior.

## 2. Verification

- [x] 2.1 Run focused relay tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run security review for the auth/relay token configuration change.
- [x] 2.7 Archive the OpenSpec change after implementation and verification are complete.

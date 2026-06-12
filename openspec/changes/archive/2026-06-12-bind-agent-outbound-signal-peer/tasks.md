## 1. Implementation

- [x] 1.1 Add a public runtime outbound `signal` peer-binding guard before socket write and local `sent` event emission.
- [x] 1.2 Keep blocked signal routing diagnostics secret-safe.
- [x] 1.3 Update the main `agent-shell-consent-workflow` spec with the outbound signal peer binding.

## 2. Verification

- [x] 2.1 Add focused integration coverage for spoofed `fromPeerId`, explicit self-target `toPeerId`, and normal authorized signals.
- [x] 2.2 Run focused agent-shell runtime integration tests for outbound signal peer binding.
- [x] 2.3 Run security review for the authorization/send-path diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Validate and archive the completed OpenSpec change.

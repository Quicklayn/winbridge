## 1. Smoke Disconnect Subcheck

- [x] 1.1 Add a fixed `viewer-disconnect` smoke subcheck and bounded `viewer-disconnect-not-ready` reason.
- [x] 1.2 Add a `tryPostSurfaceDisconnect` helper that accepts only `202 { ok: true, action: "disconnect" }` from the token-protected local `/disconnect` path.
- [x] 1.3 Run the disconnect subcheck after audit and lifecycle readiness without replacing existing host-side lifecycle denial coverage.

## 2. Ready Aggregation

- [x] 2.1 Teach `mvp:ready` to accept the expanded fixed smoke subcheck set.
- [x] 2.2 Update ready parser tests for valid, missing, duplicate, malformed, and unsafe viewer-disconnect metadata.

## 3. Local Surface Guard Tests

- [x] 3.1 Extend local surface tests so `/disconnect` rejects foreign origins and unsafe content types without calling `runtime.leave()`.
- [x] 3.2 Verify disconnect success responses and guard failures remain metadata-only.

## 4. Documentation And Verification

- [x] 4.1 Update README MVP smoke/ready documentation for the new fixed viewer-disconnect subcheck.
- [x] 4.2 Run focused smoke, ready, and surface tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Review token, local surface, disconnect, child-output, audit, and no-leak invariants before archiving.

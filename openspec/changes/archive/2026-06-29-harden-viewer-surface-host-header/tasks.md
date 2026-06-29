## 1. Implementation

- [x] 1.1 Add exact Host-header validation to the viewer local control surface request path.
- [x] 1.2 Ensure Host-header rejection applies before HTML, status, frame, input, and disconnect behavior.

## 2. Tests and Docs

- [x] 2.1 Add tests proving canonical loopback Host requests still work.
- [x] 2.2 Add tests proving mismatched/missing Host requests reject before read routes expose data.
- [x] 2.3 Add tests proving mismatched/missing Host requests reject before input or disconnect side effects.
- [x] 2.4 Update security documentation for the Host-header boundary.
- [x] 2.5 Add a security review note for local surface request-boundary impact.

## 3. Verification

- [x] 3.1 Run `npm run check`.
- [x] 3.2 Run `npm test`.
- [x] 3.3 Run `npm run build`.
- [x] 3.4 Run `npm run openspec:validate`.

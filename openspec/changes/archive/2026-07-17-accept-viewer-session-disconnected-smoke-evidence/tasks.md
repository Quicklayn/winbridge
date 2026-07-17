## 1. Strict Viewer Evidence Mapping

- [x] 1.1 Map accepted viewer-local `agent-shell.session.disconnected` records to strict `disconnectObserved` evidence while retaining existing requested/sent mappings.
- [x] 1.2 Preserve host mappings, global bounded summary behavior, complete role evidence requirements, content bounds, parsing, and bounded output.

## 2. Regression Coverage

- [x] 2.1 Prove a complete role-local fixture with canonical accepted viewer local-leave evidence passes strict audit readiness without duplicate viewer disconnect actions.
- [x] 2.2 Prove denied, failed, missing, and wrong-role disconnect evidence still fails strict readiness and cannot substitute for other required role evidence.
- [x] 2.3 Prove human and JSON success/failure output remains bounded and omits raw action strings, paths, record details, identifiers, input contents, and secrets.
- [x] 2.4 Prove existing viewer disconnect requested/sent actions remain accepted from the viewer-local audit file.

## 3. Verification And Release

- [x] 3.1 Run focused smoke tests and the exact default `npm run mvp:smoke -- --json`; record any independent later-stage failure separately.
- [x] 3.2 Run a security review of role scoping, accepted-outcome enforcement, mapping breadth, fail-closed cases, and diagnostic redaction; resolve blocking findings.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync the modified requirement, run strict validation, and archive the completed OpenSpec change.

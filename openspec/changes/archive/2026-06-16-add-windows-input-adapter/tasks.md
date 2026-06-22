## 1. Package Boundary

- [x] 1.1 Add `@winbridge/windows-input` workspace package and TypeScript project reference.
- [x] 1.2 Define grant, input event, runner request, runner result, and adapter types.
- [x] 1.3 Validate active visible unexpired grants, matching authorization id, peer connectivity, and required permission before runner invocation.
- [x] 1.4 Normalize protocol pointer and keyboard events into bounded native runner requests.
- [x] 1.5 Keep runner failures sanitized and package construction/import side-effect free.

## 2. Tests And Documentation

- [x] 2.1 Add unit tests for authorized pointer and keyboard runner requests.
- [x] 2.2 Add unit tests for non-Windows platform, inactive/invisible/expired/disconnected/wrong-permission/wrong-authorization grants, malformed events, runner failure redaction, and construction-time side effects.
- [x] 2.3 Update README/architecture/roadmap/threat model/privacy docs for the package-only input boundary and remaining MVP gaps.
- [x] 2.4 Run security review for input application boundaries, authorization, diagnostics/logs, services/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.5 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused windows-input tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.

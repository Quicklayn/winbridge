## 1. Ready Combined Gate

- [x] 1.1 Add `--include-windows-control-smoke` parsing, usage text, and duplicate/role conflict validation.
- [x] 1.2 Add a `windows-control-smoke` ready plan step that runs `mvp:smoke -- --json --windows-capture --windows-input`.
- [x] 1.3 Parse combined smoke JSON with the existing Windows input subcheck shape.
- [x] 1.4 Keep default readiness and `--include-all-smoke` free of combined native control smoke.

## 2. Smoke Composition Evidence

- [x] 2.1 Add tests proving `--windows-capture` and `--windows-input` compose into one host command.
- [x] 2.2 Add tests proving combined non-Windows failure remains pre-start and bounded.

## 3. Documentation and Security Review

- [x] 3.1 Update README guidance for direct combined Windows control smoke and readiness inclusion.
- [x] 3.2 Perform a security review for combined capture/input opt-in, consent, visibility, revocation, audit evidence, and diagnostic redaction.

## 4. Verification

- [x] 4.1 Run focused smoke and readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.

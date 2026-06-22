## 1. Viewer Prompt Input Commands

- [x] 1.1 Extend viewer control prompt command types and help text with bounded pointer and keyboard command forms.
- [x] 1.2 Parse and validate exact pointer commands, rejecting malformed, unsafe, suffixed, whitespace-padded, macro-shaped, raw-JSON, or text-buffer-shaped input without echoing raw command text.
- [x] 1.3 Parse and validate exact keyboard commands, rejecting unsupported keys, duplicate modifiers, malformed modifier lists, macro-shaped input, and free-form text buffers without echoing raw command text.
- [x] 1.4 Send accepted input commands through `runtime.sendInputEvent()` only after reading an active visible viewer status with an authorization id.
- [x] 1.5 Keep success and failure output metadata-only and keep the prompt available after sanitized input-send failures.

## 2. Tests, Documentation, And Review

- [x] 2.1 Add viewer control prompt unit tests for command parsing, help output, status/disconnect compatibility, pointer sends, keyboard sends, malformed input rejection, stale authorization, runtime failures, and oversized command lines.
- [x] 2.2 Add or adjust runtime integration coverage if prompt behavior reveals a gap in existing `sendInputEvent()` authorization, audit, or redaction gates.
- [x] 2.3 Update README, architecture, roadmap, threat model, privacy notice, and security model for interactive viewer input prompt status and remaining MVP gaps.
- [x] 2.4 Run security review for input command parsing, authorization, audit, diagnostics/logs, native input reachability, services/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.5 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused viewer control prompt tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.

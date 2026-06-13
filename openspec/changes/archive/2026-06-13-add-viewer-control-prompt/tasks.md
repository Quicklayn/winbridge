## 1. OpenSpec

- [x] 1.1 Validate `add-viewer-control-prompt` strictly before implementation.

## 2. Implementation

- [x] 2.1 Add `--viewer-control-prompt` parsing, viewer-only validation, and ambiguity checks with one-shot viewer helpers.
- [x] 2.2 Implement the interactive viewer control prompt with exact `status` and `disconnect` commands.
- [x] 2.3 Wire the viewer control prompt into the CLI lifecycle and shutdown path.

## 3. Tests and Docs

- [x] 3.1 Add focused CLI parsing tests for accepted, rejected, and ambiguous viewer control prompt configuration.
- [x] 3.2 Add prompt tests proving status is read-only, disconnect is local stop-only, malformed commands do not echo input, and errors are redacted.
- [x] 3.3 Document viewer control prompt behavior and safety boundaries.

## 4. Verification

- [x] 4.1 Run focused agent-shell tests for viewer control prompt behavior.
- [x] 4.2 Review the diff against consent, local-disconnect, audit redaction, and no-remote-action safety boundaries.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

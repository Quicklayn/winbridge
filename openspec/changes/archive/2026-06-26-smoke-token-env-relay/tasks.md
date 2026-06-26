# Tasks

- [x] Add OpenSpec requirement for token-env protected MVP smoke mode.
- [x] Implement `--token-env` parsing and token-value validation in the root
  MVP smoke helper.
- [x] Wire token-protected relay, host, and viewer child plans while preserving
  local static smoke safety boundaries.
- [x] Add focused tests for parsing, failure redaction, and tokenized smoke
  plan wiring.
- [x] Update README smoke documentation for the optional token-env mode.
- [x] Run security review for token/auth diagnostic boundaries.
- [x] Run verification: focused tests, real tokenized smoke, `npm run check`,
  `npm test`, `npm run build`, and `npm run openspec:validate`.

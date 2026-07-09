## Security Review

Change: `add-mvp-session-bootstrap`

Reviewed surfaces:

- `scripts/mvp-session-commands.mjs`
- `scripts/mvp-trial.mjs`
- `scripts/mvp-ready.mjs`
- Focused command-kit, trial, and readiness tests
- README and `mvp-session-command-kit` OpenSpec updates

Findings:

- `--generate-session` is explicit and full-plan only. Role-filtered and
  preflight-only output reject generated metadata before calling injected or
  default generators, preventing per-machine divergent session metadata.
- Generated session ids pass the same protocol identifier validation as
  operator-provided session ids. Secret-bearing generated values fail closed
  with bounded usage output that does not echo the rejected value.
- The `mvp:trial` bootstrap step is a fixed non-executing command reference. It
  does not run `mvp:commands`, start relay/host/viewer/browser processes,
  create files, open sockets, capture the screen, apply input, or print concrete
  generated session ids or pairing codes.
- Documentation describes generated session ids and pairing codes as
  coordination metadata only, not authentication, authorization, relay tokens,
  account identity, or host consent.

Safety conclusion:

This change preserves the consent-first safety boundary. It adds no hidden
session, stealth install, unauthorized persistence, credential access,
keylogging, AV/EDR evasion, Windows prompt bypass, hidden capture, hidden input,
or production auth shortcut.

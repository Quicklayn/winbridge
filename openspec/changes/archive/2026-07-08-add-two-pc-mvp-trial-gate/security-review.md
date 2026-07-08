## Security Review

Change: `add-two-pc-mvp-trial-gate`

Reviewed paths:

- `scripts/mvp-trial.mjs`
- `scripts/mvp-trial.test.ts`
- `scripts/mvp-doctor.mjs`
- `scripts/mvp-doctor.test.ts`
- `package.json`
- `README.md`
- `openspec/changes/add-two-pc-mvp-trial-gate/specs/**/spec.md`

Findings:

- Plan mode is non-executing. The helper does not import child process,
  socket, HTTP, WebSocket, browser automation, Windows capture, or Windows
  input modules, and tests assert those imports remain absent.
- Plan output references fixed existing gates only. It avoids generated session
  commands, concrete relay URLs, pairing codes, local surface URLs, frame
  paths, audit record contents, token values, and secret-bearing runtime
  details.
- Evidence mode validates arguments through the existing audit-summary parser
  and delegates strict role-bound evidence checks to the existing
  `runMvpAuditSummaryCheck` implementation with `requireMvpEvidence=true`.
- Evidence mode fails closed on unsafe paths, malformed logs, missing required
  evidence, denied/failed evidence, or unreadable files. Formatter output uses
  bounded reason codes and role/count/coverage metadata only.
- The helper does not add hidden sessions, unattended access, startup
  persistence, services, privilege elevation, credential access, keylogging,
  clipboard access, remote log retrieval, log upload, AV/EDR evasion, Windows
  prompt bypass, capture behavior, or input behavior.

Residual risk:

- The helper cannot prove a real two-PC trial happened until operators run
  evidence mode against the local host and viewer audit logs. README and plan
  output state that strict audit evidence is required before treating the trial
  as proven.

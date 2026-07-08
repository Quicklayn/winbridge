## Security Review

Change: `add-mvp-lan-probe`

Reviewed paths:

- `scripts/mvp-lan-probe.mjs`
- `scripts/mvp-lan-probe.test.ts`
- `package.json`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md`
- `openspec/changes/add-mvp-lan-probe/specs/mvp-session-command-kit/spec.md`

## Findings

No safety blocker found.

The new helper sends only a `join-session` envelope and consumes relay
readiness for the local peer. It does not send `hello`, host consent,
authorization, signal, screen-frame, input-event, session-control,
permission-revoked, or audit-event messages. It closes its socket after paired
readiness or failure and does not keep background handles intentionally.

Argument parsing rejects malformed relay URLs, unsafe scalar values,
secret-bearing identifiers, malformed pairing codes, malformed peer/device
metadata, duplicate options, invalid timeouts, raw token options, and invalid
token environment variable names. Token values are read only from the requested
environment variable and never printed.

Text and JSON output use fixed status metadata and reason codes. They do not
include relay URLs, pairing codes, token values, token environment values,
protocol payloads, WebSocket close reasons, exception messages, child output,
credentials, local file paths, frame bytes, screen contents, input contents,
clipboard contents, diagnostics dumps, or full secrets.

## Safety Invariants

- Host consent remains required before any assistance session.
- The probe does not grant authorization or activate host visibility.
- Capture and input remain unavailable through this helper.
- Host pause, revoke, terminate, and disconnect controls are unchanged.
- No audit evidence is fabricated or written by the probe.
- No browser, local control surface, service, startup persistence, unattended
  access, privilege elevation, firewall change, AV/EDR evasion, Windows prompt
  bypass, hidden session, credential access, keylogging, clipboard, file
  transfer, or diagnostics-dump behavior is added.

## Verification

Focused verification was run with:

```powershell
npx vitest run scripts/mvp-lan-probe.test.ts
npm run mvp:lan-probe -- --help
```

Result: passed.

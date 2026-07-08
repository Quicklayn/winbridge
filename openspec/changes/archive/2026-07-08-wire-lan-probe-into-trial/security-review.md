## Security Review

Change: `wire-lan-probe-into-trial`

Reviewed paths:

- `scripts/mvp-lan-probe.mjs`
- `scripts/mvp-lan-probe.test.ts`
- `scripts/mvp-trial.mjs`
- `scripts/mvp-trial.test.ts`
- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `scripts/mvp-doctor.mjs`
- `scripts/mvp-doctor.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md`
- `openspec/changes/wire-lan-probe-into-trial/specs/mvp-session-command-kit/spec.md`

## Findings

No safety blocker found.

`mvp:lan-probe -- --relay-host <host>` validates a bounded two-PC LAN host
shortcut and derives the relay URL internally. It rejects malformed, loopback,
unspecified, secret-bearing, duplicate, and `--relay`-combined shortcuts before
opening a WebSocket. The helper output remains fixed metadata and does not
print derived relay URLs, pairing codes, token values, token environment
values, protocol payloads, close reasons, exception text, stdout, stderr,
child output, local paths, frame bytes, screen contents, input contents,
clipboard contents, diagnostics dumps, credentials, or full secrets.

The trial helper adds only non-executing host/viewer command-reference steps
for `mvp:lan-probe`. These references keep session and pairing values as
placeholders, use the reviewed relay-host shortcut, and do not print generated
runtime relay URLs or concrete pairing codes.

`mvp:ready` only parses bounded trial-plan JSON. `mvp:doctor` only validates
root script and entrypoint alignment for `mvp:lan-probe`; it does not execute
the probe.

## Safety Invariants

- Host consent remains required before any assistance session.
- The LAN probe remains join-only and does not send `hello`, consent,
  authorization, signal, screen-frame, input-event, session-control,
  permission-revoked, or audit-event messages.
- Capture and input remain unavailable through trial planning and doctor
  checks.
- No browser, local control surface, service, startup persistence, unattended
  access, privilege elevation, firewall change, AV/EDR evasion, Windows prompt
  bypass, hidden session, credential access, keylogging, clipboard, file
  transfer, or diagnostics-dump behavior is added.

## Verification

Focused verification was run with:

```powershell
npx vitest run scripts/mvp-lan-probe.test.ts scripts/mvp-trial.test.ts scripts/mvp-ready.test.ts scripts/mvp-doctor.test.ts
```

Result: passed, 96 tests.

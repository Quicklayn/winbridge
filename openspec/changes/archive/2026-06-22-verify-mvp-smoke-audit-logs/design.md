## Context

Smoke starts a local relay, host, and viewer with static frames, visible host
approval, loopback viewer surface, and explicit host/viewer audit-log paths. The
audit files are local development JSONL outputs from the existing file audit
sink.

## Design

After the smoke runner verifies frame, surface, signal readiness, and local
input acceptance, it will poll the host and viewer audit log paths until each
file contains at least one JSON line that looks like a persisted audit record:
bounded string `eventId`, ISO `timestamp`, bounded string `action`, valid
`outcome`, object `actor`, and object or omitted `detail`.

The helper will use only a boolean result. It will not print the audit file
path, raw JSONL content, child process output, pairing code, token, private
reason, authorization id, screen contents, or input contents.

## Failure Handling

If either audit log is absent, empty, malformed, or not ready before the smoke
deadline, the check fails closed with `audit-not-ready`, stops children, and
uses existing artifact cleanup behavior.

## Non-Goals

- No change to audit sink schemas, redaction, or runtime workflow audit
  emission.
- No LAN/public HTTP surface, OS input application, Windows capture, service
  installation, startup persistence, privilege elevation, unattended access, or
  Windows prompt bypass.

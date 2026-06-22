# Design: Add MVP Smoke JSON Output

## Overview

The smoke check already returns a bounded success object and throws sanitized
`MvpSessionSmokeError` failures. The implementation adds formatting functions
and a parser flag while leaving smoke orchestration unchanged.

## CLI Behavior

- `--json` is a flag-only option.
- `--json` may be combined with existing `--timeout-ms` and `--keep-artifacts`
  options.
- `--help` remains accepted only as the sole argument.
- Malformed or duplicate `--json` usage fails closed through existing usage
  handling.

## JSON Shape

Success:

```json
{
  "ok": true,
  "checks": [
    { "name": "relay", "ok": true },
    { "name": "frame", "ok": true },
    { "name": "surface", "ok": true },
    { "name": "input", "ok": true }
  ],
  "artifacts": "cleaned"
}
```

When `--keep-artifacts` is set, `artifacts` is `retained` and `artifactDir` may
contain the bounded work directory already printed by text output.

Failure:

```json
{
  "ok": false,
  "reason": "frame-not-ready"
}
```

The reason must be selected from the existing safe smoke reason codes.

## Security Rationale

JSON output is derived from bounded result metadata and safe reason codes. It
does not serialize process output, paths other than explicit retained artifact
directory metadata, frame paths, surface URLs, mutation tokens, input commands,
or protocol secrets.

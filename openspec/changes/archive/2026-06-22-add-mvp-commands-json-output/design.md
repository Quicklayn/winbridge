# Design: Add MVP Commands JSON Output

## Increments

1. Full session JSON output for the existing relay, host, viewer, and browser
   plan.
2. Preflight-only JSON output for doctor, native preflight, and smoke commands.
3. Bounded fail-closed parsing for duplicate or malformed `--json` usage.
4. README usage documentation for human and JSON modes.
5. OpenSpec validation and archive.

## CLI Behavior

- `--json` is a flag-only option.
- `--json` may be used alone with normal option pairs.
- `--json` may be combined with `--preflight-only`.
- `--preflight-only` remains incompatible with all value options except
  `--json`.
- `--help` remains accepted only as the sole argument.

## JSON Shape

Session mode:

```json
{
  "ok": true,
  "mode": "session",
  "nonExecuting": true,
  "commands": [
    { "name": "preflight.doctor", "command": "npm run mvp:doctor" },
    { "name": "relay", "command": "npm run dev:relay" }
  ],
  "safety": ["..."]
}
```

Preflight mode:

```json
{
  "ok": true,
  "mode": "preflight",
  "nonExecuting": true,
  "commands": [
    { "name": "preflight.doctor", "command": "npm run mvp:doctor" }
  ],
  "safety": ["..."]
}
```

## Security Rationale

The JSON renderer reuses the same validated command strings as the text
renderer. It adds no process spawning, network, filesystem, capture, or input
side effects. Output stays bounded to command strings and static notes.

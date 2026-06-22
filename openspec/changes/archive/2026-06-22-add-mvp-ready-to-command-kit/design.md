# Design: Add MVP Ready to Command Kit

## CLI Output

The generated preflight section should start with:

```powershell
npm run mvp:ready
```

Then list individual commands as troubleshooting/manual equivalents:

```powershell
npm run mvp:doctor
npm run mvp:native-preflight
npm run mvp:smoke
```

Preflight-only mode still excludes relay, host, viewer, browser, capture, and
input commands.

## JSON Output

The JSON command arrays should include:

- `preflight.ready`
- `preflight.doctor`
- `preflight.native`
- `preflight.smoke`

`preflight-only --json` must include only preflight records.

## Security Rationale

The command kit remains a pure formatter. `mvp:ready` default mode is read-only
and `mvp:smoke` remains listed as a manual preflight command rather than being
run by the command kit.

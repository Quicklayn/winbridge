## Why

The interactive host consent prompt is the host operator's last local review point before an approval or denial decision. Its runtime path already receives validated metadata, but the prompt helper should also fail closed at the rendering boundary so direct use cannot display unsafe identity, permission, or private-reason text.

## What Changes

- Validate prompt-rendered viewer peer id, optional viewer display name, requested permissions, and optional request reason inside the interactive host consent prompt helper.
- Render `unavailable` for optional display name or request reason values that fail validation instead of echoing raw unsafe text.
- Render `invalid` for malformed peer id or requested permission entries so the prompt remains bounded and avoids exposing raw values.
- Keep accepted prompt answers unchanged: only exact `approve` or `deny` are accepted before timeout.
- No new remote-control capability is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: harden interactive host consent prompt metadata rendering for direct helper use and unsafe optional values.

## Impact

- Affected code: `apps/agent-shell/src/host-consent-prompt.ts` and focused prompt tests.
- Affected behavior: host-facing development consent prompt rendering only.
- Security impact: strengthens consent-surface redaction and avoids unsafe metadata echo at the prompt boundary.
- Touch areas: auth/consent workflow and host-visible prompt text. This does not touch capture, input execution, relay routing, installer behavior, startup persistence, services, tokens, logs, privilege elevation, Windows security prompts, or native Windows APIs.
- Non-goals: screen capture, keyboard or pointer input delivery, clipboard, file transfer, diagnostics content, unattended access, stealth behavior, or production identity.

# Security Review

## Scope Reviewed

- `packages/windows-input/src/index.ts`
- `packages/windows-input/src/index.test.ts`
- `README.md`
- `docs/architecture.md`
- `docs/privacy-notice.md`
- `docs/roadmap.md`
- `docs/threat-model.md`
- `openspec/changes/add-windows-input-adapter/specs/windows-input/spec.md`

## Findings

- The adapter is package-only and is not wired into `apps/agent-shell`; the host
  runtime still does not apply inbound `input-event` messages to the OS.
- Importing the package or constructing an adapter does not invoke the runner,
  apply input, capture input, read clipboard data, install services, configure
  startup persistence, elevate privileges, evade AV/EDR, bypass Windows prompts,
  or hide host session visibility.
- Runner invocation is gated by Windows platform, active status, visible host
  session, future expiry, peer connectivity, matching authorization id, and the
  required `input:pointer` or `input:keyboard` permission.
- Protocol input parsing rejects malformed, duplicate-modifier,
  unsupported-key, macro-shaped, text-buffer-shaped, and raw-command-shaped
  payloads before native invocation.
- Runner and native-output failures are sanitized to generic messages; raw
  pointer coordinates, key values, modifiers, command output, tokens, pairing
  codes, credentials, and private data are not exposed by adapter errors.
- The default PowerShell runner uses a fixed non-interactive `SendInput` command
  path. It does not use `ExecutionPolicy`, `Bypass`, `Invoke-Expression`,
  services, startup persistence, privilege elevation, prompt bypass, clipboard,
  credential access, or key capture.

## Residual Risk / Follow-Up

- Runtime host input application remains a separate future OpenSpec change and
  must add metadata-only audit before native invocation, host controls, revoke
  behavior, visible UI, and abuse-case tests before user-facing remote control
  is available.
- The default runner is a bootstrap implementation, not a production native
  input stack; later hardening may replace it without weakening the grant gates.

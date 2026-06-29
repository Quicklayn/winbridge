## Security Review

- Scope: `mvp:ready -- --include-all-smoke` only. The flag expands to existing
  local smoke variants and does not add a new relay, capture, input,
  authorization, consent, installer, service, startup, privilege, or audit
  persistence capability.
- Consent and visibility: the underlying smoke workflows retain the existing
  explicit host approval, visible-session indicator verification, revocation
  checks, viewer disconnect checks, and cleanup behavior.
- Token handling: tokenized smoke variants reference
  `WINBRIDGE_RELAY_SHARED_TOKEN` through `--token-env`. Readiness output does
  not print token values or token environment values.
- Diagnostic containment: all smoke steps reuse the bounded smoke JSON parser.
  Human and JSON readiness output contain fixed check names, safe reasons,
  bounded smoke subcheck names, and sanitized audit summary metadata only.
- CLI ambiguity: `--include-all-smoke` rejects duplicate use, overlap with
  individual smoke flags, and role-scoped readiness before running checks.
- LAN boundary: all-smoke does not configure LAN/public relay bind settings,
  discovery, firewall rules, services, startup persistence, unattended access,
  browser automation, Windows capture, OS input application, Windows prompt
  bypass, AV/EDR evasion, keylogging, credential access, or hidden sessions.

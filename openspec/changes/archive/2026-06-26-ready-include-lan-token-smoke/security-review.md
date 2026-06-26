## Security Review

- Scope: `mvp:ready -- --include-lan-token-smoke` only. This change touches
  token/relay readiness diagnostics and does not alter production
  authentication, relay authorization, host consent, capture, input, installer,
  service, startup, privilege, or audit persistence behavior.
- Consent and visibility: no new remote capability is added. The underlying
  smoke workflow continues to use the existing explicit static host approval,
  visible-session indicator verification, revocation checks, and cleanup path.
- Token handling: readiness invokes smoke through `--token-env
  WINBRIDGE_RELAY_SHARED_TOKEN`; raw token values are not accepted by the smoke
  helper and are not printed by readiness output.
- Diagnostic containment: readiness output contains only fixed check names,
  safe reasons, bounded smoke subcheck names, and sanitized audit summary
  metadata. It does not include child command strings, child environment maps,
  relay URLs, pairing codes, stdout, stderr, child output, credentials, screen
  contents, input contents, clipboard contents, or full secrets.
- LAN boundary: `--lan-relay` remains the reviewed same-machine LAN-style smoke
  path. This change does not configure LAN/public relay bind settings,
  discovery, firewall rules, services, startup persistence, unattended access,
  browser automation, Windows capture, OS input application, Windows prompt
  bypass, AV/EDR evasion, or hidden sessions.
- Failure behavior: role-scoped readiness rejects `--include-lan-token-smoke`
  before running checks, and default readiness stops on the first failed check
  with bounded fixed metadata.

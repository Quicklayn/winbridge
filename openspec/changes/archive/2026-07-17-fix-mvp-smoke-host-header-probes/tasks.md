## 1. Direct Host Header Probe

- [x] 1.1 Add fixed viewer-status and host-control direct HTTP probes that revalidate loopback surface URLs, preserve the exact mismatched `Host` wire value, follow no redirects, and bound absolute wall-clock time, response bytes, parsing, abort, and cleanup.
- [x] 1.2 Wire only the two mismatched-Host checks to one-shot sequential direct probes, abort them through smoke cleanup, and retain the existing fetch path for readiness, token, origin, content-type, input, lifecycle, and disconnect requests.

## 2. Regression Coverage

- [x] 2.1 Update focused guard aggregation tests for injected fixed probes, one-shot accepted responses, exact bounded rejection shape, invalid URLs, errors, absolute slow-drip timeout, abort, oversized bodies, server errors, and secret-safe failure output.
- [x] 2.2 Add raw loopback HTTP tests proving the live server receives the exact fixed mismatched `Host`, method, path, origin, token, and body and that accepted probes never count as guarded or trigger a second pause request.

## 3. Documentation And Verification

- [x] 3.1 Update README and security-model documentation for the fixed direct loopback Host guard probe boundary and its development-only scope.
- [x] 3.2 Run a security review of loopback restriction, fixed request construction, mutation-token handling, timeout/body bounds, socket cleanup, redirects, response parsing, and diagnostic redaction; resolve blocking findings.
- [x] 3.3 Run focused smoke tests and the default `npm run mvp:smoke -- --json` workflow without native capture or input; confirm `host-surface` and `surface-guards` pass and record any independent downstream failure as a separate change.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.5 Run strict change validation, sync delta specs, and archive the completed OpenSpec change.

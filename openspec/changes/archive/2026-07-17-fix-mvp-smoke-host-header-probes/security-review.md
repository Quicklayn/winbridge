# Security Review

## Scope

Reviewed the direct HTTP boundary used only by the fixed viewer `/status` and
host `/control` mismatched-`Host` probes in the local MVP smoke verifier,
including focused tests, documentation, and OpenSpec artifacts.

## Findings

No blocking findings.

- The transport revalidates an uncredentialed canonical
  `http://127.0.0.1:<non-privileged-port>/` URL and constructs the connection
  from literal IPv4 loopback plus the validated port.
- Methods, paths, headers, mismatched Host value, and host pause body are fixed;
  the host mutation token is bounded before a request can open.
- Redirects, proxies, arbitrary destinations, and connection reuse are not
  supported.
- A 500 ms absolute wall-clock deadline, 4 KiB response-header limit, 1 KiB
  response-body limit, cleanup abort, and one-shot settlement bound transport
  lifetime and release request and response objects on unsafe outcomes.
- Only a 4xx response with exact JSON `{ "ok": false, "error": "rejected" }`
  counts as guarded. Accepted, redirected, malformed, oversized, aborted,
  prematurely closed, timed-out, and server-error responses fail closed.
- The host mutation probe runs first and exactly once. An accepted or otherwise
  unsafe response stops the guard set without retrying pause or running later
  mutation probes.
- Smoke diagnostics retain fixed allowlisted failure reasons and do not expose
  local endpoints, Host values, tokens, bodies, child output, or raw transport
  errors.

## Safety Invariants

The change does not alter host consent, visible-session state, permission
revocation, disconnect controls, product HTTP surfaces, relay behavior,
capture, input application, startup, installation, services, persistence, or
privilege behavior. No hidden or unattended path was introduced.

## Residual Risks

- Raw loopback transport behavior and one-shot aggregation are covered by
  separate focused tests rather than one combined accepted-response test.
- Header overflow and premature response close rely on the configured Node HTTP
  parser bound and shared error/close handling; body overflow, timeout,
  slow-drip, and explicit abort have direct tests.
- Signal cleanup and direct-probe abort are covered independently rather than
  by an integration test that delivers a process signal during an active raw
  probe.

These are non-blocking test-depth gaps. The implementation fails closed for all
three cases and does not widen authorization or network reachability.

## Verification

- Focused smoke tests: 55 passed.
- Strict OpenSpec change validation: passed.
- Native capture and input were not invoked by the review.

## OpenSpec Impact

The delta requirements match the reviewed implementation. No additional
capability or requirement change is required.

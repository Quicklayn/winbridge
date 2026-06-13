## Context

The non-native agent shell can ask the host operator to approve or deny a received authorization request. Existing prompt-mode behavior accepts only exact `approve` or `deny`, fails closed for invalid/cancel/error, and skips stale decisions after viewer disconnect. However, there is no upper bound for how long the prompt may wait.

## Goals / Non-Goals

**Goals:**

- Bound interactive host consent waiting with a safe positive integer timeout.
- Default prompt-mode hosts to a bounded timeout even when the CLI option is omitted.
- Let automation/tests configure a shorter timeout through CLI/runtime options.
- Ensure timeout produces no authorization decision, no active visible state, no lifecycle workflow messages, no signals, and no workflow audit messages for the request.
- Keep timeout logs and runtime diagnostics secret-safe.

**Non-Goals:**

- No production identity, MFA, account trust, or authorization policy changes.
- No remote screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, service, startup, privilege elevation, or Windows prompt behavior.
- No protocol message schema changes.

## Decisions

- Add `hostConsentTimeoutMs` as a runtime option and `--host-consent-timeout-ms` as a CLI option.
- Require timeout values to be exact positive integers from `1` through the existing safe timer delay bound (`2147483647`).
- Require CLI timeout values to be used only with `--host-consent-prompt true`; this avoids silently accepting unused consent policy knobs.
- Apply a default timeout of `60000` milliseconds when prompt mode is enabled and no explicit timeout is provided.
- Enforce timeout at the runtime provider boundary so custom providers cannot hang the consent workflow indefinitely, and also pass the timeout to the built-in readline prompt so the prompt aborts and releases local resources.

## Risks / Trade-offs

- A slow host operator may miss the default window. Mitigation: the timeout is configurable and fail-closed; the viewer can make a fresh request in later workflow iterations.
- Custom providers that continue doing work after timeout may resolve later. Mitigation: runtime ignores late provider resolution by racing the provider result against the timeout before any authorization send.
- The timeout option adds another CLI/runtime validation path. Mitigation: reuse existing timer bounds and add focused tests plus full repo verification.

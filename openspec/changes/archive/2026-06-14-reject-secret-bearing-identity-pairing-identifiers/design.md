## Context

Identity and pairing records are trusted local metadata used by the protocol package and the development relay. Device identity display names already reject secret-bearing text, and relay audit attribution redacts suspicious ids, but identity and pairing machine identifiers still rely mostly on the generic printable protocol identifier shape.

Pairing tickets retain `sessionId`, `pairingId`, and `hostDeviceId` in memory, paired-device records retain host and viewer device ids, and relay join audit may summarize device id metadata. Those identifiers must therefore be denied before they become trusted pairing metadata when they contain token, credential, pairing-code, authorization-header, cookie, private-key, SSH-key, or similar marker families.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing identifiers in device identity, pairing ticket, and paired-device schemas before trusted metadata creation.
- Keep rejection diagnostics generic and bounded so raw rejected identifiers are not exposed.
- Preserve safe development ids such as `dev_host_1`, `dev_viewer_1`, `pair-demo`, and UUID-derived ids.
- Prove direct protocol/identity rejection and relay join rejection before registration, pairing ticket creation or consumption, accepted join audit, or denied join audit.

**Non-Goals:**

- No production account authentication or durable device trust model.
- No change to pairing code format, salted hash construction, ticket TTL, ticket max-use semantics, or relay room size.
- No capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, privilege, or native Windows behavior.
- No widening of session authorization, host consent, or remote action permissions.

## Decisions

- Add a shared identity/pairing identifier schema in `packages/protocol/src/identity.ts`.
  - Rationale: device identity, pairing ticket, and paired-device records all live in the identity module and should fail consistently before callers receive trusted snapshots.
  - Alternative considered: rely on relay audit redaction only. Rejected because redaction is too late for in-memory pairing records and direct protocol consumers.
- Apply the check to `deviceId`, pairing ticket `pairingId`, ticket `sessionId`, ticket `hostDeviceId`, paired-device `pairingId`, paired-device `sessionId`, paired-device `hostDeviceId`, and paired-device `viewerDeviceId`.
  - Rationale: every one of these fields is machine metadata that can be retained or summarized as identity/pairing state.
  - Alternative considered: only reject `deviceId`. Rejected because direct pairing factory calls could still retain secret-bearing session or pairing ids.
- Keep the relay rejection path generic for malformed join envelopes.
  - Rationale: direct clients sending secret-bearing identity ids should fail before registration and before join-denial attribution that might otherwise include parsed metadata.

## Risks / Trade-offs

- [Risk] Existing local test clients may have used marker words such as `token` in development device ids.
  - Mitigation: safe ids remain accepted; only secret-bearing marker families are denied.
- [Risk] Tightening `sessionId` in pairing ticket factories is stricter than generic protocol `sessionId` parsing.
  - Mitigation: this applies only where session ids become identity/pairing records; generic protocol compatibility remains unchanged for non-pairing metadata.
- [Risk] Relay behavior changes from redacting secret-bearing device ids in accepted/denied join audit to rejecting them earlier.
  - Mitigation: failing before registration is safer and matches the goal that secret-bearing identity ids never become trusted pairing metadata.

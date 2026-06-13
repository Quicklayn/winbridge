## Context

The relay accepted join audit path projects `deviceIdentity` metadata after a successful join. The projection intentionally omits display names and protocol payloads, but currently includes `deviceId` without checking whether it embeds the submitted pairing code.

`deviceId` is schema-validated but still self-reported. Because protocol identifiers allow digits and hyphens, a valid device id can contain a valid pairing code. Accepted audit detail must therefore treat device id as safe only after a pairing-code containment check.

## Goals / Non-Goals

**Goals:**

- Prevent accepted join audit records from containing raw pairing codes through `deviceIdentity.deviceId`.
- Preserve useful bounded identity attribution for accepted host and viewer joins.
- Keep existing pairing, registration, authorization, consent, and forwarding behavior unchanged.

**Non-Goals:**

- No production device trust, authentication, attestation, or policy decisions.
- No changes to host consent, session authorization, capture, input, clipboard, file transfer, diagnostics, reconnect, or native Windows APIs.
- No logging of raw display names.

## Decisions

- Change the accepted join identity projection to accept the submitted pairing code and return a redacted projection when `deviceId` contains that code.
- Use the same bounded redaction fields as denied join attribution: `deviceIdRedacted` and `deviceIdLength`.
- Keep the detail key as `deviceIdentity` for accepted joins so downstream audit consumers retain the accepted/attempted distinction.

## Risks / Trade-offs

- Some accepted joins will lose raw device id attribution -> Mitigation: retain platform, trust level, created timestamp, and id length metadata.
- The accepted and denied projection types become similar but not identical -> Mitigation: keep small local helper types and focused tests for both safe and redacted accepted paths.

## Context

WinBridge uses protocol schemas to reject malformed authorization lifecycle messages before peers process them. `PermissionRevokedMessageSchema` already requires a reason, and the main spec says the corresponding `session-control` revoke workflow control identifies the actor, affected permission, authorization id, and reason. The current `SessionControlMessageSchema` validates `reason` only when present, so a revoke control can omit it.

## Goals / Non-Goals

**Goals:**

- Require explicit non-blank reasons on `session-control` messages whose action is `revoke-permission`.
- Preserve existing action-specific permission validation.
- Preserve optional reasons for `pause`, `resume`, and `terminate` controls.
- Keep the change local to protocol validation and protocol tests.

**Non-Goals:**

- No new remote action permission or grant semantics.
- No screen capture, input capture, keyboard logging, clipboard, file transfer, or diagnostics capability.
- No relay, auth token, audit persistence, installer, startup, service, privilege, or native Windows API changes.
- No attempt to classify or redact reason text beyond existing protocol reason validation.

## Decisions

- Enforce the missing-reason check inside `SessionControlMessageSchema.superRefine`.
  - Rationale: existing action-specific validation already lives there, so this keeps all revoke payload invariants together.
  - Alternative considered: split `session-control` into a discriminated union per action. That would be more explicit, but larger and unnecessary for this narrow hardening change.

- Keep `reason: ProtocolReasonSchema.optional()` in the base schema and add an action-specific required check for revoke.
  - Rationale: `pause`, `resume`, and `terminate` remain valid without a reason while any present reason still uses the shared non-blank validator.
  - Alternative considered: make all session-control reasons required. That would be broader than the spec gap and could break lifecycle controls that do not require a reason.

- Add tests for both sides of the contract.
  - Rationale: one test should prove revoke without reason is rejected, and another should prove non-revoke controls can still omit reason.

## Risks / Trade-offs

- Existing development peers that omit revoke reasons will fail validation -> document as a breaking protocol contract tightening and keep error text specific.
- Duplicated validation for `permission` and `reason` can produce multiple issues on malformed revoke controls -> focused tests assert the intended reason-specific failure without relying on issue ordering.
- Free-form reason text can include private detail -> existing audit redaction rules cover private reason detail fields, and this change does not add logging of reason text.

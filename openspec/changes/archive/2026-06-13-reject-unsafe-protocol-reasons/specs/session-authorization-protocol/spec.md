## MODIFIED Requirements

### Requirement: Legacy host consent message permission-scope invariants
The protocol SHALL reject malformed legacy `host-consent-required` and `host-consent-decision` messages that carry empty, duplicate, or fail-open permission scopes, and legacy consent request viewer display names SHALL be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls. Legacy denial reason text SHALL also reject ASCII control characters and Unicode bidirectional or zero-width formatting controls including `U+FEFF`.

#### Scenario: Legacy consent request lacks permissions
- **WHEN** a `host-consent-required` message has no requested permissions
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Legacy consent request includes duplicate permissions
- **WHEN** a `host-consent-required` message includes duplicate requested permissions
- **THEN** the protocol schema rejects the message so requested scope remains unambiguous

#### Scenario: Legacy consent request display name is blank
- **WHEN** a `host-consent-required` message has an empty or whitespace-only `viewerDisplayName`
- **THEN** the protocol schema rejects the message before consent UI can rely on blank viewer metadata

#### Scenario: Legacy consent request display name is untrimmed
- **WHEN** a `host-consent-required` message has a `viewerDisplayName` with leading or trailing whitespace
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Legacy consent request display name contains ASCII control characters
- **WHEN** a `host-consent-required` message has a `viewerDisplayName` that contains an ASCII control character
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Legacy consent request display name contains Unicode formatting controls
- **WHEN** a `host-consent-required` message has a `viewerDisplayName` that contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Rejected legacy display name grants no access
- **WHEN** a legacy consent request display name is rejected
- **THEN** the message MUST NOT approve authorization, activate host visibility, grant permissions, start capture, send input, reconnect a peer, or bypass consent workflows

#### Scenario: Legacy consent approval lacks grants
- **WHEN** a `host-consent-decision` message is approved but has no granted permissions
- **THEN** the protocol schema rejects the message because approval must carry a non-empty grant scope

#### Scenario: Legacy consent approval includes duplicate grants
- **WHEN** a `host-consent-decision` message is approved with duplicate granted permissions
- **THEN** the protocol schema rejects the message so granted scope remains unambiguous

#### Scenario: Legacy consent denial carries grants
- **WHEN** a `host-consent-decision` message is denied but includes granted permissions
- **THEN** the protocol schema rejects the message and preserves deny-by-default behavior

#### Scenario: Legacy consent denial lacks reason
- **WHEN** a `host-consent-decision` message is denied without a reason
- **THEN** the protocol schema rejects the message so denial remains explicit and auditable

#### Scenario: Legacy consent denial has blank reason
- **WHEN** a `host-consent-decision` message is denied with a whitespace-only reason
- **THEN** the protocol schema rejects the message so denial remains explicit and auditable

#### Scenario: Legacy consent denial has untrimmed reason
- **WHEN** a `host-consent-decision` message is denied with a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Legacy consent denial has unsafe reason characters
- **WHEN** a `host-consent-decision` denial reason contains an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

### Requirement: Session control action payload invariants
The protocol SHALL reject malformed `session-control` messages whose action-specific payload, authorization binding, or reason text is ambiguous, unauditable, or fail-open. Session-control reason text SHALL reject ASCII control characters and Unicode bidirectional or zero-width formatting controls including `U+FEFF`.

#### Scenario: Control includes authorization id
- **WHEN** a `session-control` message includes an authorization id and otherwise valid action-specific payload
- **THEN** the protocol schema accepts the message as control intent for that authorization

#### Scenario: Control omits authorization id
- **WHEN** a `session-control` message omits `authorizationId`
- **THEN** the protocol schema rejects the message before peers can process ambiguous lifecycle intent

#### Scenario: Revoke-permission control includes permission and reason
- **WHEN** a `session-control` message has action `revoke-permission`, includes `authorizationId`, includes a permission, and includes a non-blank already trimmed reason with no unsafe control or formatting characters
- **THEN** the protocol schema accepts the message as permission-revocation intent for that authorization

#### Scenario: Revoke-permission control lacks permission
- **WHEN** a `session-control` message has action `revoke-permission` and omits permission
- **THEN** the protocol schema rejects the message before peers can process ambiguous revocation intent

#### Scenario: Revoke-permission control lacks reason
- **WHEN** a `session-control` message has action `revoke-permission` and omits reason
- **THEN** the protocol schema rejects the message before peers can process unauditable revocation intent

#### Scenario: Pause control includes permission
- **WHEN** a `session-control` message has action `pause` and includes permission
- **THEN** the protocol schema rejects the message so pause cannot be confused with permission revocation or grant scope

#### Scenario: Resume control includes permission
- **WHEN** a `session-control` message has action `resume` and includes permission
- **THEN** the protocol schema rejects the message so resume cannot be confused with a permission grant

#### Scenario: Terminate control includes permission
- **WHEN** a `session-control` message has action `terminate` and includes permission
- **THEN** the protocol schema rejects the message because termination applies to the session rather than a single permission

#### Scenario: Control reason is blank
- **WHEN** a `session-control` message includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so optional reasons remain explicit and auditable

#### Scenario: Control reason is untrimmed
- **WHEN** a `session-control` message includes a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message before peers can process ambiguous lifecycle metadata

#### Scenario: Control reason contains unsafe characters
- **WHEN** a `session-control` message includes a reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before peers can process ambiguous lifecycle metadata

### Requirement: Canonical authorization protocol reasons
The protocol SHALL reject authorization-related messages that include blank, whitespace-only, oversized, untrimmed, ASCII control-character, or Unicode bidirectional or zero-width formatting-control reason text, including `U+FEFF`. Rejection MUST occur before forwarding, trusted runtime event emission, or workflow processing, and diagnostics MUST NOT expose raw private reason text.

#### Scenario: Authorization request reason is blank
- **WHEN** a `session-authorization-request` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Authorization request reason is untrimmed
- **WHEN** a `session-authorization-request` includes a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Authorization request reason contains unsafe characters
- **WHEN** a `session-authorization-request` includes a reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Authorization denial reason is blank
- **WHEN** a denied `session-authorization-decision` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so denial remains explicit and auditable

#### Scenario: Authorization denial reason is untrimmed
- **WHEN** a denied `session-authorization-decision` includes a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message so denial metadata remains canonical

#### Scenario: Authorization denial reason contains unsafe characters
- **WHEN** a denied `session-authorization-decision` includes a reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message so denial metadata remains canonical

#### Scenario: Authorization state reason is blank
- **WHEN** a `session-authorization-state` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message before peers can record meaningless lifecycle metadata

#### Scenario: Authorization state reason is untrimmed
- **WHEN** a `session-authorization-state` includes a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message before peers can record ambiguous lifecycle metadata

#### Scenario: Authorization state reason contains unsafe characters
- **WHEN** a `session-authorization-state` includes a reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before peers can record ambiguous lifecycle metadata

#### Scenario: Permission revoked reason is blank
- **WHEN** a `permission-revoked` message includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so revocation remains explicit and auditable

#### Scenario: Permission revoked reason is untrimmed
- **WHEN** a `permission-revoked` message includes a reason containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message so revocation metadata remains canonical

#### Scenario: Permission revoked reason contains unsafe characters
- **WHEN** a `permission-revoked` message includes a reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message so revocation metadata remains canonical

#### Scenario: Protocol reason rejection is fail-closed and secret-safe
- **WHEN** protocol reason validation rejects a malformed authorization-related message
- **THEN** the rejection MUST NOT approve authorization, activate host visibility, grant permissions, start capture, send input, reconnect a peer, suppress visibility, or bypass consent workflows
- **AND** diagnostics MUST NOT expose raw private reason text

#### Scenario: Optional authorization reason is omitted
- **WHEN** an authorization-related protocol message omits an optional reason
- **THEN** the protocol schema accepts the message when all other required fields are valid

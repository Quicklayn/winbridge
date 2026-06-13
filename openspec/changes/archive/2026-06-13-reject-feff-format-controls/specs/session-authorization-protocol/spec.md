## MODIFIED Requirements

### Requirement: Legacy host consent message permission-scope invariants
The protocol SHALL reject malformed legacy `host-consent-required` and `host-consent-decision` messages that carry empty, duplicate, or fail-open permission scopes, and legacy consent request viewer display names SHALL be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls.

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

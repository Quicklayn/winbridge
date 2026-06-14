## ADDED Requirements

### Requirement: Host consent prompt receives viewer device identity context
The agent shell SHALL pass bounded viewer device identity context to an interactive host consent provider when the host has observed a trusted opposite-role viewer `hello` for the authorization requester and that `hello` includes schema-valid `deviceIdentity`. The provider request MUST include only optional viewer device id and platform metadata. The provider request MUST NOT include remote self-asserted device trust-level metadata. This context MUST remain non-authorizing and MUST NOT grant permissions, approve authorization, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, emit workflow audit events by itself, or bypass consent workflows.

#### Scenario: Provider receives trusted viewer device metadata
- **WHEN** a host runtime receives a valid opposite-role viewer `hello` with matching schema-valid `deviceIdentity` before receiving that viewer's `session-authorization-request`
- **THEN** the interactive host decision provider request includes the viewer device id and platform
- **AND** the provider still requires an explicit approve or deny decision before any authorization decision is sent

#### Scenario: Provider suppresses self-asserted trust level
- **WHEN** a host runtime receives a valid opposite-role viewer `hello` whose schema-valid `deviceIdentity.trustLevel` is `verified`
- **THEN** the interactive host decision provider request MUST NOT include that remote self-asserted trust level
- **AND** trust-level suppression MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Provider omits unavailable viewer device metadata
- **WHEN** the host runtime has not observed a trusted viewer `hello` with schema-valid device identity for the requesting viewer
- **THEN** the interactive host decision provider request omits viewer device identity fields
- **AND** omission MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Stale viewer device metadata is not reused
- **WHEN** the host runtime has observed device identity for a different peer or a peer that has disconnected
- **THEN** a later authorization request MUST NOT receive stale viewer device identity metadata from the prior peer scope

### Requirement: Host consent prompt renders viewer device identity safely
The interactive host consent prompt SHALL render optional viewer device id and platform metadata when the direct prompt request contains safe bounded values. Missing or unsafe optional viewer device metadata MUST render as `unavailable` without echoing raw values. The prompt MUST NOT render remote self-asserted trust-level metadata as verified trust context. Rendering viewer device metadata MUST NOT grant permissions, approve authorization, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, emit workflow audit events, or bypass consent workflows.

#### Scenario: Prompt renders safe viewer device metadata
- **WHEN** the host consent prompt receives safe viewer device id and platform values
- **THEN** it prints bounded viewer device identity context before accepting the host's exact `approve` or `deny` response

#### Scenario: Prompt omits self-asserted trust level
- **WHEN** direct prompt caller input includes viewer trust-level metadata such as `verified`
- **THEN** the prompt does not print that value as viewer device trust context
- **AND** omission MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Prompt suppresses unsafe viewer device metadata
- **WHEN** direct prompt caller input includes malformed, untrimmed, control-character, Unicode formatting-control, unknown, or secret-bearing viewer device metadata
- **THEN** the prompt prints `unavailable` for that optional device metadata
- **AND** prompt output MUST NOT expose raw unsafe device ids, raw unsafe platform text, pairing codes, tokens, credentials, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Device metadata remains prompt-only context
- **WHEN** host consent prompt rendering starts, succeeds, times out, receives invalid input, or fails closed
- **THEN** viewer device identity metadata MUST NOT by itself send authorization decisions, emit workflow audit events, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

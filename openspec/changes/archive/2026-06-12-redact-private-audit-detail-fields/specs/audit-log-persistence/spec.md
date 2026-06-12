## ADDED Requirements

### Requirement: File sink private metadata redaction
The file audit sink SHALL apply shared audit redaction for raw display-name and private reason detail fields before appending JSONL records.

#### Scenario: Display-name and private reason detail is written
- **WHEN** a file audit sink writes a record whose detail contains raw display-name or private reason fields
- **THEN** the persisted JSON line contains redacted placeholders instead of those raw values

#### Scenario: Safe reason metadata is written
- **WHEN** a file audit sink writes a record whose detail contains safe metadata such as `reasonCode`, `reasonConfigured`, or `authorizationId`
- **THEN** the persisted JSON line preserves those metadata values unless another sensitive key rule applies

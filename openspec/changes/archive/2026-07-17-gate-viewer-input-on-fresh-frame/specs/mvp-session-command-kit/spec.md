## ADDED Requirements

### Requirement: MVP smoke input is bound to a live frame generation

Before the root MVP smoke check posts its bounded pointer and keyboard commands
to the token-protected loopback viewer `/input` path, it SHALL read the live
`/frame` endpoint, validate a bounded supported frame response, and require one
exact bounded opaque frame generation from the successful response metadata. It
MUST carry that same generation in its pointer request and matching keyboard
down/up requests. Before the later pointer lifecycle-denial input probe, it
SHALL first confirm explicit pointer-permission revocation from sanitized viewer
status and accepted host audit evidence, then obtain and validate the current
served generation again. Missing, malformed, oversized, or failed frame or
generation evidence MUST fail closed using existing bounded smoke reason codes.

The smoke helper MUST NOT print or return the generation, frame bytes, response
headers or bodies, local URLs, ports, mutation tokens, commands, pointer
coordinates, key values, modifiers, authorization ids, paths, audit contents,
child output, credentials, private reasons, screen contents, input contents,
diagnostics, or full secrets.

#### Scenario: Happy-path smoke input uses one live generation

- **WHEN** the smoke workflow reaches input readiness with a live stable frame
  and the `/frame` response carries one valid opaque generation
- **THEN** the helper sends its bounded pointer and keyboard commands with that
  same generation through the existing token-protected `/input` path, including
  one matching key-up after its key-down
- **AND** input verification still depends on the existing bounded accepted
  response shapes and runtime authorization behavior

#### Scenario: Invalid frame generation fails the input subcheck closed

- **WHEN** the frame request fails or its generation metadata is missing,
  malformed, duplicated, or oversized
- **THEN** the smoke workflow does not post happy-path input and fails with the
  existing bounded `input-not-ready` reason
- **AND** diagnostics do not expose frame or generation metadata, commands,
  tokens, URLs, child output, input contents, or private data

#### Scenario: Lifecycle denial uses the current live generation

- **WHEN** happy-path input has passed and host lifecycle behavior removes input
  authorization
- **THEN** the smoke helper first observes sanitized status with pointer input
  disabled and matching accepted host revoke audit evidence, then obtains a
  current valid served frame generation before its bounded pointer denial
  request and accepts only the existing `not-ready` denial shape
- **AND** it does not treat a missing or malformed generation as proof that
  lifecycle authorization was revoked, and it does not treat stale or
  superseded generation rejection alone as proof of revocation

#### Scenario: Native smoke never leaves its bounded key held

- **WHEN** explicit `--windows-input` smoke reaches the keyboard input subcheck
- **THEN** it sends and confirms a matching key-up after its accepted key-down
  before waiting for lifecycle revocation or requesting disconnect
- **AND** a missing or rejected matching release fails the input subcheck closed

#### Scenario: Generation-bound smoke remains non-native by default

- **WHEN** the default local smoke workflow reads generation metadata and posts
  its existing static pointer and keyboard commands
- **THEN** it does not enable Windows capture or apply OS input unless the
  separate existing explicit native smoke flags were provided
- **AND** it does not launch a browser, install persistence, elevate privileges,
  hide host visibility, bypass consent, or run unattended

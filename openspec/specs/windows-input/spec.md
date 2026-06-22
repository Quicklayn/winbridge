# windows-input Specification

## Purpose
Define the consent-bound Windows native input adapter boundary used by future
host-control runtime wiring.

## Requirements
### Requirement: Windows input adapter applies only consent-bound input events

The Windows input adapter SHALL expose an explicit adapter method for applying
one protocol-supported remote input event through a native runner. The adapter
MUST invoke the runner only on Windows after validating an active visible
unexpired grant, peer connectivity, matching authorization id, and the required
input permission for the event kind. The adapter MUST NOT run native input at
import time or construction time.

#### Scenario: Adapter applies authorized pointer input
- **WHEN** the adapter receives a pointer input event whose authorization id matches an active visible unexpired connected grant with `input:pointer`
- **THEN** it invokes the runner once with bounded pointer metadata derived from the protocol event
- **AND** it MUST NOT capture input, read clipboard data, collect credentials, start services, configure startup persistence, elevate privileges, evade AV/EDR, bypass Windows prompts, or hide host session visibility

#### Scenario: Adapter applies authorized keyboard input
- **WHEN** the adapter receives a keyboard input event whose authorization id matches an active visible unexpired connected grant with `input:keyboard`
- **THEN** it invokes the runner once with bounded keyboard metadata derived from the protocol event
- **AND** it MUST NOT capture keystrokes, buffer text, keylog, read clipboard data, collect credentials, start services, configure startup persistence, elevate privileges, evade AV/EDR, bypass Windows prompts, or hide host session visibility

#### Scenario: Adapter lacks authorization
- **WHEN** the adapter receives input while the grant is inactive, invisible, expired, disconnected, missing, mismatched by authorization id, or missing the required input permission
- **THEN** it rejects before invoking the native runner, injecting input, emitting trusted success metadata, collecting diagnostics, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Adapter is not on Windows
- **WHEN** the adapter is used on a non-Windows platform
- **THEN** it rejects before invoking the native runner or producing input side effects

#### Scenario: Adapter receives malformed input
- **WHEN** the adapter receives malformed, unsupported, oversized, keylogging-buffer-shaped, macro-shaped, text-buffer-shaped, or raw-command-shaped input
- **THEN** it rejects before invoking the native runner, injecting input, collecting diagnostics, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Native runner fails
- **WHEN** the native runner fails or returns malformed output
- **THEN** the adapter reports only bounded generic failure metadata
- **AND** diagnostics MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Adapter construction has no input side effects
- **WHEN** code imports the package or constructs an adapter
- **THEN** it MUST NOT invoke the native runner, inject input, capture input, read clipboard data, install services, configure startup persistence, elevate privileges, evade AV/EDR, bypass Windows prompts, or hide host session visibility

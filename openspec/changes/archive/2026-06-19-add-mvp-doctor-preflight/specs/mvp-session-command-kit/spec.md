## ADDED Requirements

### Requirement: MVP doctor validates local readiness without side effects

The project SHALL provide a root development doctor command that checks whether
the current local machine satisfies basic MVP trial prerequisites before the
developer starts relay, host, viewer, capture, or input commands. The doctor
SHALL verify Windows platform, supported Node.js version, required root npm
scripts, and required workspace package manifests. The doctor MUST report only
bounded readiness metadata and fixed failure reason codes.

#### Scenario: Doctor passes on a ready Windows development machine

- **WHEN** a developer runs the root MVP doctor on a Windows machine with a
  supported Node.js version and required project scripts/manifests
- **THEN** it exits successfully with bounded readiness lines
- **AND** it MUST NOT start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access, or
  privileged actions

#### Scenario: Doctor fails closed for missing prerequisites

- **WHEN** the platform is not Windows, Node.js is unsupported, a required root
  script is missing, or a required workspace package manifest is missing
- **THEN** the doctor exits non-zero with one fixed reason code
- **AND** diagnostics MUST NOT expose raw filesystem paths, environment values,
  tokens, pairing codes, credentials, private reasons, command output, screen
  contents, input contents, clipboard contents, file-transfer contents, or
  diagnostics dumps

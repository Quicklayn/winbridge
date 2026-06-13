## ADDED Requirements

### Requirement: GitHub CI uses least-privilege bounded jobs
The repository SHALL run verification-only GitHub Actions jobs with explicit read-only repository contents permissions and an explicit job timeout. These workflow hardening controls MUST NOT change the verified Node runtime matrix or skip install, typecheck, tests, build, or strict OpenSpec validation.

#### Scenario: CI declares read-only repository permissions
- **WHEN** GitHub Actions runs the verification workflow
- **THEN** the workflow requests only read access to repository contents
- **AND** the workflow does not request write-capable repository permissions

#### Scenario: CI jobs are timeout bounded
- **WHEN** GitHub Actions runs each Windows Node matrix verification job
- **THEN** the job has an explicit timeout
- **AND** the job still runs install, typecheck, tests, build, and strict OpenSpec validation

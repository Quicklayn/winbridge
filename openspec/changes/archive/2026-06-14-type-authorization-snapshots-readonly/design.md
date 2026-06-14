# Design: Read-only authorization snapshot types

## Overview
The protocol package already returns frozen `SessionAuthorization` records from lifecycle constructors, transitions, expiration checks, and successful action authorization checks. It also returns frozen consent-bound grants from `assertConsentBoundGrant()`. The type surface should document these as immutable snapshots without making caller input builders cumbersome.

## Approach
- Keep private schema-inferred mutable field types for parsing and constructing records.
- Export `SessionAuthorization` as a read-only snapshot type with a read-only permission list.
- Export `SessionGrant` as a read-only snapshot type with read-only fields and permission list.
- Keep `parsePermissionList()` returning mutable arrays for local construction paths.
- Cast validated frozen outputs to the exported read-only snapshot types at the return boundary.
- Update tests with local mutable helper types only where mutation attempts are under test.

## Security Rationale
Authorization records and grants are the core consent boundary. Type-level immutability reduces the chance that future code treats returned snapshots as mutable state and accidentally widens permissions, hides host visibility, or disables consent-bound flags.

## Compatibility
This is a TypeScript compile-time hardening change. Runtime object shapes, JSON serialization, Zod validation, authorization transitions, permission parsing, and grant validation remain unchanged. Callers that intentionally need mutable data should copy returned snapshots into local builder objects.

## Alternatives Considered
- Make all schema parse outputs read-only: rejected for this increment because Zod schema inputs and construction tests still benefit from mutable builder objects.
- Add wrapper snapshot objects: rejected because it would change the public shape and create unnecessary migration cost.

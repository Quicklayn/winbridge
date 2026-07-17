## Context

The smoke verifier keeps two action maps. The global bounded-summary map already
classifies `agent-shell.session.disconnected` as `disconnectObserved`, and the
host strict-role map accepts it for local host disconnect. The viewer strict
map omits the same canonical action even though `runtime.leave()` persists it
to the viewer-local audit sink. As a result, the visible summary boolean is true
but the non-enumerable strict evidence flag remains false.

The smoke workflow supplies distinct host and viewer audit paths that are
created for the corresponding local processes. Existing strict readiness is
therefore role-local by configured file and accepted action mapping; this change
does not redesign audit provenance or record schemas.

## Goals / Non-Goals

**Goals:**

- Align strict viewer disconnect readiness with the canonical local viewer
  leave record emitted by the runtime.
- Preserve accepted-outcome, role-local file, complete-evidence, size, parsing,
  output-redaction, and fail-closed behavior.
- Keep compatibility with existing viewer disconnect requested/sent evidence.
- Unblock the audit stage of the exact default non-native MVP smoke workflow.

**Non-Goals:**

- Changing viewer leave or host disconnect runtime behavior.
- Accepting arbitrary lifecycle or host-only actions as viewer evidence.
- Relaxing required frame output, input send, host consent, visibility,
  permission revoke, or host disconnect evidence.
- Changing audit record schemas, paths, relay traffic, protocol messages,
  native capture/input, installation, persistence, services, or privileges.

## Decisions

### 1. Add the canonical action only to the strict viewer map

`REQUIRED_SMOKE_AUDIT_ACTIONS_BY_ROLE.viewer` will map accepted
`agent-shell.session.disconnected` to `disconnectObserved`. The host mapping and
the global summary map already contain this action and remain unchanged.

This is preferable to rewriting viewer audit records or adding a second runtime
action because one local lifecycle event should have one canonical audit
representation.

### 2. Preserve all existing strict gates

The mapping remains behind the existing `outcome === "accepted"` check and is
evaluated only while summarizing the configured viewer-local audit file. Denied
or failed canonical records do not satisfy readiness. A canonical record found
only in the host file does not fill the viewer file's strict evidence flags.
All other required role flags must still pass.

### 3. Keep legacy viewer disconnect mappings

The requested/sent mappings remain accepted for compatibility with explicit
viewer disconnect workflows and fixtures. The canonical local-leave mapping is
additive and does not broaden any other evidence category.

### 4. Test the strict map rather than only the public summary boolean

Focused tests will use complete role-local fixtures to prove canonical viewer
leave passes readiness, and isolated denied/missing/wrong-role cases to prove
the strict evidence gate still fails. Output assertions continue to reject raw
action strings, paths, identifiers, and record detail.

## Risks / Trade-offs

- **The same canonical action is valid for host and viewer local disconnect.**
  -> Role-specific maps are applied to separate configured local audit files;
  no cross-file aggregation is introduced.
- **A mapping change could accidentally accept denied evidence.** -> The shared
  accepted-outcome gate remains unchanged and gets explicit regression coverage.
- **Legacy actions could drift later.** -> Keep them for compatibility while the
  default smoke directly exercises the canonical local-leave path.
- **The next smoke stage may reveal another independent blocker.** -> Run the
  exact default smoke after focused tests and scope any unrelated finding to a
  separate OpenSpec change.

## Migration Plan

1. Add the strict viewer map entry and focused regression tests.
2. Run focused smoke tests and the exact default MVP smoke command.
3. Run repository verification and strict OpenSpec validation.
4. Archive, commit, and push the completed change. Rollback removes the single
   strict map entry and its tests; no runtime or stored-data migration exists.

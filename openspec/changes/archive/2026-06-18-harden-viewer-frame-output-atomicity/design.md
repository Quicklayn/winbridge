## Context

The viewer runtime can persist the latest authorized inbound `screen-frame` to an explicit local path. The local viewer control surface then serves that file on `127.0.0.1` after startup stale-file cleanup. The current sink writes bytes directly to the configured path, which means a concurrent `/frame` read can observe an incomplete JPEG/PNG while the runtime is replacing the file.

## Goals / Non-Goals

**Goals:**

- Publish latest-frame updates as complete files for the development MVP viewer surface.
- Keep writes scoped to the already validated configured output path and its directory.
- Preserve metadata-only diagnostics and all existing authorization, visibility, permission, routing, and audit gates.
- Stay dependency-free and Windows-compatible.

**Non-Goals:**

- No production media pipeline, stream codec, shared memory transport, WebRTC, reconnect redesign, or browser UI rewrite.
- No change to capture, input semantics, authorization, relay routing, pairing, or audit record contents.
- No hidden viewer, hidden host capture, service install, startup persistence, privilege elevation, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.

## Decisions

- Write to a same-directory temporary file and then rename/replace to the configured output path.
  - Rationale: same-directory replacement avoids cross-volume rename issues and keeps the local surface from reading partial output.
  - Alternative considered: lock the final file while writing. Rejected because cross-process advisory locking is more complex and still leaves browser/file-reader behavior platform-dependent.

- Use a deterministic hidden-ish temporary suffix based on the final basename and process id.
  - Rationale: no secrets are needed, names remain bounded and inspectable, and cleanup can target exactly the file this process created.
  - Alternative considered: random temp names. Rejected because randomness adds no security property here and makes failure cleanup/tests less direct.

- Fail closed if temporary write or replacement fails.
  - Rationale: serving the previous frame as if it were current can mislead the viewer. Existing runtime error handling already keeps diagnostics bounded.

## Risks / Trade-offs

- Replacement can fail if another process holds the destination open on Windows -> mitigation: fail closed and surface only sanitized diagnostics.
- A crash between temp write and rename can leave a temp file -> mitigation: temp filenames are scoped to the configured output basename and later writes clean their own temp path before retry.
- Atomic rename semantics vary by filesystem -> mitigation: same-directory replacement is the strongest dependency-free primitive available in Node for this MVP path.

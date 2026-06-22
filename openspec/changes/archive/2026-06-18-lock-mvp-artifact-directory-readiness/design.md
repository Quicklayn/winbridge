# Design: MVP artifact directory readiness

The existing implementation already creates parent directories at the two
runtime write points used by the MVP command kit:

1. `FileAuditSink.write()` validates and redacts the audit record, creates the
   configured file's parent directory recursively, then appends one JSONL line.
2. `FileViewerScreenFrameOutputSink.writeFrame()` decodes an already-authorized
   frame, creates the configured output directory recursively, removes stale
   same-directory temporary output, writes the temporary frame file, then
   replaces the configured latest-frame path.

The change codifies that behavior and adds focused coverage for the viewer
frame sink. Directory creation failures remain ordinary write failures and must
surface to the caller. The command kit remains non-executing: it only prints
commands and does not create directories itself.

No hidden session, startup persistence, background process, privilege
elevation, Windows prompt bypass, clipboard/file transfer, credential access,
or keylogging behavior is introduced.

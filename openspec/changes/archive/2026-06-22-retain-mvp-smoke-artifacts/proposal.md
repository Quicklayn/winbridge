# Change: retain-mvp-smoke-artifacts

## Summary

Add an explicit `--keep-artifacts` option to the root MVP smoke check so a
developer can retain the smoke run's temporary frame and audit directories for
local troubleshooting after a bounded local preflight run.

## Motivation

The MVP smoke check currently creates a temporary work directory and always
removes it from the CLI path. That keeps routine runs clean, but it makes
failed or suspicious two-PC readiness checks harder to diagnose because the
developer cannot inspect the generated latest-frame file and local metadata-only
audit logs from the exact preflight run.

## Safety Impact

This remains a local development preflight. Retaining artifacts does not start
additional processes, launch a browser, invoke Windows capture, apply OS input,
install services, configure startup persistence, elevate privileges, run
unattended, hide the host indicator, or bypass Windows prompts.

Retained artifacts are limited to the smoke check's temporary work directory:
the explicit latest-frame output produced by the local static frame workflow and
metadata-only audit logs. CLI diagnostics must stay bounded and must not echo
raw frame bytes, mutation tokens, input commands, relay tokens, pairing codes,
credentials, private reason text, or raw child process output.

## Non-Goals

- No production artifact collection.
- No arbitrary output directory option.
- No Windows capture or OS input application in the smoke check.
- No browser automation.
- No clipboard, file transfer, diagnostics dump, service, startup, privilege, or
  unattended behavior.

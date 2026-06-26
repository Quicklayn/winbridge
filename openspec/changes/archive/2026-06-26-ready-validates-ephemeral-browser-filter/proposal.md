# Change: Ready validates ephemeral browser filter

## Why

`mvp:ready` now validates the full JSON command plan for explicit ephemeral
viewer surface mode, but its text-mode role-filter checks still cover only the
default fixed browser port. The browser-only operator block is what the viewer
PC may copy during a live two-PC trial, so the ready gate should also catch
drift where `mvp:commands -- --only browser --viewer-control-surface-port 0`
prints a fabricated `127.0.0.1:0` URL or loses the instruction to open the URL
reported by the viewer command.

## What Changes

- Add a default `ephemeral-role-filter-browser-command` readiness step.
- Run `mvp:commands -- --only browser --viewer-control-surface-port 0` in
  non-executing text mode.
- Validate fixed browser-only markers for the ephemeral instruction and reject
  fabricated port-zero URLs or cross-target command blocks.
- Keep diagnostics bounded to fixed check status and reason metadata.

## Safety Impact

This is a local readiness validation change. It does not start relay, host,
viewer, browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, remote discovery, firewall
changes, credential access, keylogging, AV/EDR evasion, Windows prompt bypass,
or hidden sessions.

## Non-Goals

- Do not change the default fixed-port browser block.
- Do not execute the browser command or open any URL.
- Do not expose generated command text, URLs, ports, tokens, pairing codes,
  paths, stdout, stderr, child output, or secrets in readiness diagnostics.


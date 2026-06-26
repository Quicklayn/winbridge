# Change: Smoke uses ephemeral viewer surface port

## Why

The command kit supports `--viewer-control-surface-port 0` for the real viewer
workflow, but the MVP smoke helper still preselects a fixed available loopback
port before starting the viewer. That means smoke does not exercise the same
runtime path an operator uses when the default viewer surface port is occupied.

## What Changes

- Make the default MVP smoke viewer command pass
  `--viewer-control-surface-port 0`.
- Resolve the actual loopback viewer surface URL from the existing bounded
  viewer log marker before checking HTML, `/frame`, `/status`, `/input`, and
  `/disconnect`.
- Keep explicit `surfacePort` test hooks supported for deterministic tests.
- Keep diagnostics bounded: do not echo resolved ports, surface URLs, mutation
  tokens, child output, frame paths, relay URLs, pairing codes, credentials, or
  input contents.

## Safety Impact

This remains a local static smoke workflow. It does not add browser automation,
LAN binding, remote discovery, firewall changes, Windows capture, OS input,
services, startup persistence, unattended access, privilege elevation,
clipboard/file transfer, diagnostics dumps, AV/EDR evasion, Windows prompt
bypass, or hidden session behavior.

## Non-Goals

- No production viewer UI changes.
- No command-kit output changes.
- No relay, auth, native capture, or native input changes.

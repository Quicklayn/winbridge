# Proposal: Add MVP Ready to Command Kit

## Why

`mvp:ready` is now the safest single local readiness gate before a two-PC MVP
trial, but `mvp:commands` still leads with separate doctor, native preflight,
and smoke commands. The command kit should make `mvp:ready` the primary
preflight command while keeping the underlying individual commands visible for
manual troubleshooting.

## What Changes

- Add `npm run mvp:ready` to text command-kit preflight output.
- Add `mvp:ready` to full JSON and preflight-only JSON command plans.
- Preserve existing non-executing behavior and live-session command exclusion in
  preflight-only mode.
- Update focused tests and README wording as needed.

## Safety Impact

This change only updates generated command text/JSON. It does not execute
commands, start relay/host/viewer/browser processes, capture the screen, apply
input, open sockets, write files, install services, configure startup
persistence, elevate privileges, run unattended, or bypass Windows prompts.
`mvp:ready` default behavior is read-only and smoke remains explicit.

## Non-Goals

- Do not change `mvp:ready` execution behavior.
- Do not change relay, host, viewer, capture, input, auth, installer, services,
  startup, tokens, logs, or privilege behavior.

# Proposal: Add MVP Relay Host Shortcut

## Why

Two-PC MVP trials currently require the developer to type a full WebSocket relay
URL. That is easy to mistype during setup, especially when only the relay PC LAN
IP or DNS name matters.

## What Changes

- Add `--relay-host <host>` to `npm run mvp:commands`.
- Build `ws://<host>:8787/` from the validated host shortcut.
- Reject `--relay-host` when an explicit `--relay` URL is also provided.
- Document the shortcut in the command kit usage and README.

## Safety Impact

The command kit remains non-executing. It prints commands only and does not
probe LAN hosts, open sockets, change firewall settings, start relay, start
agent-shell, launch a browser, capture the screen, apply input, install
services, configure startup persistence, elevate privileges, run unattended, or
bypass Windows prompts.

## Non-Goals

- Do not add relay discovery.
- Do not open firewall ports.
- Do not add production relay deployment or authentication.

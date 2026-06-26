# Change: Ready verifies ephemeral browser instruction

## Summary

Add a non-executing `mvp:ready` validation step for the explicit ephemeral
viewer surface command-kit mode. The ready helper will run the existing command
kit in JSON mode with `--viewer-control-surface-port 0` and fail closed if the
viewer/browser commands drift from the reviewed operator workflow.

## Motivation

The command kit can render an explicit ephemeral viewer control surface port,
and the smoke workflow now uses ephemeral ports by default. The aggregate ready
gate should catch regressions where the ephemeral command plan fabricates a
`127.0.0.1:0` browser URL, omits the viewer `0` port flag, or loses the fixed
operator instruction to open the URL printed by the viewer command log.

## Safety Impact

This change is readiness-only. It does not start relay, host, viewer, browser,
capture, input, HTTP listeners, sockets, services, startup persistence,
privilege elevation, unattended access, remote discovery, firewall changes,
credential access, keylogging, AV/EDR evasion, prompt bypass, or hidden
sessions. Diagnostics remain bounded and do not echo command strings, local
URLs, ports, tokens, pairing codes, paths, stdout, stderr, child output, screen
contents, input contents, or full secrets.

## Non-Goals

- Do not change the default command-kit fixed browser port.
- Do not make `mvp:ready` execute a live viewer, browser, relay, or smoke check
  unless the existing explicit `--include-smoke` option is used.
- Do not parse runtime viewer logs or expose resolved ephemeral ports in ready
  output.


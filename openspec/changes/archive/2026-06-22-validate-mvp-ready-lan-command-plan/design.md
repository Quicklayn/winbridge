## Context

`mvp:ready` validates the local environment and the default generated command plan before a two-PC trial. The default plan uses localhost, but the real two-PC workflow relies on `mvp:commands --relay-host <LAN-IP>`, which exercises additional command-kit behavior: LAN relay URL generation and relay bind metadata.

## Goals / Non-Goals

**Goals:**

- Validate a representative LAN command plan as part of default `mvp:ready`.
- Keep validation non-executing and local-only.
- Confirm the LAN plan still uses the same fixed command set and targets a safe fixed LAN relay URL in relay, host, and viewer command entries.
- Keep ready output bounded and free of raw generated commands.

**Non-Goals:**

- Do not detect the user's real LAN IP.
- Do not open sockets, probe ports, modify firewall rules, start relay/host/viewer, launch a browser, capture the screen, or apply input.
- Do not expose the generated command strings through ready output.

## Decisions

- Use a fixed documentation-safe LAN IPv4 literal, `192.168.1.10`, for readiness validation. This exercises the `--relay-host` code path deterministically without inspecting local network interfaces.
- Run `mvp:commands -- --json --relay-host 192.168.1.10` as a separate `lan-command-plan` step after the default `command-plan` step. This keeps diagnostics precise and preserves fail-fast ordering.
- Reuse the existing command-plan parser, extended with optional expected relay URL validation for the relay, host, and viewer command entries.
- Treat generated command strings as internal child output only. The parser may inspect them for the expected relay URL but formatted ready output will report only `lan-command-plan=ok` or a bounded failure reason.

## Risks / Trade-offs

- [Risk] The validation relies on fixed command names and a fixed LAN URL string. → Mitigation: keep the parser intentionally narrow and update the test fixture when the command-kit contract changes.
- [Risk] Running one more npm command adds a small readiness delay. → Mitigation: it avoids discovering LAN command-plan regressions only during a live two-PC setup.
- [Risk] Generated command strings contain pairing codes and paths. → Mitigation: never include them in `mvp:ready` text or JSON output.

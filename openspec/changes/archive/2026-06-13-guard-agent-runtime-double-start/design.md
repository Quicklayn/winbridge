## Context

The managed agent shell runtime keeps a single `socket` variable and connection-scoped session state. A fresh `start()` resets that state and opens a WebSocket. Today, caller code can invoke `start()` again while the previous WebSocket is still connecting, open, or closing, which can create overlapping transports from one runtime instance.

## Goals / Non-Goals

**Goals:**

- Reject duplicate active `start()` calls before constructing another WebSocket.
- Preserve manual restart after a prior socket is fully closed or after `stop()` completes.
- Keep rejection local and side-effect free: no protocol send, local sent/received event, authorization change, indicator activation, reconnect attempt, or audit emission.

**Non-Goals:**

- Do not add automatic reconnect behavior.
- Do not change relay duplicate-peer handling.
- Do not change protocol schemas, authorization state machines, audit payloads, capture, input, clipboard, file transfer, native Windows APIs, installer behavior, services, startup persistence, tokens, logs, or privileges.

## Decisions

- Guard `start()` with the current WebSocket ready state.
  Alternative: rely on relay duplicate-join rejection. That still creates a second local transport and can reset local runtime state before the relay rejects it.
- Treat `CONNECTING`, `OPEN`, and `CLOSING` as active runtime states.
  Alternative: reject only `OPEN`. That leaves the most likely race, a second start during connection setup, unguarded.
- Allow `start()` after the previous WebSocket reaches `CLOSED`.
  Alternative: make runtime instances single-use forever. That would be stricter than the existing manual restart model and would make tests and local exercisers less ergonomic without a safety gain.

## Risks / Trade-offs

- Rejected duplicate start may surface a new error to caller code that accidentally double-started a runtime -> Mitigation: error is explicit, bounded, and occurs before side effects.
- WebSocket ready state can change asynchronously around `stop()` -> Mitigation: `stop()` already sets the runtime `socket` reference to `undefined` before awaiting close, and the guard focuses on preventing overlapping active starts from the public `start()` path.

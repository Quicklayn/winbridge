## Context

The command kit is a non-executing helper that prints the visible relay, host,
viewer, and browser steps for a development MVP. The viewer surface now requires
both a ready frame and visible same-page pointer arming before browser pointer
events can send input.

## Goals / Non-Goals

**Goals:**

- Make the printed browser step self-contained for the current pointer safety
  flow.
- Keep the guidance bounded and free of secrets or raw runtime data.
- Preserve the command kit as pure text formatting.

**Non-Goals:**

- No new command-line options, process launching, socket use, browser control,
  runtime calls, protocol messages, capture, input injection, or native Windows
  behavior.

## Decisions

- Add static bullet text immediately after the browser command. The note stays
  close to the step it explains and does not alter generated commands.
- Mention `frame=ready` and `Pointer Off/On` by the exact visible UI strings so
  developers can verify the page state without exposing frame data.

## Risks / Trade-offs

- [Risk] More generated text.
  -> Mitigation: the note is two short bullets in the existing browser section.

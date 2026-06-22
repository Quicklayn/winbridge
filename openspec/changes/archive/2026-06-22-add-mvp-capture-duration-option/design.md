# Design: MVP Capture Duration Option

## Approach

The command kit accepts `--capture-duration-minutes N` with an integer bounded range. It conflicts with `--capture-count` because both define the same finite stream length. The command kit derives the host `--dev-screen-frame-count` from:

```text
ceil(durationMinutes * 60_000 / captureIntervalMs)
```

The derived count must fit the existing command-kit frame-count bound. This keeps the generated host command compatible with the existing agent-shell frame stream parser and prevents short intervals from accidentally generating oversized loops.

The default command-kit plan uses a duration rather than the old raw default count, producing a finite 10 minute stream with the existing 1000 ms interval.

## Security Rationale

The duration option is a usability layer over an existing explicit finite frame count. It does not authorize capture. The host command still requires interactive consent prompt approval, visible session state, local audit configuration, and host control prompt. The command kit remains non-executing.

Rejecting `--capture-duration-minutes` together with `--capture-count` prevents ambiguous operator expectations. Rejecting derived counts above the finite bound prevents accidental near-continuous capture when an operator combines a long duration with a very short interval.

## Alternatives Considered

- Increase the default raw count only: simpler, but less discoverable and still makes users calculate durations.
- Add an infinite mode: rejected because it weakens the development MVP boundary and host expectation of bounded capture.
- Change agent-shell frame-stream limits: unnecessary for this MVP launch usability increment.

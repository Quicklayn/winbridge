# Change: Add MVP capture duration option

## Summary

Add a bounded `--capture-duration-minutes` option to the MVP session command kit so a two-PC trial can generate a finite but usable frame-stream duration without manually calculating `--capture-count`.

## Motivation

The current command kit defaults to a short finite stream based on frame count. That keeps the development host path bounded, but it is awkward for an actual MVP trial where the operator thinks in minutes. A duration option makes the launch plan easier to use while retaining explicit consent, visible terminals, host revocation controls, and a hard finite frame count.

## Safety Impact

Touches user-visible MVP launch commands and the capture scheduling arguments printed for the host agent shell. It does not add hidden capture, unattended access, background startup, services, installer behavior, privilege elevation, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or automatic process execution.

The generated host command remains explicit, visible, finite, consent-bound, audit-bound, and host-revocable. Duration input is bounded and rejects combinations that would exceed the existing finite frame-stream limit.

## Non-Goals

- No infinite or unattended capture mode.
- No process launcher or background service.
- No production media pipeline.
- No changes to native capture or native input adapters.
- No firewall, network probing, or relay exposure automation.

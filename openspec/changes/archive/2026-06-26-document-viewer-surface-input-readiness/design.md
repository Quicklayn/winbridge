# Design

## Scope

This change is documentation-only. It updates README operator guidance and the
existing local viewer surface readiness requirement so both describe the
implemented bounded `inputPointerReady` and `inputKeyboardReady` gates.

## Runtime Behavior

No runtime code changes are required. The local viewer surface already enables
pointer arming/browser pointer actions only for pointer readiness, enables
explicit key buttons/modifier toggles only for keyboard readiness, keeps manual
input disabled until at least one readiness flag is true, and still relies on
runtime authorization for every `/input` POST.

## Safety

The clarification reinforces consent-first operation by documenting that local
readiness is not authorization. It does not add capture, input, credential,
clipboard, persistence, stealth, evasion, privilege, installer, service, or
Windows prompt behavior.

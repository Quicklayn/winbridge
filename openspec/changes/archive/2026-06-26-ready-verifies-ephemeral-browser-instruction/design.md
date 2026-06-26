# Design

## Approach

Add one aggregate ready plan step named `ephemeral-command-plan` that invokes:

```text
npm run mvp:commands -- --json --viewer-control-surface-port 0
```

The step reuses the command kit's non-executing JSON output and validates only
bounded internal metadata:

- the output has the same exact command-plan envelope as existing command-plan
  validation;
- the viewer command includes the reviewed `--viewer-control-surface-port '0'`
  argument;
- the browser command is the fixed instruction to open the URL printed by the
  viewer command log;
- neither the browser command nor the command plan contains a fabricated
  `http://127.0.0.1:0/` URL.

The check result remains a fixed status record (`ephemeral-command-plan=ok` or
`failed reason=exit-nonzero`). It must not echo command output or unsafe values.

## Alternatives Considered

- Validate only text-mode `--only browser --viewer-control-surface-port 0`.
  This catches the browser block but misses drift between browser and viewer
  command JSON in the full command plan.
- Change the command-kit default to port `0`. That would alter the documented
  two-PC operator flow more broadly and is outside this small readiness
  validation change.

## Security Rationale

The readiness helper remains a local validation layer. It consumes bounded
command-kit output but never runs the printed commands, resolves ports, starts
network listeners, launches browsers, or handles mutation tokens. Failure
diagnostics use only fixed reason codes, preserving the existing secret-safe
ready output boundary.


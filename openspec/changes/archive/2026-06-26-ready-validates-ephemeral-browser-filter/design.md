# Design

## Approach

Add one default ready step named `ephemeral-role-filter-browser-command`:

```text
npm run mvp:commands -- --only browser --viewer-control-surface-port 0
```

The validator will reuse the existing role-filter output parser with an
explicit variant for the browser target. The ephemeral browser variant requires
the same fixed browser-only structure and ready reminder, requires the fixed
instruction to open the local control surface URL printed by the viewer command
log, and rejects live runtime command blocks plus the fabricated
`Start-Process 'http://127.0.0.1:0/'` marker.

The ready result remains fixed metadata only:

```text
ephemeral-role-filter-browser-command=ok
```

or a bounded failed reason.

## Security Rationale

This check reads bounded command-kit output from a child process and does not
run any printed command. It does not parse runtime logs, resolve ports, open
browsers, bind sockets, or handle local surface mutation tokens. Failure output
continues to omit child output and generated command text.


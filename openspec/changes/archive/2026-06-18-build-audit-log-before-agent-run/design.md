# Design: Build audit log before agent runs

The root `dev:agent` script should build workspaces in dependency order:

1. `@winbridge/protocol`
2. `@winbridge/audit-log`
3. `@winbridge/windows-capture`
4. `@winbridge/windows-input`
5. `@winbridge/agent-shell`

`audit-log`, `windows-capture`, and `windows-input` all depend on protocol. Agent-shell depends on all four package workspaces. This remains a visible, user-invoked development helper and does not introduce automatic startup or background execution.

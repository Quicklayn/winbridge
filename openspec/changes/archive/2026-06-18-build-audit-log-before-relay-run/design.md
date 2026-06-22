# Design: Build audit log before relay runs

The root `dev:relay` script should build workspace dependencies in order:

1. `@winbridge/protocol`
2. `@winbridge/audit-log`
3. `@winbridge/relay`

The helper remains user-invoked and visible. It does not start until the user runs the printed command and does not add any background task, service installation, startup persistence, or automatic network activity.

# Design: MVP browser open command

The command kit already treats the viewer control surface as loopback-only and
prints `http://127.0.0.1:<port>/`. The rendered step should be consistent with
the relay, host, and viewer steps by printing a PowerShell command:

```powershell
Start-Process 'http://127.0.0.1:35987/'
```

The helper remains a text renderer. It must not import `child_process`, call
`Start-Process`, open a socket, launch the browser itself, or keep handles
alive. The existing port validation remains the trust boundary for the URL.

No production browser integration, production viewer UI, hidden process launch,
or automatic session startup is introduced.

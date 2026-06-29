# Design

## Command Kit Guard

After parsing `--token-env` and the resolved relay URL, reject full-session
command plans when the relay URL is not loopback and no token environment name
was provided.

The existing preflight-only and `--only preflight` paths are parsed before
full-session options and remain non-executing. They can still render token-env
references when explicitly provided, but they do not generate LAN relay, host,
viewer, or browser commands.

## Readiness Helper

The root `mvp:ready` helper's `lan-command-plan` step should call:

```text
npm run mvp:commands -- --json --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN
```

The readiness parser must validate both:

- the expected LAN relay URL and relay bind host;
- the expected token-env references in host, viewer, and all-smoke preflight
  command entries, plus the reviewed tokenized LAN command-plan invocation.

## Failure Handling

Invalid LAN tokenless command plans throw the existing usage error. The
diagnostic text must remain static and must not echo the provided relay host,
URL, token environment name, command text, credentials, or raw input.

## Tests

- Command kit rejects tokenless `--relay-host`.
- Command kit rejects tokenless non-loopback `--relay`.
- Command kit still accepts localhost/loopback plans without token-env.
- Command kit accepts LAN plans with token-env and includes token references.
- Ready plan includes token-env on `lan-command-plan`.
- Ready parser fails LAN command-plan output when token references are missing.

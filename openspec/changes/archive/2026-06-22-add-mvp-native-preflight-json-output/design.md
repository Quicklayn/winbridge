# Design

Extend `parseMvpNativePreflightArgs()` with a flag-only `--json` option and add
`formatMvpNativePreflightJsonResult()`.

The formatter will serialize only the existing bounded result shape: `ok`,
optional bounded `reason`, and `checks` entries containing check name, `ok`, and
optional bounded reason. It will not include scripts, PowerShell stdout/stderr,
exceptions, paths, or environment data.

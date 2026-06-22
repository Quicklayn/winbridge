# Design

Extend `parseMvpDoctorArgs()` with a flag-only `--json` option. The CLI will
format the existing `runMvpDoctorCheck()` result through a new
`formatMvpDoctorJsonResult()` helper.

The JSON formatter will copy only bounded fields already produced by the doctor:
`ok`, safe known reason codes, and check names. It will not include root paths,
entrypoint paths, package contents, raw exceptions, or environment values.

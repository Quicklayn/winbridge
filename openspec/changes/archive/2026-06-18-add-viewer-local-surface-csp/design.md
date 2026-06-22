# Design: Viewer local surface CSP

The generated viewer surface page needs inline CSS and JavaScript because it is
a single local development HTML response and must carry the per-run mutation
token into fetch headers. Use a per-response nonce to keep those inline blocks
explicitly authorized without allowing arbitrary inline script execution.

The HTML response should include:

- `Content-Security-Policy` with `default-src 'none'`.
- `script-src 'nonce-<nonce>'` and `style-src 'nonce-<nonce>'`.
- `connect-src 'self'` for `/status`, `/frame`, `/input`, and `/disconnect`.
- `img-src 'self'` for the configured frame endpoint.
- `base-uri 'none'`, `form-action 'none'`, and `frame-ancestors 'none'`.

The nonce is generated independently of the mutation token and is safe to place
in both the header and matching HTML attributes. The mutation token stays only in
the generated page body and existing same-origin request headers; it must not be
included in response headers, logs, status JSON, or diagnostics.

No browser launch, production viewer UI, external asset loading, LAN exposure,
or authorization behavior is introduced.

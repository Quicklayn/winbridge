## 1. Viewer Control Status Coverage

- [x] 1.1 Update viewer control prompt status coverage to include active authorization `expiresAt` metadata.
- [x] 1.2 Verify existing viewer control inactive, remote-disconnect, and local-inactive tests still omit stale `expiresAt` metadata.

## 2. Verification

- [x] 2.1 Run focused viewer control prompt tests.
- [x] 2.2 Run strict OpenSpec validation for `cover-viewer-control-expiration-status`.
- [x] 2.3 Perform safety review for viewer control status metadata.
- [x] 2.4 Run `npm run check`.
- [x] 2.5 Run `npm test`.
- [x] 2.6 Run `npm run build`.
- [x] 2.7 Run `npm run openspec:validate`.

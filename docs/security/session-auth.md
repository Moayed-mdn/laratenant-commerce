# Session Authentication

- middleware checks for known session cookie names before protected access.
- protected paths redirect to locale-aware login with `redirect` query param.
- client fetch keeps `credentials: include` for cookie continuity.
- avoid exposing auth credentials to JavaScript-accessible storage.

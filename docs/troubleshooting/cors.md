# CORS And Proxy

- browser requests should target `/api/proxy`, not Laravel host directly.
- ensure `APP_CONFIG.apiBaseUrl` is reachable from server runtime.
- verify `credentials: include` is present in client/proxy/server fetch calls.
- if auth appears broken, inspect `set-cookie` propagation in proxy response.

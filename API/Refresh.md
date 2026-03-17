# Admin Refresh API

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## Endpoint

- Method: `POST`
- Path: `/auth/admin/refresh`

## Request

Requires `refresh_token` cookie (HttpOnly, Path: `/auth/admin`).

## Response

### 200 OK

- Rotates `refresh_token` cookie.
- Body: same shape as Admin Login.

### Errors

- `401 {"error":"invalid_refresh_token"}`
- `503 {"error":"service_unavailable"}`

## Example

```bash
# cookie.txt should contain the refresh_token cookie from /auth/admin/login
curl -i \
  -X POST \
  -b cookie.txt \
  http://api.my365biz.com/auth/admin/refresh
```

# Admin Logout API

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## Endpoint

- Method: `POST`
- Path: `/auth/admin/logout`

## Request

Requires `refresh_token` cookie (if present it will be revoked).

## Response

### 200 OK

- Clears `refresh_token` cookie.

```json
{ "ok": true }
```

## Example

```bash
curl -i \
  -X POST \
  -b cookie.txt \
  http://api.my365biz.com/auth/admin/logout
```

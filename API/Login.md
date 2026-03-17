# Admin Login API

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## Endpoint

- Method: `POST`
- Path: `/auth/admin/login`
- Content-Type: `application/json`

## Request

```json
{
  "email": "admin@example.com",
  "password": "********",
  "totpCode": "123456"
}
```

如果该账号 `mfa_enabled=true`：

- 推荐流程：先只提交 `email + password`，接口会返回 `401 mfa_required` 以及 `mfaToken`，再调用 `POST /auth/admin/mfa` 提交 `totpCode` 完成登录。
- 兼容旧流程：也可以在 `/auth/admin/login` 里直接带 `totpCode` 一次完成登录。

## Response

### 200 OK

- Sets `refresh_token` as an **HttpOnly cookie** (Path: `/auth/admin`).
- Body:

```json
{
  "accessToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "admin": { "id": "...", "email": "...", "name": "...", "role": "owner" }
}
```

### Errors

- `400 {"error":"invalid_request"}`
- `401 {"error":"invalid_credentials"}`
- `401 {"error":"mfa_required","mfaToken":"...","expiresIn":300}`
- `401 {"error":"invalid_mfa_code"}`
- `503 {"error":"service_unavailable"}`

## Example

```bash
curl -i \
  -H "Content-Type: application/json" \
  -X POST \
  --data '{"email":"admin@example.com","password":"********","totpCode":"123456"}' \
  http://api.my365biz.com/auth/admin/login
```

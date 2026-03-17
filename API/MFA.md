# Admin MFA Verify

当账号开启 MFA（`mfa_enabled=true`）时，先调用 `POST /auth/admin/login` 提交邮箱密码，拿到 `mfaToken`，再调用本接口提交 `totpCode` 完成登录并换取 `accessToken/refresh_token`。

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## Endpoint

- Method: `POST`
- Path: `/auth/admin/mfa`
- Content-Type: `application/json`

## Request

```json
{
  "mfaToken": "<from /auth/admin/login>",
  "totpCode": "123456"
}
```

## Response

### 200 OK

- Sets `refresh_token` as an **HttpOnly cookie** (Path: `/auth/admin`).
- Body 同 `/auth/admin/login` 成功响应：

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
- `401 {"error":"invalid_mfa_token"}`
- `401 {"error":"invalid_mfa_code"}`
- `503 {"error":"service_unavailable"}`

## Example

```bash
curl -i \
  -H "Content-Type: application/json" \
  -X POST \
  --data '{"mfaToken":"<from /auth/admin/login>","totpCode":"123456"}' \
  http://api.my365biz.com/auth/admin/mfa
```

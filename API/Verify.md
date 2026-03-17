# Admin Verify

验证 Admin `accessToken` 是否有效，并把已验证的身份信息返回在响应头中，供上游网关/服务“包装”请求使用（AuthServer **不负责转发**）。

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## Request

- Method: `GET`
- Path: `/auth/admin/verify`
- Headers:
  - `Authorization: Bearer <accessToken>`

Example:

```bash
curl -i \
  -H "Authorization: Bearer <accessToken>" \
  http://api.my365biz.com/auth/admin/verify
```

兼容路径（由网关提供）：

- `GET /admin/verify`

## Response

### 200 OK

- Headers:
  - `X-Admin-Id: <uuid>`
  - `X-Admin-Email: <email>`
  - `X-Admin-Role: <role>`
- Body:
  - `{"ok": true}`

### 401 Unauthorized

当缺少/无效 `accessToken` 时：

```json
{"error":"invalid_access_token"}
```

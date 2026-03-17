# 邀请码（Invite Codes）

用于管理员为某个团队（book）生成邀请码，邀请新用户加入该团队。

## 安全说明

- 生成接口会返回 `code` 明文 **仅一次**。
- 数据库只保存 `code_hash`（不可逆哈希），避免 DB 泄露后邀请码被直接使用。
- 兑换（redeem）建议在网关层做鉴权/风控；服务端也支持可选 Redis 限流（见 `docs/runtime.md`）。

## `POST /admin/team/{bookid}/invites`

为团队生成邀请码。

### Body（可选）

```json
{
  "expires_in_days": 7,
  "max_uses": 1,
  "role": null
}
```

### 响应 200

```json
{
  "inviteId": 1,
  "bookId": "uuid",
  "teamName": "AntsDemo",
  "code": "xxxxxx",
  "role": null,
  "maxUses": 1,
  "usedCount": 0,
  "expiresAt": "2026-03-24T00:00:00Z",
  "createdAt": "2026-03-17T00:00:00Z"
}
```

## `GET /admin/team/{bookid}/invites`

列出该团队所有邀请码（不返回明文 `code`）。

### 响应 200

```json
[
  {
    "inviteId": 1,
    "bookId": "uuid",
    "role": null,
    "maxUses": 1,
    "usedCount": 0,
    "expiresAt": "2026-03-24T00:00:00Z",
    "revokedAt": null,
    "lastUsedAt": null,
    "createdAt": "2026-03-17T00:00:00Z",
    "active": true
  }
]
```

## `POST /admin/invites/{invite_id}/revoke`

撤销邀请码（不可再兑换）。

## `POST /invite/redeem`

用户使用邀请码注册并加入团队。

### Body（必填）

```json
{
  "code": "xxxxxx",
  "username": "user_xxx",
  "email": "u@example.com",
  "password": "plaintext_password"
}
```

### 响应 200

```json
{
  "ok": true,
  "team": { "bookId": "uuid", "teamName": "AntsDemo" },
  "user": { "id": 123, "username": "user_xxx", "email": "u@example.com" }
}
```

### 常见错误

- `400`：邀请码无效/已撤销/已过期/已达使用次数
- `403`：团队已 inactive（到期或手动禁用）
- `409`：用户已存在（email 或 username 冲突）

## `POST /admin/invites/{invite_id}/copy`

复制历史邀请码并生成新的 `code`，可覆盖可用人数/有效期/角色。

### Body（可选）

```json
{
  "expires_in_days": 30,
  "max_uses": 5,
  "role": "member"
}
```

### 响应 200

```json
{
  "inviteId": 2,
  "bookId": "uuid",
  "teamName": "AntsDemo",
  "code": "xxxxxx",
  "role": "member",
  "maxUses": 5,
  "usedCount": 0,
  "expiresAt": "2026-04-16T00:00:00Z",
  "createdAt": "2026-03-17T00:00:00Z",
  "copiedFrom": 1
}
```

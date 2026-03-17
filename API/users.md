# Users (Admin)

## `GET /admin/user`

用户列表（分页）。

### Query 参数

- `limit`：默认 50，范围 1–200
- `offset`：默认 0，范围 ≥0

### 响应 200

```json
{
  "limit": 10,
  "offset": 0,
  "total": 1,
  "items": [
    {
      "id": 1,
      "username": "user_xxx",
      "email": "u@example.com",
      "bookconnect": "uuid|null",
      "teamName": "AntsDemo|null",
      "mfaEnabled": false,
      "status": "active|inactive",
      "createdAt": "2026-03-17T09:25:41Z",
      "updatedAt": "2026-03-17T09:25:41Z"
    }
  ]
}
```

## `GET /admin/user/{id}`

用户详情。

### 响应 200

```json
{
  "id": 1,
  "username": "user_xxx",
  "email": "u@example.com",
  "bookconnect": "uuid|null",
  "teamName": "AntsDemo|null",
  "mfaEnabled": false,
  "status": "active|inactive",
  "createdAt": "2026-03-17T09:25:41Z",
  "updatedAt": "2026-03-17T09:25:41Z"
}
```

### 常见错误

- `404`: 用户不存在
- `503`: 数据库不可用

## `POST /admin/user/{id}/reset-mfa`

重置该用户的 MFA（清空 `mfa` JSON）。

### 响应 200

```json
{ "ok": true, "userId": 1 }
```

## `POST /admin/user/{id}/reset-password`

重置该用户的密码。

### Body

```json
{ "password": "new_password" }
```

### 响应 200

```json
{ "ok": true, "userId": 1 }
```

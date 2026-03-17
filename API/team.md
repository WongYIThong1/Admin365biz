# 团队（Team）与计费

## Base URL

推荐通过网关访问：

- `http://api.my365biz.com`

## 鉴权（Admin）

所有 `/admin/*` 接口都需要带 `accessToken`：

- `Authorization: Bearer <accessToken>`
- `accessToken` 由 `POST /auth/admin/login` 或 `POST /auth/admin/refresh` 获取

团队与计费基于 `book` + `users.bookconnect`：

- teamName = `book.company_name`
- memberCount = `users` 表中 `bookconnect = book.id` 的用户数量
- 订阅到期：`book.expires_at`
- 手动禁用：`book.force_inactive`

## status 规则

`status` 不存库，返回时实时计算：

- `force_inactive=true` => `inactive`
- `expires_at is null` => `active`
- `now < expires_at` => `active` 否则 `inactive`

## `GET /admin/team`

返回所有团队列表（每个 `book` 一条）。

### 响应 200

```json
[
  {
    "bookId": "uuid",
    "teamName": "AntsDemo",
    "memberCount": 3,
    "expiresAt": "2026-04-16T08:00:00Z",
    "forceInactive": false,
    "status": "active"
  }
]
```

## `GET /admin/team/{bookid}`

返回团队详情（含成员列表：`username`、`email`）。

### 响应 200

```json
{
  "bookId": "uuid",
  "teamName": "AntsDemo",
  "memberCount": 3,
  "expiresAt": "2026-04-16T08:00:00Z",
  "forceInactive": false,
  "status": "active",
  "members": [
    { "username": "user_xxx", "email": "a@example.com" }
  ]
}
```

## `POST /admin/team/extend/{bookid}`

延长订阅（按天数）。会自动把 `forceInactive` 置为 `false`。

### Body

```json
{ "days": 30 }
```

### 响应 200

```json
{
  "bookId": "uuid",
  "teamName": "AntsDemo",
  "memberCount": 3,
  "expiresAt": "2026-05-16T08:00:00Z",
  "forceInactive": false,
  "status": "active"
}
```

## `PATCH /admin/team/{bookid}`

手动禁用/启用团队。

### Body

```json
{ "force_inactive": true }
```

### 响应 200

同 `POST /admin/team/extend/{bookid}` 的返回结构。

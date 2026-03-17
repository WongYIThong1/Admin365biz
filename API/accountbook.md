# 账本（book）

## `GET /admin/accountbook/`

分页返回 Postgres 中 `book` 表的数据。

### Query 参数

- `limit`（int，可选）：默认 50，范围 1–200
- `offset`（int，可选）：默认 0，范围 ≥0

### 响应 200

```json
{
  "limit": 50,
  "offset": 0,
  "total": 123,
  "items": [
    { "colA": "value", "colB": 123 }
  ]
}
```

说明：

- `total`：`book` 表总行数（`SELECT COUNT(*) FROM book`）
- `items`：当前页数据（`SELECT * FROM book LIMIT ... OFFSET ...`）
- `items` 中字段名/字段类型取决于你的 `book` 表结构（服务不做字段映射与脱敏）

### 响应 422（参数校验失败）

当分页参数不合法时（例如 `limit=0` 或 `offset=-1`），FastAPI 会返回 422：

```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "...",
      "type": "..."
    }
  ]
}
```

### 响应 503（数据库不可用）

数据库连接池未初始化或连接失败时返回 503：

```json
{ "detail": "Cannot connect to database" }
```

## 示例

```bash
curl \
  -H 'Authorization: Bearer <accessToken>' \
  'http://api.my365biz.com/admin/accountbook/?limit=10&offset=0'
```


# AdminServer API 文档

本文档描述当前服务对外提供的 HTTP API。

## 基础信息

- Base URL（推荐走网关）：`http://api.my365biz.com`
- Content-Type：`application/json; charset=utf-8`

说明：

- 生产环境下 `/admin/*` 由网关转发到 AdminServer（`192.168.11.165:8000`），并在转发前通过 AuthServer 校验 `accessToken`。
- AdminServer 自身的 `GET /docs` 与 `GET /openapi.json` 仅在直连 `http://<host>:8000` 时可用，网关不保证暴露这些路径。

## 约定

- **鉴权**：访问所有 `/admin/*` 接口时，客户端必须带：
  - `Authorization: Bearer <accessToken>`
  - `accessToken` 来自 `POST /auth/admin/login` 或 `POST /auth/admin/refresh`
- **网关注入 Header**：网关在鉴权成功后，会在转发到 AdminServer 的请求头里注入：
  - `X-Admin-Id`
  - `X-Admin-Email`
  - `X-Admin-Role`
  客户端不需要也不应该自行填写这些 header。
- **分页**：使用 `limit` + `offset`
  - `limit`：每页条数（默认 50，范围 1–200）
  - `offset`：偏移量（默认 0，范围 ≥0）

## 账本（book 表）

### `GET /admin/accountbook/`

分页返回 Postgres 中 `book` 表的数据。

#### Query 参数

- `limit`（int，可选）：默认 50，范围 1–200
- `offset`（int，可选）：默认 0，范围 ≥0

#### 响应 200

返回结构：

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
- `items` 中字段名/字段类型完全取决于你的 `book` 表结构（服务不做字段映射与脱敏）

#### 响应 422（参数校验失败）

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

#### 响应 503（数据库不可用）

- 数据库连接池未初始化或连接失败时返回 503：

```json
{ "detail": "Cannot connect to database" }
```

## 示例

### curl

```bash
curl \
  -H 'Authorization: Bearer <accessToken>' \
  'http://api.my365biz.com/admin/accountbook/?limit=10&offset=0'
```

## 运行相关（数据库配置）

服务通过环境变量读取数据库连接：

- `DATABASE_URL`：默认 `postgresql://admin:root@192.168.11.164:5432/app`
- `DB_POOL_MIN_SIZE`：默认 `1`
- `DB_POOL_MAX_SIZE`：默认 `5`

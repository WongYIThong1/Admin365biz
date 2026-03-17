# Book Syncs (Admin)

## `POST /admin/book/database`

注册一个新的 sync shard（数据库），并投递 provisioning job 给 APIServer。

### Body

```json
{
  "shard_code": "db2",
  "database_url": "postgresql://root:root@192.168.11.167:5432/root",
  "is_default": true
}
```

### 行为

- 在主库写 `public.sync_shard`（`status='pending'`）。
- 若 `is_default=true`，会自动把其他 shard 的 `is_default` 清掉。
- 投递 Redis stream：`sync:stream:provision`

### 响应 200

```json
{
  "shardCode": "db2",
  "databaseUrl": "postgresql://root:root@192.168.11.167:5432/root",
  "status": "pending",
  "isDefault": true,
  "lastError": null,
  "provisionedAt": null,
  "createdAt": "2026-03-17T11:00:00Z",
  "updatedAt": "2026-03-17T11:00:00Z"
}
```

## `POST /admin/book/resyncs/{bookid}`

为某个 `book` 触发一次 resync。

### Body

```json
{
  "content": "all",
  "reason": "manual-resync"
}
```

`content` 取值：

- `all`
- `pi`
- `creditor`
- `creditortype`
- `stock`
- `stockgroup`
- `taxcode`

### 行为

- 写入主库 `public.sync_request`，`status='pending'`
- 投递 Redis stream：`sync:stream:request`

### 响应 200

```json
{
  "requestId": 123,
  "bookId": "efcf1e38-080b-45eb-be81-0fc22bf64444",
  "content": "all",
  "status": "pending",
  "requestedAt": "2026-03-17T11:00:00Z",
  "createdAt": "2026-03-17T11:00:00Z",
  "updatedAt": "2026-03-17T11:00:00Z"
}
```

### 常见错误

- `404`: `bookid` 不存在
- `400`: `content` 非法
- `503`: Redis 或数据库不可用


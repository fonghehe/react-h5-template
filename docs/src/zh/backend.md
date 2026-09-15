# API 边界与 PostgreSQL 后端

三个应用的 `src/app/api` 都是 `packages/server/src/routes` 的薄导出，不内嵌 SQL。商品请求的链路是：共享 Screen → `packages/api-client` → 当前应用同源 `/api/products` → 轻量 Route Handler → 服务端 Zod 校验 → Repository → 内置数据或 PostgreSQL → `{ code, data, message, requestId }`。

| 方法与路径 | 当前能力 | 认证 |
| --- | --- | --- |
| `GET /api/products` | 按语言分页商品 | 无 |
| `GET /api/products/{id}` | 单个商品，不存在时 404 | 无 |
| `POST /api/auth/login` | 演示/数据库账号校验，签发 token | 无 |
| `POST /api/auth/logout` | 返回成功，浏览器清会话 | 服务端不撤销 |
| `GET /api/user` | 验证 bearer 签名和期限，读公开用户 | Bearer |
| `POST /api/ai/chat` | 演示 SSE，输入错时流前 JSON 400 | 无 |

`packages/contracts` 的 Zod 校验页码（1～10000）、每页数量（1～20）、商品 ID、登录与 AI 消息。无效商品 ID 为 400，合法但不存在为 404；登录凭据错为 403，`/api/user` token 缺失/无效为 401。客户端只接受 `/api/` 相对路径，带 `Accept-Language` 和新 UUID 请求 ID，并把 HTTP/业务、网络和非法响应归一成 `ApiError`。服务器按语言头权重挑支持语言；不支持时回退简体中文。错误 `message` 用于展示，HTTP 状态和 `code` 是机器边界。当前还没有把请求 ID 串到统一服务端日志。

接口契约在 `openapi/schema.yaml`。**先改契约再运行** `pnpm api:generate`，Orval 写入 `packages/api-client/src/generated/generated`。共享页面现在主要使用自定义 `api` 封装；AI 因为响应是事件序列，用独立 SSE Reader 而不是把它当单个 JSON。契约、Route Handler、Zod 与客户端方法要同步，生成代码不要手改。仓储层把数据库行映射成公开 Product/User，Route Handler 不直接泄露原始行。

`getDatabase()` 在没有 `DATABASE_URL` 时返回 null，Repository 读取内置数据；配置 URL 后创建 `pg.Pool` 与 Drizzle，数据库失败会直接暴露。开发每个服务进程最多 5 个连接，生产最多 10 个；三个应用同时启动就是三个独立连接池。`products` 表含中英日标题、演示价格、会员价、图片、店铺/配送/描述、排序与时间；`users` 表含用户名、带盐密码哈希、公开资料、角色与时间。SQL 迁移在 `drizzle/`，`scripts/db-seed.ts` upsert 演示数据并调整序列。数据库描述/店铺尚未完全国际化，也没有订单、库存、会话或 AI 对话表。[电商](/zh/commerce)和[改进路线](/zh/roadmap)说明后续边界。

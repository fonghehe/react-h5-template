# 架构与改进路线

```text
apps/h5-*/src/app       三套独立 Next.js 应用和轻量 API 导出
packages/mobile-ui     共享页面、Provider 与 UiKit 契约
packages/ui-*          三套移动组件库适配器
packages/api-client    站内相对路径请求、SSE、生成客户端
packages/contracts     领域类型与 Zod 请求校验
packages/server        Route Handler、认证、仓储、数据库结构
packages/stores        Zustand 会话和本地购物车
packages/i18n          五语言应用词典
openapi/               HTTP 契约
```

依赖方向为应用入口 → 共享页面 → 请求客户端、契约、状态。三套 UI 组件库通过入口注入，不进入业务页面。商品请求携带 `Accept-Language` 和 `X-Request-ID`，经应用的轻量 Route Handler 进入 `packages/server` 校验，再由 Repository 查询演示数据或 PostgreSQL，最后返回 `{ code, data, message, requestId }`。无效的分页和商品 ID 返回统一 `400` 响应。语言头支持权重；请求 ID 只接受 UUID。

商品远程数据由 TanStack Query 管理，购物车和会话由 Zustand 管理。三套应用的浏览器 origin 不同，因此本地购物车和会话互不共享。AI 端点在 SSE 开始前校验消息；开始流后若接入真实 Provider，后续错误必须作为 SSE 事件发送。

| 能力 | 当前实现 | 真实业务需要补充 |
| --- | --- | --- |
| 商品 | PostgreSQL 或内置数据的只读商品；标题部分国际化 | 库存、可更新价格、后台管理 |
| 购物车 | 浏览器持久化商品快照和本地总额 | 服务端重新读取商品并计算最终价格 |
| 结算 | 表单校验、确认后清空本地购物车 | 认证订单 API、幂等键、事务锁库存、支付回调和订单状态 |
| 登录 | 浏览器保存七天有效的签名 bearer token | 可撤销会话、安全 Cookie/CSRF 策略、轮换和限流 |
| AI | 演示 SSE 回答，无持久化 | Provider 适配、用量限制、流中错误事件 |

最先要补的是订单创建边界：服务端根据商品 ID 和数量查权威价格，在同一事务中预留库存、写入订单，并用唯一幂等键阻止重复提交。只有服务端确认订单创建后，客户端才能清掉已选购物车行。支付应等待经过验证的服务商 Webhook 再标记成功，不能信任浏览器传入的价格。当前结算不会创建订单或扣款。

## 模块边界怎么落地

页面目录负责路由形状和元数据，共享 Screen 负责可复用行为。`UiKit` 保持最小契约：若新增能力只属于某一套组件库，不要直接导入共享 Screen，而应给所有适配器提供可实现的公共接口，或只放在对应应用。`packages/contracts` 同时被客户端和服务端使用，不能引用数据库或密钥；`packages/server` 保持 server-only，Repository 先把数据库行转换为公开领域对象再返回。

Orval 生成客户端与自定义 `api` 封装目前并存。前者验证 OpenAPI 可以生成类型化 React Query 与 MSW 工件；共享 Screen 当前主要使用后者，后者统一同源路径、语言头、请求 ID 和错误信封。修改契约时需检查两条路径。AI 是事件流，因此页面用独立的 fetch/Reader，不把 SSE 当一次 JSON 响应。

例如 `/products?page=1junk`：薄 Route Handler 转到服务端商品处理器，`productPageSchema` 在访问仓储前拒绝参数，`fail()` 返回本地化 400 与 UUID 请求 ID，客户端转成 `ApiError`，共享页面显示重试状态。如果代理返回 HTML，客户端则报非法 API 响应并保留本地请求 ID，不让每个页面自行猜错误格式。合法商品 ID 才进入仓储；设置了 `DATABASE_URL` 但数据库不可达会报错，不会静默切成内置数据。三个应用同时运行意味着三个 Node 进程、三个数据库池，以及三个互不共享的浏览器购物车。

进一步阅读：[前端](/zh/frontend)、[电商](/zh/commerce)、[认证](/zh/authentication)、[AI](/zh/ai)、[后端](/zh/backend)和[改进路线](/zh/roadmap)。

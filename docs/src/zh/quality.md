# 工程检查、测试与变更流程

交付前需要运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`；`pnpm check` 会依次串起来。它们分别检验格式/规则、类型、单元行为与生产构建。单测通过不等于 Next.js 构建通过，构建通过也不等于移动路径能完成。

`typecheck` 与 `build` 要**串行**执行。Next.js 构建会重写 `.next/types`；若 TypeScript 同时读取，可能因旧文件清单报临时的 TS6053 缺文件错误。`pnpm check` 已按安全顺序执行。遇到该错误时先等构建结束，再重跑 `pnpm typecheck`，之后再判断源码问题。

| 命令 | 覆盖 |
| --- | --- |
| `pnpm format:check` | Oxfmt 检查源代码/配置；Markdown 被排除 |
| `pnpm lint` | 格式、类型感知 Oxlint、Next/React ESLint |
| `pnpm typecheck` | Turbo 中各 workspace 类型检查 |
| `pnpm test` | Zustand、Zod、SSE、API/HTTP 边界的 Vitest |
| `pnpm build` | 三套 Next.js 与 VitePress 的生产构建 |
| `pnpm test:e2e:*` | 指定应用的 Playwright 移动关键路径 |

`playwright.config.ts` 根据 `E2E_APP` 选 6777/6778/6779，默认 Ant Design Mobile；没有已有服务器时由 Playwright 启动。浏览器工程使用 Pixel 7 大小的 Chrome。现有 E2E 只覆盖浏览/加购物车、320px 横向溢出和语言选择器打开；**尚未**覆盖真实订单、支付、服务端会话撤销、PostgreSQL 集成或模型 Provider 错误，这些业务目前也未实现。

单测靠近各 package 的 `src/__tests__`，重点查状态转换、解析、校验与请求边界。新增接口时要同时测试有效与无效请求，并对一个实际运行的 Route Handler 核对内容类型、状态、语言和请求 ID；改 Store 时测试转移和持久化假设；移动关键路径加入 Playwright，涉及固定控制区时检查 320px、安全区和软键盘。

接口变更先编辑 `openapi/schema.yaml`、运行 `pnpm api:generate`、审生成差异，再同步 `packages/contracts`、服务端与自定义客户端。数据库变更修改 `packages/server/src/db/schema.ts`，运行 `pnpm db:generate` 后审 SQL，并在可销毁 PostgreSQL 上迁移验证。最后同步三语言文档、构建文档和运行全部检查。[VS Code](/zh/editor) 的任务是这些 pnpm 命令的快捷入口。

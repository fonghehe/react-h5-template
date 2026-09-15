# React H5 Template

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

这是基于 Next.js 16 与 React 19 的移动 Web monorepo，包含三套可独立启动的 UI 应用。Ant Design Mobile、NutUI React 和 Arco Mobile 共享业务页面、API 契约、服务端处理器及 PostgreSQL 仓储。VitePress 文档以英文为主，中文和日文有对应主题。

## 已包含的能力

- 三套独立 Next.js 应用，覆盖相同的商品、购物车、登录、个人中心、移动 Web API 示例与 AI 演示路径。
- 共享 `UiKit` 契约和三套组件库适配器；公共业务页面不直接依赖某一套 UI 库。
- 同源 HTTP 客户端、Zod 请求校验、OpenAPI 契约、Orval 生成客户端/MSW 辅助文件，以及带请求 ID 的归一化错误。
- PostgreSQL 17 + Drizzle 商品/用户仓储；未设置 `DATABASE_URL` 时使用内置演示数据。
- TanStack Query 管商品等远程状态，Zustand 管本地购物车、会话和语言偏好，React Hook Form 管复杂表单。

这是可运行模板，**不是生产电商系统**。结算只进行本地确认，不创建订单或扣款；AI 接口流式返回演示回答，没有接入真实模型；退出会清掉浏览器 token，但服务端不会撤销它。接入真实订单、支付和会话前，先看[架构改进路线](./docs/src/zh/roadmap.md)。

## 本地启动

需要 Node.js 22.18+、pnpm 11+。从仓库根目录运行：

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会交互选择一个工作区。也可以用固定端口的直接命令：

| 应用 | 命令 | 地址 |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| 文档站 | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

`pnpm dev:all` 同时启动四个工作区。项目里的 `compose.yaml` **只启动 PostgreSQL**；这些 Next.js 应用和 VitePress 由上述命令运行在主机。三个应用端口是三个不同的浏览器 origin，本地购物车与会话不会自动互通。演示账号为 `user / 123456`、`admin / 123456`。

## 使用 PostgreSQL

复制 `.env.example` 为 `.env.local`，核对 `DATABASE_URL` 指向目标数据库，然后：

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`pnpm db:setup` 会迁移并写种子到 `DATABASE_URL` 指定的数据库。未设置 URL 时商品和用户仓储读内置数据；设置了 URL 但数据库不可达时请求会报错，不会静默回退。生产环境必须设置不可预测的长 `AUTH_SECRET`，且它和 `DATABASE_URL` 都不能放进 `NEXT_PUBLIC_*` 变量。

## 目录与完整文档

```text
apps/h5-*             三套 Next.js 应用及轻量 API 导出
packages/mobile-ui    共享业务页面与 Provider
packages/ui-*         Ant Design Mobile、NutUI、Arco 适配器
packages/api-client   同源请求、SSE 解析与生成客户端
packages/contracts    领域类型与 Zod 请求 Schema
packages/server       认证、处理器、仓储、Drizzle 表结构
packages/stores       浏览器会话、语言偏好和本地购物车
packages/i18n         五语言应用词典
openapi/              生成客户端前先更新的 HTTP 契约
drizzle/              版本化 PostgreSQL 迁移
docs/                 英中日三语言 VitePress 指南
```

可以从[中文文档首页](./docs/src/zh/index.md)开始；[英文](./docs/src/index.md)和[日文](./docs/src/ja/index.md)入口也在这里。专题页说明[前端状态](./docs/src/zh/frontend.md)、[电商流程](./docs/src/zh/commerce.md)、[认证](./docs/src/zh/authentication.md)、[AI 流](./docs/src/zh/ai.md)、[API/数据库](./docs/src/zh/backend.md)、[测试](./docs/src/zh/quality.md)、[VS Code 文件嵌套与调试](./docs/src/zh/editor.md)和[部署](./docs/src/zh/deployment.md)。三种语言都有同一套 13 个主题路径。

## 检查与代码生成

```bash
pnpm lint          # Oxfmt、Oxlint、ESLint
pnpm typecheck     # 各 workspace 类型检查
pnpm test          # Vitest 单元测试
pnpm build         # 三套 Next.js 应用与 VitePress
pnpm test:e2e:antd # 一套 UI 的 Playwright 移动旅程
pnpm api:generate  # OpenAPI -> packages/api-client 生成代码
pnpm db:generate   # Drizzle 表结构 -> SQL 迁移
pnpm check         # lint -> typecheck -> test -> build
```

接口契约变更先改 `openapi/schema.yaml`，再生成客户端。`typecheck` 和 `build` 要串行执行，因为 Next.js 构建会重写 `.next/types`。[.vscode 配置](./.vscode/settings.json)提供相同的 pnpm 任务及独立的服务端/浏览器调试入口。

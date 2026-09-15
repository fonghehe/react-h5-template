---
layout: home
hero:
  name: React H5 Template
  text: 面向 2026 的移动全栈模板
  tagline: 三套移动 UI，共享一套 React 业务、Next.js Route Handler 与 PostgreSQL 数据层。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/getting-started
    - theme: alt
      text: 了解架构
      link: /zh/architecture
features:
  - title: 三套可运行应用
    details: Ant Design Mobile、NutUI React 与 Arco Mobile 使用相同页面契约，各自保留组件库能力。
  - title: 前后端一体
    details: Next.js App Router 同时承载页面、Route Handler、会话边界和 PostgreSQL 数据访问。
  - title: 完整工程基线
    details: TypeScript、TanStack Query、Zustand、React Hook Form、Zod、OpenAPI、Orval、Vitest、Playwright、MSW、oxlint 与 oxfmt。
---

## 设计目标

这个仓库不是只展示首页的 UI 样板，而是从商品浏览、详情、购物车、结算、登录、个人中心、国际化和流式 AI 对话开始，提供可替换、可测试、可继续迭代的移动业务骨架。

三个应用共享 `packages/mobile-ui` 的页面与 `UiKit` 契约；差异只放在 `packages/ui-*` 适配器中。修改一次业务，三套应用同时生效。

当前结算只模拟本地确认，不会创建订单或处理支付；AI 流返回的是演示回答，没有接入真实模型。[架构与改进路线](/zh/architecture)列出真实业务需要补充的服务端边界。

## 按旅程阅读

先读[快速开始](/zh/getting-started)，决定使用内置数据还是本地 PostgreSQL。[前端](/zh/frontend)说明 Query、Zustand、表单和 UI 适配器的状态归属。[电商](/zh/commerce)沿商品列表、详情、购物车到演示结算，指出第一个需要补的服务端订单边界。[认证](/zh/authentication)说明登录签名、`/api/user` 校验和本地退出的限制。[AI 流式协议](/zh/ai)展示 SSE 请求、事件与流前/流中错误区别。

[后端](/zh/backend)把 API 方法、状态码、仓储与数据库表连起来；[国际化](/zh/internationalization)区分五语言 UI、三语言文档以及部分未翻译的数据库字段；[工程质量](/zh/quality)列出现有检查和真实测试覆盖；[VS Code](/zh/editor)提供与 pnpm 命令一致的编辑/调试入口；[部署](/zh/deployment)说明三个独立服务器与文档发布；[改进路线](/zh/roadmap)把未来商用能力分阶段安排。

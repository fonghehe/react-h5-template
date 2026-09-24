# 前端组织与状态归属

## 三个应用、一套共享页面

`apps/h5-antd-mobile`、`apps/h5-nutui`、`apps/h5-arco-mobile` 是独立 Next.js 应用。各自的 `src/app` 只负责路由、布局、元数据和轻量 API 导出。业务页面通常引入 `packages/mobile-ui` 的共享 Screen；应用入口再通过 `AppProviders` 注入各自的 `packages/ui-*` 适配器。共享页面通过 `useUi()` 取得按钮、输入框、底部导航、加载状态、弹窗和提示，而不是直接导入某一套组件库。改共享 Screen 会同时影响三个应用，组件库特殊处理只改所属适配器。

| 路由 | 页面能力 | 状态归属 |
| --- | --- | --- |
| `/products`、`/products/[id]` | 商品分页、详情、下拉刷新 | TanStack Query |
| `/cart`、`/checkout` | 选择、数量、演示结算表单 | Zustand 购物车、React Hook Form |
| `/login`、`/member` | 登录、资料展示、语言选择 | Zustand 会话；`/api/user` 可用于独立服务端校验 |
| `/ai` | 流式演示对话 | 页面内消息与 SSE Reader |
| `/examples/*` | Query、请求封装、移动 Web API | 依具体示例而定 |

三个应用使用不同端口，也就是不同浏览器 origin；本地购物车和会话不会跨应用自动同步。根路径进入移动页面集，开发端口见[快速开始](/zh/getting-started)。

## Query、Zustand 与表单

`AppProviders` 为每个应用树建立 `QueryClient`，查询过期时间为 30 秒、失败重试一次、不在窗口聚焦时自动重取。商品列表的键是 `['products', locale]`，详情是 `['product', id, locale]`；切换语言会使用不同缓存，不把远程商品列表复制进 Zustand。

商品列表、详情和分页示例把 Query 提供的 `signal` 传给 API 客户端与 `fetch`。查询失去订阅或被取消时，可以中止尚未完成的请求；取消不会被封装成网络错误。商品列表的购物车数量由独立的 `CartLink` 订阅，数量变化只更新角标，不会重新渲染整份商品列表。

`packages/stores/src/session.ts` 保存语言、bearer token 和显示用用户；`cart.ts` 保存商品快照、数量（1 至 99）和选中状态。两者都延迟到客户端挂载后从浏览器存储恢复，以免服务端渲染时访问 `localStorage`。购物车总额根据旧商品快照计算，不能作为真实订单价格。详情页的收藏心形只保存在组件状态，没有收藏接口。


NutUI 的 Toast 和确认弹窗由 `ConfigProvider` 内的 `NutuiFeedback` 统一渲染，避开该版本静态方法依赖的旧 ReactDOM 接口，兼容 React 19。Toast 替换时会重新计时，卸载时清理计时器并取消尚未完成的确认。

## 移动布局与新增页面

`MobileShell` 为主页面显示底部导航，在登录、购物车、结算、AI、商品详情隐藏。共享样式处理安全区域、动态视口、触控区域和固定结算栏。移动示例覆盖网络、分享、剪贴板和能力降级。新增固定按钮时应在 320px 屏幕和软键盘弹出时验证内容可达。

新增业务页面时，先决定数据归属：远程数据放 Query，购物车与偏好放 Zustand，表单编辑用 React Hook Form；若调用服务端，先更新 `packages/contracts` 与 OpenAPI，再实现共享 Screen 和三个薄路由。只有三个适配器都能提供的新能力才进入 `UiKit`。

Arco 的静态 Toast 和确认弹窗需要单独传入 `createRoot`，仅配置 `ContextProvider` 不足以初始化这些静态调用。NutUI 确认框使用原生模态 `dialog` 与 NutUI 按钮，保留键盘取消、焦点管理和当前语言。

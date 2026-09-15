# 快速开始

## 环境与运行模式

需要 Node.js 22.18+、pnpm 11+。从仓库根目录安装依赖。三套 Next.js 应用是独立服务，另有一个 VitePress 文档工作区。只体验 UI 时 PostgreSQL 可不启动：商品和账号仓储使用内置演示数据，购物车与会话保存在当前浏览器 origin。

| 模式 | 主机/容器进程 | 数据来源 |
| --- | --- | --- |
| 演示 | 主机上一套 Next.js 应用，可选文档站 | 内置商品/用户，浏览器本地购物车 |
| 数据库开发 | 主机上 Next.js；Docker 中 PostgreSQL 17 | 迁移与种子后的数据库商品/用户 |
| 四应用比较 | 主机上三套 Next.js + VitePress | 各应用有自己的同源 API 和本地存储 |

`compose.yaml` **只提供 PostgreSQL**，没有把三套应用或文档容器化。首次启动：

```bash
pnpm install
pnpm dev
```

`pnpm dev` 使用 `turbo-run` 交互选一个应用。也可以直接运行：

| 应用 | 命令 | 地址 |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| 文档 | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

比较全部时运行 `pnpm dev:all`。端口固定，已有进程占用会报错。三套 Next.js 的开发与构建使用 webpack，避开此前观察到的多实例 Turbopack 崩溃。结束一个进程后再启动同端口应用。

## 接入 PostgreSQL

将 `.env.example` 复制为 `.env.local`，确认 `DATABASE_URL` 指向 Compose 暴露的数据库，再执行：

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`db:setup` 先迁移再写种子，**会修改 `DATABASE_URL` 指定的数据库**。种子使用 upsert，重复执行会刷新演示商品和用户。若主机 5432 已被占用，应同时修改 Compose 映射端口与连接 URL。未设置 `DATABASE_URL` 才切换演示仓储；设置了但数据库不可达时会报错，不会静默回退。

演示账号是 `user / 123456` 与 `admin / 123456`。生产环境要配置不可预测的 `AUTH_SECRET`。`PGSSL=require` 可用于需要 TLS 的数据库，但现有连接池会关闭证书验证；真实部署应按提供商要求审查 TLS 策略。

## 验证与排错

打开商品页加入一件商品，进入购物车，再到个人中心切换语言。可以直接请求同源接口：

```bash
curl -H 'Accept-Language: en-US' 'http://127.0.0.1:6777/api/products?page=1&pageSize=2'
```

正常响应有 `code: 0`、商品页数据和 `requestId`，非法页码返回 `400` JSON。AI 接口只在消息有效时开始 SSE，输入错误在首字节前是 JSON。端口占用先停止已有服务；数据库读失败先核对 Compose 健康检查、URL/端口、迁移与种子是否指向同一库。编辑器诊断与 CLI 不一致时使用仓库 TypeScript SDK，参阅 [VS Code](/zh/editor)。当前结算是本地演示，边界见[电商流程](/zh/commerce)。

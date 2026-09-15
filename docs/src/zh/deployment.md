# 构建、部署拓扑与文档发布

`pnpm build` 构建三套**独立** Next.js 应用及 VitePress 文档。生产部署要选哪些应用对外提供；每套应用都有自己的 Next.js 服务和同源 `/api` Route Handler，仓库并没有单独部署的公共 API 进程。不能只发布静态页面就期待认证、商品或 SSE 接口工作。若三套都部署，需要各自的域名/路径路由和服务端环境变量；设置 `DATABASE_URL` 后三个进程也分别建立连接池。

单独构建使用 `pnpm build:antd`、`pnpm build:nutui`、`pnpm build:arco`，然后运行各应用包的 `start`。脚本目前绑定 `127.0.0.1` 与固定端口；容器或远程主机要另设计网卡、端口和反向代理。`compose.yaml` 只给本地 PostgreSQL 17，没有应用 Dockerfile、代理、Kubernetes 配置、就绪接口或生产进程守护。

生产必须配置 `AUTH_SECRET`；持久化商品/用户还需要 `DATABASE_URL`，并在服务前迁移。没有数据库 URL 会使用内置演示用户与公开密码。`PGSSL=require` 的现有配置把证书验证关掉，不能当作验证服务器身份的 TLS；应按托管数据库要求设计证书策略。密钥轮换、备份、连接容量、日志都要补足。当前结算/AI 是演示，退出不能在服务端撤销 bearer token，不应承载真实订单或收款。

`pnpm build:docs` 生成英、中、日三套 VitePress 页面；`docs/.vitepress/config.mts` 的 base 是 `/react-h5-template/`。首次发布前，打开 [Settings → Pages](https://github.com/fonghehe/react-h5-template/settings/pages)，把 Source 设为 **GitHub Actions**，以启用 Pages。单纯上传 artifact 不会启用站点：Pages 关闭时 `actions/deploy-pages` 创建部署会返回 HTTP 404。`actions/configure-pages` 会配置已启用的站点，但默认 `GITHUB_TOKEN` 无法完成首次启用。该 workflow **只发布文档**，不发布 Next.js 服务。

设置来源后，将文档/配置变更推送到 `main`，或在 **Deploy Docs to GitHub Pages → Run workflow** 手动运行。确认 `deploy` job 成功，再访问 `https://fonghehe.github.io/react-h5-template/`；本地构建成功或 artifact 已上传，都不能证明线上站点可用。

```bash
pnpm build:docs
pnpm --filter @rh5/docs preview
```

本地预览占用 6780。仓库名或托管路径变更时同步调整 VitePress base 与链接。真实商用上线前还需完成[改进路线](/zh/roadmap)中的订单、会话和运营验证。

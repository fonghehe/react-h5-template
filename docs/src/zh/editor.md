# VS Code 工作区配置

从仓库根目录打开 VS Code，才能正确解析 pnpm workspace、本地 TypeScript SDK、调试路径和任务。`.vscode` 是对现有 pnpm 命令的快捷入口，不替代 CLI 检查。

`settings.json` 指向仓库的 `node_modules/typescript/lib`，以 Oxc 扩展调用本地 Oxfmt，保存时格式化，并把 `.next`、`.turbo`、VitePress 构建与缓存排除出搜索和文件监听。`extensions.json` 推荐 Oxc、ESLint、Tailwind CSS、Playwright 与拼写检查。扩展未安装时，保存格式化可能不工作，仍可运行 `pnpm format`；最终以 `pnpm lint` 的 Oxfmt、Oxlint、ESLint 结果为准。Markdown 被本仓库的 formatter 配置排除，文档不要依赖编辑器自动排版。

## Explorer 文件组织

工作区启用文件嵌套，关联文件默认折叠。根目录的 `README.md` 收纳中文和日文 README；根目录的 `package.json` 收纳 pnpm workspace、锁文件及 Turbo 配置。三个应用各自的 `next.config.ts` 收纳 `next-env.d.ts` 和 `postcss.config.mjs`；`.vscode/settings.json` 收纳调试、任务和扩展配置。同目录内，`*.ts` 或 `*.tsx` 只收纳同名的 test/spec 文件；`tsconfig.json` 收纳 TypeScript 配置变体。

Explorer 隐藏 `.next`、`.turbo`、VitePress `dist`/`cache`、`coverage`、`node_modules` 和 Playwright 报告等生成目录。这只是编辑器视图设置，不会删除文件，也不影响 Git。生成的 API 客户端仍可从 Explorer 打开以核对接口契约，但默认搜索会跳过它。若需要平铺关联文件，可用 **Explorer → More Actions → Toggle File Nesting**；若要显示构建目录，修改工作区的 `files.exclude`。

在 **Terminal → Run Task** 可运行四套开发入口、`pnpm check`、单测、移动 E2E、OpenAPI 生成和数据库 setup。数据库任务会迁移并写种子到 `DATABASE_URL` 指定的库，需要先核对连接目标。开发任务占用固定端口和专用终端，结束前不要启动同一应用第二份进程。

**Run and Debug** 有三套 `node-terminal` 服务端入口和对应 Chrome 浏览器入口。先启动服务端，看到 `Ready` URL 后再启动浏览器；在 `packages/server` 设断点查 Route Handler，在 `packages/mobile-ui` 查共享前端。服务端使用直接的 `pnpm dev:*`，绕开交互选择器。停止调试时也结束服务端终端以释放端口。当前 Next.js 随项目提供的调试指南推荐这种 `node-terminal` 方式，并说明 monorepo 要配置工作目录。

扩展与调试配置的来源可参阅 [Oxfmt 官方编辑器指南](https://oxc.rs/docs/guide/usage/formatter/editors)、[VS Code 文件嵌套说明](https://code.visualstudio.com/updates/v1_67)及 [VS Code 调试配置指南](https://code.visualstudio.com/docs/debugtest/debugging-configuration)。

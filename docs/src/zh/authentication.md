# 认证与会话生命周期

`/login` 用 React Hook Form 和 `loginSchema` 在页面校验，随后向同源 `/api/auth/login` 发 JSON。服务端再次校验并调用 `authenticateUser`：演示模式检查内置账号，PostgreSQL 模式读取用户并校验带盐的 `scrypt` 密码哈希。响应只包含公开用户字段和签名 bearer token。token 保存用户 ID、七天有效期，用 `AUTH_SECRET` 做 HMAC-SHA256 签名。

Zustand 会话把 token、显示用用户和语言保存在浏览器。`/api/user` 需要 `Authorization: Bearer ...`；服务器独立验证签名、过期时间并重新从仓储读取公开用户，不能仅凭浏览器缓存用户决定权限。当前个人中心主要显示持久化的用户对象，所以页面显示“已登录”并不等于服务端 token 仍有效。

`/api/auth/logout` 目前只返回成功响应，不会在服务端撤销 token。个人中心调用它后会清空本地会话，即使请求失败也会清空；被复制的旧 token 在到期前仍可使用。这是模板演示会话，不能称作生产级退出。登录后的重定向只允许以单个 `/` 开头的站内路径，拒绝 `//` 协议相对地址。

生产环境必须设置不可预测的 `AUTH_SECRET`；开发环境才使用本地回退密钥。`DATABASE_URL` 和密钥都不能放在 `NEXT_PUBLIC_*`。真实会话方案要明确有效期、刷新/轮换、服务端撤销、设备管理与过期响应。若改用 HttpOnly Cookie，还需设计 `Secure`、`SameSite` 和状态修改请求的 CSRF 防护；同时加入登录限流与审计。改变认证传输要同步更新 OpenAPI、客户端和请求测试，因为当前 `/api/user` 只认 bearer header。

# Agent Handbook 协作规范

## 内容与读者
- 本仓库存放 Agent 的中文说明文档；当前首版为入门篇，面向没有 AI 或编程背景的读者。
- 教程优先使用自然语言与产品界面操作。终端命令只用于维护说明，不作为新手必需步骤。
- 解释“在哪里操作、提供什么、看到什么算成功”；功能不可用时提供真实可行的替代路线。
- 产品功能、菜单和可用性须核对官方资料，并标注日期、适用界面与来源；不得把示意图当成实际截图。
- 保留清晰、明亮、响应式的视觉风格；动态效果遵守 prefers-reduced-motion。

## 目录与验证
- GitHub Pages 根目录是 docs/，入口是 docs/index.html；新专题放入独立目录，以 index.html 为入口。
- 入门篇唯一源文件为 docs/guides/getting-started/index.html，避免维护多个副本。
- 新文章完成后才加入首页的可点击导航；预留目录不假装已有内容。
- 修改后运行 python3 scripts/check_site.py；布局或交互变更使用可用浏览器检查桌面与手机尺寸。
- 提交前检查无敏感资料；不提交访问凭据、个人信息截图、日志和其他服务的部署身份配置。

## 本机开发工具与共享下载
- 本机使用 Agent Tool Manager，项目 ID 为 mac-development。
- 下载文件前先使用管理器 download.find 或 download.fetch，命中后复用；官方发布包提供 SHA256。
- 共享缓存只读。已安装工具先查 ~/.local/bin 和 ~/AI_TOOLS/agent-tool-manager/bootstrap-inventory.json，避免重复安装。
- Broker 不可用时先检查 agent-tool-manager status，恢复后再下载。

## GitHub 身份
- GitHub 操作必须使用 gh-codex 和 git-codex；认证身份必须为专用 GitHub App shenk-codex。
- 不得以 shenk-ana 个人身份认证，不使用个人账号 GitHub 插件或个人 token。
- shenk-ana 可以是仓库所有者；仓库所有者不等于执行操作的认证身份。
- App 认证或权限不足时停止，不回退个人身份。管理 GitHub App 的浏览器操作须经用户明确授权。

## 远程操作
- 远程 Linux 操作必须先读取相关技能，并通过 bin/rsh 执行、保留 logs/ 会话日志。
- 服务器发布前读取 sk-server-deploy 及其引用规范。
- 新仓库首个提交必须包含本文件。

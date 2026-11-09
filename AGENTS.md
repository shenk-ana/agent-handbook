# Agent Handbook 协作规范

## 内容与读者
- 本仓库是《Agent 百科全书》的公开免费版，面向只用过聊天的普通用户和刚接触 Agent 的开发者。
- 内容由私有写作仓库导出；免费 / 付费范围以 docs/data/toc.js 的 access 字段为准，付费课在这里只有简介、学习目标和大纲。
- 不得把付费课正文、附录 B 全量工具目录或私有仓库的其他文件放进本仓库。
- 产品功能、菜单和可用性须核对官方资料；演示界面为自绘示意，不得当成真实截图。
- 不出现本机路径、个人邮箱、内部规范等私人信息；解锁说明只指向作者的 GitHub 主页。

## 目录与验证
- GitHub Pages 根目录是 docs/，入口是 docs/index.html；纯静态 HTML，必须能离线打开，不引用外部脚本、字体、图片。
- docs/ 整体由导出脚本生成，不手工修改；修正在私有写作仓库完成后重新导出。
- 修改后运行 node scripts/check.mjs docs，必须输出“没有错误”；布局或交互变化须在浏览器检查桌面、手机（375px）、浅色和深色模式。
- 提交前检查无敏感资料；不提交访问凭据、个人信息截图、日志和其他服务的部署身份配置。

## 本机开发工具与共享下载
- 本机使用 Agent Tool Manager，项目 ID 为 mac-development。
- 下载文件前先使用管理器 download.find 或 download.fetch，命中后复用；官方发布包提供 SHA256。
- 共享缓存只读。已安装工具先查 ~/.local/bin 和 ~/AI_TOOLS/agent-tool-manager/bootstrap-inventory.json，避免重复安装。
- Broker 不可用时先检查 agent-tool-manager status，恢复后再下载。

## GitHub 身份
- GitHub 操作必须使用 gh-codex 和 git-codex；认证身份必须为专用 GitHub App shenk-codex。
- Claude 系 Agent 使用 gh-claude 和 git-claude，认证身份为专用 GitHub App shenk-claude；规则同上。
- 不得以 shenk-ana 个人身份认证，不使用个人账号 GitHub 插件或个人 token。
- shenk-ana 可以是仓库所有者；仓库所有者不等于执行操作的认证身份。
- App 认证或权限不足时停止，不回退个人身份。管理 GitHub App 的浏览器操作须经用户明确授权。

## 远程操作
- 远程 Linux 操作必须先读取相关技能，并通过 bin/rsh 执行、保留 logs/ 会话日志。
- 服务器发布前读取 sk-server-deploy 及其引用规范。
- 新仓库首个提交必须包含本文件。

# Agent Handbook · 智能体使用手册

面向第一次接触 AI 的用户，逐步介绍如何用自然语言让 Agent 完成任务、沉淀技能，并在不同工具中复用方法。

**当前版本：入门篇 v1.0** · 内容核对日期：2026-11-02

- [文档首页 HTML](docs/index.html)（下载后在浏览器中打开）
- [入门篇 HTML](docs/guides/getting-started/index.html)
- [内容规划](ROADMAP.md)
- [贡献指南](CONTRIBUTING.md)

## 入门篇包含什么

- 第一次打开 AI 工具、提问、粘贴材料和检查结果。
- Chat、Work、Codex 的定位与本地工作目录的作用。
- 模型、思考强度、Skill、MCP、Subagent 等概念。
- 从会议整理到创建技能、在新对话中复用的完整实战。
- WorkBuddy、Qoder、TRAE、Claude Code、Cursor、Copilot 的对应概念与入口。
- 找不到功能、额度不足、未安装技能时的备用路线。

图示与预期结果均为教学示意，不冒充真实产品截图。产品能力、菜单、套餐与地区可用性可能变化，请以正文中的官方来源和当前账户为准。

## 仓库结构

```text
agent-handbook/
├── AGENTS.md                     # Agent 协作规则，随首个提交纳入
├── README.md
├── CONTRIBUTING.md
├── ROADMAP.md
├── CHANGELOG.md
├── docs/                         # GitHub Pages 发布根目录
│   ├── .nojekyll                 # 直接发布静态 HTML
│   ├── index.html                # 文档导航首页
│   ├── guides/
│   │   ├── getting-started/      # 已发布：入门篇 v1.0
│   │   │   └── index.html
│   │   ├── skills/              # 预留：技能专题
│   │   └── tools/               # 预留：工具专题
│   ├── examples/                # 预留：独立实战与示例材料
│   ├── reference/               # 预留：术语和来源索引
│   └── assets/css/              # 公共样式；图片等按需新增
└── scripts/check_site.py        # 静态文件与站内链接校验
```

入门篇保留单文件 HTML，便于单独下载或离线打开。后续新增文档使用各自目录下的 `index.html`，避免所有专题都堆在同一页。

## 本地查看

不需要安装依赖或执行构建。直接在浏览器中打开 `docs/index.html`。

维护者也可以启动静态服务：

```sh
python3 -m http.server 8000 --directory docs
```

内容修改后运行：

```sh
python3 scripts/check_site.py
```

这些命令供仓库维护者使用，面向读者的教程仍以自然语言和界面操作为主。

## 发布

仓库已按 GitHub Pages 的静态目录结构准备，发布源应选择 `main` 分支的 `/docs`。

当前 Pages 尚未开通：专用 App `shenk-codex` 创建 Pages 站点时收到 GitHub 403 权限拒绝。仓库创建和源码推送已完成。

仓库所有者可在 Settings → Pages → Build and deployment 中选择 Deploy from a branch，再选择 `main` 与 `/docs` 并保存。成功开通后，预计阅读地址为 https://shenk-ana.github.io/agent-handbook/ 。该地址目前不是已验证的发布结果。

开通后推送到 `main` 会更新站点，无需单独的前端打包工具。

不要将本地预览日志、账户配置、密钥、包含私人信息的截图或其他平台的发布配置提交到仓库。

## 使用范围

目前未指定开源许可证；公开可读不代表已授予任意转载或商用授权。需要再分发、修改发布或商用时，请先与仓库维护者确认。引用的第三方产品与资料权利归各自权利人所有。

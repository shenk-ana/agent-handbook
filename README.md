# Agent 百科全书 · 免费版

从“会用”到“懂原理”：以 Claude 为例，用动画演示和大白话讲清楚 AI Agent 是什么、怎么用好，以及它在底层是怎么运转的。

**适合谁**：只用过聊天、还没让 AI 替自己“办事”的普通用户，以及没怎么接触过 Agent 的开发者。

- [在线阅读](https://shenk-ana.github.io/agent-handbook/)
- 离线阅读：下载仓库，双击 `docs/index.html` 即可，不需要联网和安装任何东西

资料截至 2026-11。

## 免费版包含什么

| 课程 | 内容 |
|---|---|
| 第 0 课 怎么读这本书 | 两条阅读路线，演示播放器怎么用 |
| 第 1 课 从聊天到 Agent | Agent 和聊天到底差在哪 |
| 第 2 课 能力边界与幻觉 | 它会在哪里出错，怎么检查 |
| 第 3 课 Claude 家族地图 | 网页版、桌面端、Claude Code……该用哪个 |
| 第 4 课 第一次委托任务 | 怎么把一件事交代清楚 |
| 第 8 课 Artifacts | 让 Claude 做报告、网页和小工具 |
| 第 11 课 上手 Claude Code | 开发者入门：CLI、桌面端与 IDE |
| 第 15 课 Agent 循环 | 原理入门：Claude 是怎么一步步把事做完的 |
| 附录 A 百科术语表 | 97 个术语：大白话解释、类比和技术定义 |
| 附录 C 速查卡 | 任务简报模板、安全清单、常用入口和命令 |

## 完整版

全书共 24 课和 4 个附录。目录里标 🔒 的课程是付费内容，免费版可以看到每一课的简介、学习目标和大纲，包括：

- **用好 Claude**：上下文与记忆、连接器与 MCP、Skills、安全与隐私、实战案例集
- **Claude Code 实战**：权限模式与 CLAUDE.md、Subagents 与 Hooks、MCP 配置与选型
- **Agent 原理**：token 与上下文、工具调用、规划、多 Agent、评测、安全工程、用 Agent SDK 自己造
- **前沿**：Computer use 与长时任务
- **附录 B 工具推荐目录**：联网核实过的 Skills、MCP 服务器、插件和 SDK

想解锁完整版，请到 [GitHub 主页](https://github.com/shenk-ana) 联系作者。

## 仓库结构

```text
docs/                 GitHub Pages 发布根目录（纯静态 HTML，可离线打开）
  index.html          首页与全书目录
  lessons/            每课一个页面；付费课只有简介和大纲
  glossary.html       附录 A 术语表
  cheatsheet.html     附录 C 速查卡
  assets/ data/       样式、脚本、目录与术语数据
scripts/check.mjs     一致性检查：node scripts/check.mjs docs
```

`docs/` 由私有写作仓库的导出脚本生成，不在这里直接修改。发现错误请提 issue。

## 使用范围

目前未指定开源许可证；公开可读不代表已授予转载或商用授权。需要转载、修改后发布或商用时，请先与作者确认。书中提到的第三方产品与资料，权利归各自权利人所有。演示界面均为自绘示意，不是真实产品截图。

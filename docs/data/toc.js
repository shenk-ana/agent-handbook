/* 全书目录（唯一来源）。侧栏、首页目录、上一课/下一课都从这里生成。
   status: "ready" 已完成 | "draft" 写作中 | "planned" 计划中
   access: "free" 进入公开免费版；不写即为付费内容（公开版只放大纲和解锁说明，见 scripts/export-public.mjs）
   edition: 私人版不写；导出脚本在公开版里写成 "public"，book.js 据此给付费课加锁
   新增或改名课程只改这里，文件名必须是 lessons/<n 两位>-<slug>.html */
window.BOOK = {
  title: "Agent 百科全书",
  subtitle: "从会用到懂原理：以 Claude 为例的 AI Agent 教程",
  asOf: "2026-11",
  parts: [
    {
      id: "p0", num: "第 0 部分", title: "导读", audience: "所有人",
      lessons: [
        { n: 0, slug: "how-to-read", title: "怎么读这本书", status: "ready", access: "free" }
      ]
    },
    {
      id: "p1", num: "第 1 部分", title: "认识 Agent", audience: "所有人",
      lessons: [
        { n: 1, slug: "from-chat-to-agent", title: "从聊天到 Agent", status: "ready", access: "free" },
        { n: 2, slug: "limits", title: "能力边界与幻觉", status: "ready", access: "free" },
        { n: 3, slug: "claude-family", title: "Claude 家族地图：该用哪个", status: "ready", access: "free" }
      ]
    },
    {
      id: "p2", num: "第 2 部分", title: "用好 Claude", audience: "普通用户",
      lessons: [
        { n: 4, slug: "first-task", title: "第一次委托任务", status: "ready", access: "free" },
        { n: 5, slug: "context", title: "上下文：Projects、文件、记忆", status: "ready" },
        { n: 6, slug: "connectors-mcp", title: "连接器与 MCP 入门", status: "ready" },
        { n: 7, slug: "skills", title: "Skills：让 Claude 学会固定流程", status: "ready" },
        { n: 8, slug: "artifacts", title: "Artifacts：做报告、网页和小工具", status: "ready", access: "free" },
        { n: 9, slug: "safety", title: "安全与隐私", status: "ready" },
        { n: 10, slug: "cases", title: "实战案例集", status: "ready" }
      ]
    },
    {
      id: "p3", num: "第 3 部分", title: "Claude Code 实战", audience: "开发者 · 进阶用户",
      lessons: [
        { n: 11, slug: "claude-code-basics", title: "上手 Claude Code：CLI、桌面端与 IDE", status: "ready", access: "free" },
        { n: 12, slug: "claude-code-config", title: "权限模式、CLAUDE.md 与记忆", status: "ready" },
        { n: 13, slug: "claude-code-extend", title: "Subagents、Hooks、命令与插件", status: "ready" },
        { n: 14, slug: "mcp-in-practice", title: "MCP 配置实战与选型", status: "ready" }
      ]
    },
    {
      id: "p4", num: "第 4 部分", title: "Agent 原理", audience: "开发者",
      lessons: [
        { n: 15, slug: "agent-loop", title: "Agent 循环：一步步把事做完", status: "ready", access: "free" },
        { n: 16, slug: "tokens-context", title: "token、上下文窗口与压缩", status: "ready" },
        { n: 17, slug: "tool-use", title: "工具调用与 MCP 协议", status: "ready" },
        { n: 18, slug: "planning", title: "规划与推理", status: "ready" },
        { n: 19, slug: "multi-agent", title: "多 Agent 系统", status: "ready" },
        { n: 20, slug: "evals", title: "评测与可观测性", status: "ready" },
        { n: 21, slug: "security-engineering", title: "安全工程", status: "ready" },
        { n: 22, slug: "build-an-agent", title: "自己造：Agent SDK 与 Claude API", status: "ready" }
      ]
    },
    {
      id: "p5", num: "第 5 部分", title: "前沿", audience: "所有人",
      lessons: [
        { n: 23, slug: "frontier", title: "Computer use 与长时任务", status: "ready" }
      ]
    }
  ],
  appendix: [
    { id: "glossary", title: "附录 A · 百科术语表", href: "glossary.html", status: "ready", access: "free" },
    { id: "tools", title: "附录 B · 工具推荐目录", href: "tools.html", status: "ready" },
    { id: "cheatsheet", title: "附录 C · 速查卡", href: "cheatsheet.html", status: "ready", access: "free" },
    { id: "changelog", title: "附录 D · 更新日志", href: "changelog.html", status: "ready", access: "free" }
  ]
};

/* 由 scripts/export-public.mjs 生成：公开免费版 */
window.BOOK.edition = "public";

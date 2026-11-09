/* 术语分片 f：由写作 agent F（第 19–22 课）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "multi-agent", term: "多 Agent 系统", en: "Multi-Agent System", cat: "arch",
    plain: "让几个 Agent 分工合作完成一件事：有的分头去查、有的负责汇总或检查，各自的“桌面”互不干扰。",
    analogy: "主编派几个记者分头采访，自己只看交回来的稿子。",
    tech: "多个拥有独立上下文的模型实例，通过代码或工具调用协调。常见模式有编排者–执行者、流水线、评审者。收益来自上下文隔离、并行与专长分工；代价是 token 成倍增加、交接丢信息、结果需要合并核对。",
    lessons: [19], resources: ["claude-agent-sdk-python"]
  },
  {
    id: "orchestrator-worker", term: "编排者–执行者", en: "Orchestrator-Worker", cat: "arch",
    plain: "一个 Agent 负责拆任务、派活、汇总，另外几个只管把分到的那一块做完交回来。",
    tech: "多 Agent 的主流模式：编排者（orchestrator）把任务分解后派给执行者（worker / subagent），执行者在独立上下文中完成并只回传摘要，由编排者比较与合并。Claude Code 主会话通过 Agent 工具派发子 Agent 即为此结构。",
    lessons: [19]
  },
  {
    id: "git-worktree", term: "git worktree", en: "Git Worktree", cat: "dev",
    plain: "同一个代码仓库拉出几份互相独立的工作文件夹，各在各的分支上改，几个 Agent 同时改代码也不会互相覆盖。",
    tech: "git 的多工作目录机制：多个检出共享同一个 .git 历史，各自有独立的文件与分支。Claude Code 的 --worktree（-w）在 .claude/worktrees/<name>/ 下创建，子 Agent 可用 isolation: worktree 隔离。它只隔离文件，不隔离端口、数据库等外部资源。",
    lessons: [19]
  },
  {
    id: "eval", term: "评测", en: "Evaluation (Eval)", cat: "dev",
    plain: "用一组固定的真实任务和明确的打分标准，检验 Agent 做得好不好，改了提示词或配置后再跑一遍对比。",
    analogy: "改了菜谱，就按同一张评分表再请几个人试吃一遍。",
    tech: "由测试用例（输入、期望或判分标准）与判分方式（代码判定、LLM 评委、人工）组成的可重复测量。对 Agent 还要看过程指标：工具调用次数、token、耗时、是否越权。",
    lessons: [20], resources: ["claude-cookbooks"]
  },
  {
    id: "llm-as-judge", term: "LLM 评委", en: "LLM-as-a-Judge", cat: "dev",
    plain: "让另一个 AI 按评分标准给输出打分。快、便宜、能判断“语气好不好”这类规则写不出来的东西，但它也有偏好，需要人抽查校准。",
    tech: "用模型按 rubric 给输出评分或比较。官方建议：评分标准具体、输出可量化（如 correct/incorrect 或 1–5 分）、让评委先推理，并用与被测不同的模型。研究中观察到的偏差包括位置偏差、偏爱更长的回答、偏爱同源模型的输出。",
    lessons: [20]
  },
  {
    id: "trace", term: "运行轨迹（trace）", en: "Trace", cat: "dev",
    plain: "一次 Agent 运行从头到尾的完整记录：每一步想了什么、调用了什么工具、返回了什么、花了多少时间和 token。",
    tech: "按时间顺序记录的请求、工具调用与结果、耗时、用量等事件；在 OpenTelemetry 中由带父子关系的 span 组成。Claude Code 的会话记录（JSONL 文件）、Ctrl+O 记录视图和 OpenTelemetry traces（beta）都可用来复盘。",
    lessons: [15, 20]
  },
  {
    id: "observability", term: "可观测性", en: "Observability", cat: "dev",
    plain: "让你能看清 Agent 在做什么、花了多少、哪里出错的一套记录和统计手段。看不见，就没法改进。",
    tech: "通过指标（metrics）、日志 / 事件（logs）与链路（traces）观测系统行为。Claude Code 支持 OpenTelemetry 导出（CLAUDE_CODE_ENABLE_TELEMETRY=1），提示词内容默认不记录；Python SDK 在注册了 tracer provider 时为每个请求发出 span。",
    lessons: [20]
  },
  {
    id: "threat-model", term: "威胁模型", en: "Threat Model", cat: "safety",
    plain: "动手防御前先想清楚：谁可能来捣乱、从哪里进来、能造成什么损失。对 Agent 来说，核心是“它能读到什么 × 它能做什么”。",
    tech: "对资产、攻击者、入口与影响的系统化分析。Agent 的典型高风险组合是：能接触私密数据、会读入不可信内容、拥有对外通信或写操作的能力；三者同时存在时，提示注入就可能导致数据外泄。",
    lessons: [9, 21]
  },
  {
    id: "trust-boundary", term: "可信边界", en: "Trust Boundary", cat: "safety",
    plain: "分清哪些话算“指令”、哪些只是“数据”的那条线：你和系统设定的话是指令，网页、文件、工具返回的内容都只是数据。",
    tech: "系统中信任级别发生变化的边界。在 Agent 中，系统提示词与用户消息在边界内，tool_result、网页、仓库文件、MCP 返回等在边界外；跨边界的内容不应获得执行权，需配合权限、隔离与确认来约束。",
    lessons: [15, 21]
  },
  {
    id: "secret-management", term: "密钥管理", en: "Secret Management", cat: "safety",
    plain: "API 密钥、密码、令牌这类“钥匙”放在哪、谁能看到、泄露了怎么换。原则是不写进代码、不贴进对话、不让 Agent 随手读到。",
    tech: "凭据的存储、分发、轮换与撤销。实践：用环境变量或系统钥匙串而非硬编码；用 Read 拒绝规则挡住 .env 等文件；给 Agent 发短期、窄权限的令牌；发现泄露立即轮换。",
    lessons: [21]
  },
  {
    id: "supply-chain-risk", term: "供应链风险", en: "Supply Chain Risk", cat: "safety",
    plain: "你装的插件、Skill、MCP 服务器都是别人写的，它们本身有问题，或者某天被改坏了，你的 Agent 就跟着出问题。",
    tech: "通过第三方依赖引入的风险：恶意或被篡改的 MCP 服务器、插件、Skills、npm/pip 包、仓库内的 hooks 与 .mcp.json。缓解：只用可信来源、锁定版本、安装前审阅、组织级托管配置、最小权限与沙箱。",
    lessons: [9, 21]
  },
  {
    id: "managed-agents", term: "Managed Agents", en: "Claude Managed Agents", cat: "claude",
    plain: "Anthropic 帮你托管的 Agent：循环、工具执行和运行环境都由平台提供，你通过 API 下达任务、看结果。",
    tech: "Claude API 上的托管 Agent 运行框架（beta，需 managed-agents-2026-04-01 beta 头），核心概念为 Agent、Environment、Session、Events，会话可运行在 Anthropic 托管或自托管的沙箱中，适合长时间、异步任务。",
    lessons: [19, 22]
  },
  {
    id: "streaming", term: "流式输出", en: "Streaming", cat: "dev",
    plain: "回答一边生成一边显示，不用等全部写完。用户能更早看到进展，长任务也不容易因为连接空闲而超时。",
    tech: "Messages API 设置 stream: true，以 server-sent events 增量返回（message_start、content_block_delta、message_delta、message_stop 等）。Python SDK 提供 client.messages.stream() 与 text_stream、get_final_message()。错误也可能在 200 响应之后以 error 事件出现。",
    lessons: [22], resources: ["anthropic-sdk-python"]
  }
]);

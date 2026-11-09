/* 术语分片 e：由写作 agent E（第 16–18 课）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "tokenizer", term: "分词器", en: "Tokenizer", cat: "arch",
    plain: "把文字切成一个个 token 的“切菜刀”。同一句话交给不同的分词器，切出来的块数可能不一样。",
    analogy: "像把一句话拆成拼图块：常见的词是一大块，生僻字可能被拆成好几小块。",
    tech: "把文本映射为子词单元序列的组件。分词方式随模型而变：官方说明 Claude 4.7 及之后的模型换了新分词器，同样的文字大约多出 30% 的 token。精确数字以 count_tokens 接口为准，不要用其他厂商的分词器估算。",
    lessons: [16], resources: ["anthropic-sdk-python"]
  },
  {
    id: "prompt-caching", term: "提示缓存", en: "Prompt Caching", cat: "dev",
    plain: "每一轮请求开头那一大段不变的内容（系统说明、工具清单、早先的对话），服务器记住了就不用重新处理，更快也更便宜。",
    analogy: "像复印店记住了你上次那份文件的前 50 页，这次只需要处理新加的几页。",
    tech: "按前缀精确匹配复用已处理的输入。前缀顺序为 tools → system → messages，任何一处改动都会让它之后的缓存失效。默认有效期 5 分钟，可选 1 小时；写入按基础输入价的 1.25 倍（1 小时为 2 倍）计费；读取一般约 0.1 倍，Opus 5.5、Sonnet 5.5 为 0.05 倍，Fable 5.1 为 0.025 倍（截至 2026-11，以官方价格页为准）。Claude Code 自动使用。",
    lessons: [16], resources: ["anthropic-sdk-python"]
  },
  {
    id: "context-editing", term: "上下文编辑", en: "Context Editing", cat: "dev",
    plain: "对话变长时，把很早以前的工具结果（比如读过的大文件）清掉，只留一张“这里原来有结果，已清理”的小纸条。",
    analogy: "桌上旧的草稿纸收进抽屉，只在原处留一张便签。",
    tech: "Claude API 的 beta 功能（context_management.edits）。clear_tool_uses_20250919 在超过阈值后清理较早的工具结果，默认保留最近 3 次；clear_thinking_20251015 清理较早的思考块。与压缩不同：它按规则删除特定内容，而不是把整段历史改写成摘要。",
    lessons: [15, 16], resources: ["anthropic-sdk-python"]
  },
  {
    id: "context-engineering", term: "上下文工程", en: "Context Engineering", cat: "arch",
    plain: "精心安排每一轮放进上下文的内容：该有的都有，没用的不放，顺序也讲究。比单纯“写好一句提示词”范围更大。",
    analogy: "不只是想好对助理说什么，还要决定桌上摆哪些资料、按什么顺序摆。",
    tech: "围绕有限上下文窗口的设计实践：只放高信号信息、稳定内容放前面以利缓存、精简工具结果、按需加载工具和资料、把长期信息放进外部记忆、用子 Agent 隔离大量阅读、在自然断点压缩。",
    lessons: [16]
  },
  {
    id: "json-schema", term: "JSON Schema", en: "JSON Schema", cat: "dev",
    plain: "一种描述“表格该怎么填”的标准写法：有哪些栏目、每栏填数字还是文字、哪些必填。工具的参数就是用它来规定的。",
    analogy: "像报名表上的格式要求：姓名必填、年龄只能填数字。",
    tech: "描述 JSON 数据结构的规范。Claude API 工具定义中的 input_schema、MCP 工具的 inputSchema 都用它；strict 模式要求 additionalProperties: false 并只支持其中一部分关键字。",
    lessons: [15, 17]
  },
  {
    id: "json-rpc", term: "JSON-RPC", en: "JSON-RPC 2.0", cat: "dev",
    plain: "一种简单的“发请求、回结果”的消息格式，MCP 用它在 Claude 这边和服务器之间传话。",
    analogy: "像一张带编号的点菜单：写明要做什么、带什么参数，回单上写着同一个编号。",
    tech: "轻量远程调用协议：请求含 jsonrpc、id、method、params，响应以相同 id 返回 result 或 error，通知（notification）没有 id、不需要回复。MCP 的 tools/list、tools/call、server/discover 都是 JSON-RPC 方法；notifications/tools/list_changed 是通知，在 2026-07-28 版协议中只发给通过 subscriptions/listen 订阅了的客户端。",
    lessons: [17], resources: ["mcp-spec"]
  },
  {
    id: "server-tool", term: "服务端工具", en: "Server Tool", cat: "dev",
    plain: "由 Anthropic 那边直接执行的工具，比如网页搜索、代码执行。你的程序不用自己去跑，结果直接出现在回复里。",
    tech: "在 Anthropic 基础设施上执行的工具（web_search、web_fetch、code_execution、tool_search 等），在 tools 中按带日期的 type 声明，结果以专门的结果块返回；与客户端工具（由你的程序执行、通过 tool_result 回传）相对。运行较久时可能以 pause_turn 暂停。",
    lessons: [17]
  },
  {
    id: "parallel-tool-use", term: "并行工具调用", en: "Parallel Tool Use", cat: "dev",
    plain: "Claude 一次开出好几张互不依赖的工具单，比如同时读三个文件，程序一起执行，省下来回的轮数。",
    tech: "一条 assistant 消息里可以包含多个 tool_use 块（默认开启，可用 disable_parallel_tool_use 关闭）。所有 tool_result 必须放在紧接着的同一条 user 消息里，且排在任何文字之前；拆成多条消息会让模型逐渐不再并行调用。",
    lessons: [15, 17]
  },
  {
    id: "mcp-resource", term: "MCP 资源", en: "MCP Resource", cat: "dev",
    plain: "MCP 服务器提供的“可以读的资料”，比如某个文件、某张表的结构。由应用或你决定什么时候放进对话，而不是 Claude 自己去调用。",
    tech: "MCP 三种服务端原语之一，由应用控制（application-controlled），用 URI 标识，通过 resources/list、resources/read 获取。Claude Code 中可以在输入框用 @服务器名:协议://路径 引用。",
    lessons: [17], resources: ["mcp-spec"]
  },
  {
    id: "mcp-prompt", term: "MCP 提示模板", en: "MCP Prompt", cat: "dev",
    plain: "MCP 服务器预先写好的提示词模板，由你主动选用，比如“按团队格式做代码审查”。",
    tech: "MCP 三种服务端原语之一，由用户控制（user-controlled），通过 prompts/list、prompts/get 获取，可带参数。Claude Code 把它们显示为斜杠命令，也可以输入 /mcp__服务器名__模板名 调用。",
    lessons: [17], resources: ["mcp-spec"]
  },
  {
    id: "chain-of-thought", term: "思维链", en: "Chain of Thought, CoT", cat: "arch",
    plain: "让 AI 把解题步骤一步步写出来再给答案。多步推理的题，这样做往往更准。",
    analogy: "数学考试写出演算过程，而不是只写一个得数。",
    tech: "Wei 等人 2022 年的论文显示，在提示中给出逐步推理的示例，能明显提升大模型的多步推理表现。现代推理模型把这一步做进了模型本身（思考块），不再完全依赖提示技巧。",
    lessons: [18]
  },
  {
    id: "adaptive-thinking", term: "自适应思考", en: "Adaptive Thinking", cat: "dev",
    plain: "Claude 自己判断这一步要不要想、想多深：简单的问题直接答，难题多想一会儿。",
    tech: "当前 Claude 模型的思考方式（thinking: {type: \"adaptive\"}）。模型逐个请求决定是否思考，并能在工具调用之间穿插思考。深浅主要由 effort 档位引导，不再手动指定 budget_tokens（Opus 5.5 等模型会直接拒绝）。思考按输出 token 计费，原始推理不返回，可选返回摘要。",
    lessons: [18]
  },
  {
    id: "effort", term: "投入档位", en: "Effort", cat: "dev",
    plain: "告诉 Claude 这件事值得花多大力气：低档快而省，高档想得更深、调用更仔细，但更慢更贵。",
    analogy: "像跟同事说“随便看一眼”还是“仔细查一遍”。",
    tech: "API 中的 output_config.effort，可选 low、medium、high、xhigh、max（视模型而定）。它是软性引导，影响思考的频率和深度以及整体 token 用量。Opus 5.5 默认 medium（截至 2026-11）。Claude Code 中用 /effort 或 /model 里的滑块调整。",
    lessons: [3, 18]
  },
  {
    id: "plan-and-execute", term: "先规划后执行", en: "Plan-and-Execute", cat: "arch",
    plain: "先把整件事拆成步骤列出来，确认没问题，再一步步去做；中途发现情况不对，再回头改计划。",
    analogy: "装修前先出图纸，业主点头了再开工。",
    tech: "一种 Agent 设计模式：规划阶段生成步骤清单，执行阶段逐步完成并在观察结果偏离预期时重新规划。与 ReAct 的“边想边做”互补。Claude Code 的计划模式（Plan）就是这种模式的产品化：只读调研、写出计划、等你批准后才动手。",
    lessons: [18]
  },
  {
    id: "reflection", term: "反思与自我检查", en: "Reflection / Self-Critique", cat: "arch",
    plain: "做完一步后回头检查：结果对不对、有没有漏掉什么，发现问题就改。",
    analogy: "写完作文自己先读一遍，再交给老师。",
    tech: "让模型评估自己的中间结果并据此修正的做法，代表工作有 Reflexion（Shinn 等，2023）和 Self-Refine（Madaan 等，2023）。在实践中，比让模型“再想一遍”更可靠的是外部信号：运行测试、重新读文件、对照验收标准，而不是只让模型“再想一遍”。",
    lessons: [18]
  }
]);

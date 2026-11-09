/* 术语分片 a：由写作 agent A（第 0–5 课）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "chatbot", term: "聊天机器人", en: "Chatbot", cat: "basic",
    plain: "你问一句、它答一句的 AI。它只能根据自己已经知道的内容写回答，不会自己去查资料、打开文件或替你办事。",
    analogy: "像只能接电话答疑的客服：说得头头是道，但不会替你跑腿。",
    tech: "单轮或多轮的“输入文本 → 生成文本”交互，不带工具或不进入工具循环。同一个大模型接上工具和循环后，就成了 Agent。",
    lessons: [1]
  },
  {
    id: "prompt", term: "提示词", en: "Prompt", cat: "basic",
    plain: "你发给 AI 的那段话。可以是一个问题、一条指令，也可以是一份详细的任务说明。",
    analogy: "像你写给同事的便条，写得越清楚，对方越不容易做错。",
    tech: "模型一次请求的输入内容，通常包括系统提示词、对话历史和本轮用户消息。提示词工程关注如何组织这些内容以获得稳定的输出。",
    lessons: [1, 4]
  },
  {
    id: "task-brief", term: "任务简报", en: "Task Brief", cat: "basic",
    plain: "交代一件事时写给 Claude 的完整说明，分六部分：目标、背景、限制（含不许做的事）、交付、完成标准，以及“有不清楚的先问我”。",
    analogy: "像给新来的助理写的派活单，而不是随口一句“帮我弄一下”。",
    tech: "面向 Agent 的结构化提示，本书统一为六部分：目标、背景、限制（含禁止的操作）、交付（输出形式）、完成标准（验收条件）、先问我（信息不足时先提问）。验收标准越可检查（如“测试全部通过”），Agent 越能自己判断何时停止。",
    lessons: [4, 10]
  },
  {
    id: "model-family", term: "模型家族", en: "Model Family", cat: "claude",
    plain: "Claude 不是只有一个模型，而是一组定位不同的模型：有的更聪明但慢一些，有的更快更省。按任务挑合适的那个。",
    analogy: "像同一家餐厅的大厨、熟练厨师和快餐窗口：都能做饭，适合的场合不同。",
    tech: "截至 2026-11，Claude 当前模型包括 Fable、Opus、Sonnet、Haiku 几条产品线（如 claude-fable-5-1、claude-opus-5-5、claude-sonnet-5-5、claude-haiku-5-5），在推理能力、延迟和成本上各有取舍。另有限量开放的型号（如 Mythos）和旧版本，具体以官方 Models overview 为准。",
    lessons: [3]
  },
  {
    id: "claude-app", term: "Claude 应用", en: "Claude apps", cat: "claude",
    plain: "普通用户和 Claude 聊天、办事的地方：网页版（claude.ai）、电脑上的桌面应用和手机 App，同一个账号的对话会同步。",
    tech: "Anthropic 面向终端用户的产品形态，包括网页、桌面（macOS、Windows 等）和 iOS / Android 应用，提供网页搜索、文件上传、Projects、记忆、Artifacts 等功能；部分功能需要付费套餐。",
    lessons: [0, 1, 3, 5]
  },
  {
    id: "cowork", term: "Claude Cowork", en: "Claude Cowork", cat: "claude",
    plain: "Claude 应用里专门“替你干活”的模式：不用敲命令，就能让 Claude 处理电脑上的文件、生成文档表格、整理资料这类多步骤任务。",
    analogy: "像把 Claude Code 的“动手能力”搬给了不写代码的人。",
    tech: "把 Claude Code 背后的 Agent 架构用于知识工作的产品形态，需要付费套餐。桌面应用中可以访问你连接的本地文件夹，也可以在网页和手机上使用（功能有差异）；提供多档权限模式。",
    lessons: [3, 10, 23]
  },
  {
    id: "claude-in-chrome", term: "Claude in Chrome", en: "Claude in Chrome", cat: "claude",
    plain: "一个 Chrome 浏览器扩展，让 Claude 能在网页上替你阅读、点击、输入和填表。",
    tech: "Anthropic 官方浏览器扩展，可从 Chrome 侧边栏、Claude Cowork 或 Claude Code 发起任务；截至 2026-11 需要付费套餐，只支持桌面版 Google Chrome。直接操作网站有提示注入等风险，官方建议先阅读安全指南。",
    lessons: [3, 9, 23]
  },
  {
    id: "claude-api", term: "Claude API", en: "Claude API", cat: "dev",
    plain: "给程序员用的“接口”：写代码调用 Claude，把它做进自己的网站、App 或自动化流程里。",
    tech: "Anthropic 的开发者平台接口，核心是 Messages API；通过官方 Client SDK（Python、TypeScript 等）调用，按 token 计费。工具循环需要自己写，或使用 SDK 的 Tool Runner。",
    lessons: [3, 22], resources: ["anthropic-sdk-python"]
  },
  {
    id: "knowledge-cutoff", term: "知识截止日期", en: "Knowledge Cutoff", cat: "basic",
    plain: "模型“读书”读到哪一天为止。在那之后发生的事，它本身不知道，除非去搜索或者你告诉它。",
    analogy: "像一个在山里闭关的人：闭关前的事都记得，出关后得先看看新闻。",
    tech: "训练数据覆盖的时间上限。官方区分“可靠知识截止日期”（知识最完整可靠的时间点）和“训练数据截止日期”。截至 2026-11，当前 Claude 模型的可靠知识截止日期为 2026 年 6 月。",
    lessons: [2]
  },
  {
    id: "extended-thinking", term: "思考模式", en: "Extended / Adaptive Thinking", cat: "claude",
    plain: "让 Claude 先“打草稿”再回答。遇到复杂问题时，先想清楚步骤，答案往往更可靠，但会慢一些。",
    analogy: "像考试时先在草稿纸上演算，再把答案写到卷子上。",
    tech: "模型在输出最终回答前生成内部推理。早期模型用手动的 extended thinking（指定 budget_tokens）；当前模型使用 adaptive thinking，由模型根据 effort 档位自己决定想多少。截至 2026-11，Claude 应用中当前模型（如 Opus 5.5、Fable 5.1）的思考不能关闭，部分模型可以在模型菜单中调整投入程度（Effort），以界面为准。",
    lessons: [3, 18]
  },
  {
    id: "web-search", term: "网页搜索", en: "Web Search", cat: "claude",
    plain: "让 Claude 上网查最新信息，并在回答里标出来源，方便你点过去核对。",
    tech: "Claude 应用中的一项功能；在 API 中是服务端工具 web_search（响应里出现 server_tool_use 与 web_search_tool_result 内容块，回答带 web_search_result_location 引用）。Team / Enterprise 需要管理员先在组织设置中启用。",
    lessons: [1, 2, 3, 10]
  },
  {
    id: "multimodal", term: "多模态", en: "Multimodal", cat: "basic",
    plain: "不光能读文字，还能看图片、读 PDF 里的图表。你可以直接拍张照片或上传截图问它。",
    tech: "模型接受多种输入模态。当前 Claude 模型支持文本和图像输入、文本输出；PDF 在页数较少时会同时分析文字和页面图像。",
    lessons: [1, 5]
  },
  {
    id: "projects", term: "Projects（项目）", en: "Projects", cat: "claude",
    plain: "Claude 应用里的“专用工作间”：把一组资料和固定要求放进去，之后在这个项目里开的每个对话都能用上。",
    analogy: "像给某件事单独准备的文件柜，柜门上还贴着“办事须知”。",
    tech: "由项目知识（上传的文件、文本）和项目说明（instructions）组成的工作区，所有计划可用（免费账号有数量限制）。项目内的对话彼此不共享聊天内容，只共享知识与说明；每个项目有独立的记忆。付费计划在知识接近上下文上限时会自动启用 RAG 模式。",
    lessons: [3, 5, 7]
  },
  {
    id: "memory", term: "记忆", en: "Memory", cat: "claude",
    plain: "Claude 应用可以把你在聊天中透露的长期信息（比如你的职业、偏好）记下来，下次对话自动用上。你可以查看、修改、暂停或清空。",
    analogy: "像老朋友记得你不吃辣，但你也可以让他“忘掉”。",
    tech: "Claude 应用在对话中按主题保存记忆条目，并在之后的对话中载入；在设置中管理，项目有独立记忆。与 Claude Code 的 CLAUDE.md、auto memory 是不同的机制。",
    lessons: [5, 12]
  },
  {
    id: "user-instructions", term: "个人指令", en: "Account-level Instructions", cat: "claude",
    plain: "在设置里写下的一段长期要求，例如“回答用简体中文，先给结论”。之后你的每个对话都会带上它。",
    tech: "账号级的自定义说明（有的版本叫“个人偏好”；英文帮助中心称 Instructions for Claude），对所有对话生效；项目说明只对该项目内的对话生效。两者都会进入每次请求的上下文。",
    lessons: [5, 7]
  },
  {
    id: "incognito-chat", term: "无痕对话", en: "Incognito Chat", cat: "claude",
    plain: "一种不留在你记录里的对话：不进历史记录、不写入记忆，之后也不会被搜索到。适合临时、敏感的问题。注意它不等于“不保存”：出于安全原因会暂时保留一段时间。",
    tech: "Claude 应用提供的对话模式，所有套餐可用，目前只能在项目之外使用。不进历史、不进记忆、不会被搜索、不用于训练；但出于安全原因默认保留 30 天（组织可能按自己的保留策略保存更久）。与“关闭本次对话的记忆”不同：后者的对话仍保留在历史中、仍可被搜索。",
    lessons: [5, 9]
  },
  {
    id: "rag", term: "检索增强生成", en: "Retrieval-Augmented Generation, RAG", cat: "arch",
    plain: "资料太多、一次装不下时，先按问题挑出最相关的几段，再交给 AI 阅读回答。",
    analogy: "不是把整座图书馆搬上桌，而是先查目录，只抽出要用的那几本。",
    tech: "生成前先从外部知识库检索相关片段并放入上下文的技术。可以扩大可用资料的规模，代价是可能漏掉没被检索到的内容。",
    lessons: [5, 16]
  }
]);

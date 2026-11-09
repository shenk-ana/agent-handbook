/* 术语分片 g：由写作 agent G（第 23 课与速查卡）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "computer-use", term: "Computer use（操作电脑）", en: "Computer Use", cat: "arch",
    plain: "让 Claude 像人一样用电脑：看屏幕截图，决定点哪里、输什么，再看结果。适合那些没有接口、只能靠点点点完成的软件和网页。",
    analogy: "像请一位远程协助的朋友，隔着屏幕看着你的桌面，指挥鼠标和键盘帮你操作。",
    tech: "Claude 通过截图感知屏幕，并发出鼠标、键盘等动作，由外部程序执行后把新截图交还。Claude API 的 computer use 工具截至 2026-11 的当前版本是 computer_toolset_20260801（Claude 5.5 及以后的模型，不需要 beta 请求头），旧版 computer_20251124 需要 beta 请求头，在 Claude API 与 Google Cloud 上用于 Claude 5.5 及以后的模型会返回 400（Amazon Bedrock 上的 Opus 5.5、Sonnet 5.5 仍接受旧版工具）；环境和动作的执行由使用者自己提供，Claude 不直接连接你的电脑。Claude Code 与桌面应用也提供面向用户的 computer use，细节以官方文档为准。",
    lessons: [23]
  },
  {
    id: "browser-agent", term: "浏览器 Agent", en: "Browser Agent", cat: "claude",
    plain: "能在网页上替你读内容、点按钮、填表单的 Agent，比如 Claude in Chrome。它读到的网页内容，也可能带来提示注入的风险。",
    analogy: "像一个坐在你浏览器前的临时助手，你在看什么，它就能看到什么、点到什么。",
    tech: "以浏览器为操作环境的 Agent：通过截图、页面结构或浏览器接口读取页面，发出点击、输入、导航等动作。它会共享浏览器的登录状态，所以站点权限、动作确认和对可疑页面内容的警惕比普通聊天更重要。",
    lessons: [9, 23]
  },
  {
    id: "long-running-task", term: "长时任务", en: "Long-running Task", cat: "arch",
    plain: "要跑几十分钟甚至几小时的任务，比如整理一大批资料、重构一个项目。时间一长，容易遇到上下文装不下、中途卡住等你批准、方向悄悄跑偏这些问题。",
    analogy: "像一场马拉松而不是百米冲刺：要规划补给点（检查点），也要有人在中途看一眼。",
    tech: "跨越多轮、多次工具调用的 Agent 任务。工程上要处理上下文增长与压缩、成本与时间预算、权限等待、失败后的恢复，常用做法有检查点、后台运行、定时触发和进度文件。",
    lessons: [10, 23]
  },
  {
    id: "task-budget", term: "任务预算", en: "Task Budget", cat: "dev",
    plain: "给 Agent 的一份“token 额度提示”：告诉它这件事大概能花多少工作量，让它自己掂量着办，快用完时好好收尾。它是提醒，不是硬性上限。",
    analogy: "像告诉助理“这件事你最多花半天”，助理会据此安排，但不是到点就强行把他拉走。",
    tech: "Claude API 的 beta 功能（截至 2026-11，请求头 task-budgets-2026-03-13），在 output_config.task_budget 中设置 type、total（最小 20,000 token）和可选的 remaining；模型能看到服务端注入的倒计时，API 响应里没有剩余额度字段。它是建议性的，真正的硬上限仍是 max_tokens。官方文档说明 Claude Code 和 Cowork 不支持任务预算。",
    lessons: [23]
  },
  {
    id: "checkpoint", term: "检查点", en: "Checkpoint", cat: "dev",
    plain: "任务中途留下的、可以退回的存档。出了岔子可以退回去，或者换个新会话从存档继续，不用从头再来。",
    analogy: "像游戏里的存档点。",
    tech: "泛指任务中途留下的、可以退回的存档，形式不限：进度文件、Git 提交或阶段性产出都算。长任务靠检查点把“出错”变成“回到上一步”。Claude Code 自动记录的文件与对话快照，用 /rewind 退回，本书称“回退点”。",
    lessons: [23]
  },
  {
    id: "background-task", term: "后台任务", en: "Background Task", cat: "dev",
    plain: "不用你一直盯着屏幕、让它在后台自己跑的任务。回来时再看结果，需要你拍板的地方它会停下来等你。",
    analogy: "像把衣服放进洗衣机，不用站在旁边，洗完或者卡住了会提醒你。",
    tech: "在 Claude Code 中，/background（别名 /bg）可以把当前会话转成后台会话，claude --bg 可以直接以后台方式启动；用 claude agents 查看、claude attach 接回。后台会话遇到权限提示、提问等需要决定的事时会显示为 Needs input 并等待你。另有在会话内用 Ctrl+B 把单条 Bash 命令或 agent 放到后台的用法，二者是不同层次。",
    lessons: [23]
  }
]);

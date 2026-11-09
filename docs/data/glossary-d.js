/* 术语分片 d：由写作 agent D（第 11–14 课）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "workspace-trust", term: "工作区信任", en: "Workspace Trust", cat: "safety",
    plain: "第一次在某个文件夹里启动 Claude Code 时，它会问你“信不信任这里的文件”。信任以后，项目自带的一部分配置（比如自动放行某些命令的规则）才会生效。",
    analogy: "像收到别人寄来的工具箱：先打开看看里面有什么，再决定要不要接上电源。",
    tech: "交互式会话在未信任的目录启动时显示信任对话框。项目 .claude/settings.json 中的 permissions.allow 与 additionalDirectories 要在接受后才生效；deny、ask 规则不受影响；.mcp.json 中的服务器另有批准提示。在仓库中以 git 根目录为单位记录；在主目录启动时只对本次会话有效。claude -p 和 Agent SDK 不显示对话框：项目的 Hooks、env 和 .mcp.json 服务器照常加载，但项目的 permissions.allow 与 additionalDirectories 不生效，stderr 会提示工作区未被信任；风险和对策见第 21 课。",
    lessons: [11, 12, 13, 14]
  },
  {
    id: "headless-mode", term: "无头模式（非交互模式）", en: "Headless / Non-interactive Mode", cat: "dev",
    plain: "不打开对话界面，用一条命令让 Claude Code 做完一件事就退出，适合写进脚本或自动化流水线。",
    analogy: "像给洗衣机设好程序就走开，而不是站在旁边一步步按按钮。",
    tech: "用 claude -p \"提示词\"（--print）运行，是 Agent SDK 的命令行形式。默认权限模式为 default，需要批准的调用无人可问会被拒绝，常配合 --allowedTools、--permission-mode dontAsk 预先限定可用工具；可用 --output-format 输出 JSON 等结构化结果。不显示工作区信任与 .mcp.json 批准提示。",
    lessons: [11, 12, 22]
  },
  {
    id: "settings-json", term: "settings.json（设置文件）", en: "Claude Code Settings Files", cat: "claude",
    plain: "Claude Code 的设置文件，写着它能做什么、不能做什么，用哪个模型，要自动运行哪些脚本。分“只对我”“对整个团队”“只对我在这个项目”几层。",
    analogy: "像公司制度：总部规定（管理员）最大，部门规定（项目）其次，个人习惯（用户）最后。",
    tech: "四个文件：用户 ~/.claude/settings.json、共享项目 .claude/settings.json（提交到仓库）、项目本地 .claude/settings.local.json（不提交）、组织下发的 managed settings。同一键按 managed > 命令行 --settings > 项目本地 > 共享项目 > 用户 的顺序取值；permissions.allow 等列表会跨文件合并。/config、/permissions 会写入其中，/status 可确认加载了哪些来源。",
    lessons: [12, 13, 14], resources: ["claude-code"]
  },
  {
    id: "permission-rule", term: "权限规则", en: "Permission Rule (allow / ask / deny)", cat: "claude",
    plain: "写在设置文件里的白名单和黑名单：哪些操作直接放行，哪些每次都要问，哪些一律禁止。",
    analogy: "像门禁名单：熟人直接进，访客登记，黑名单拦在门外。",
    tech: "格式为 Tool 或 Tool(specifier)，如 Bash(npm run *)、Read(./.env)、WebFetch(domain:example.com)、mcp__github__*、Agent(Explore)。按 deny → ask → allow 的顺序匹配，先命中者生效，越具体不等于越优先；任何一层的 deny 都不能被其他层的 allow 推翻。规则由 Claude Code 执行，不靠模型自觉；CLAUDE.md 里的文字不改变权限。用 /permissions 查看和编辑。",
    lessons: [12, 13, 14]
  },
  {
    id: "plan-mode", term: "计划模式", en: "Plan Mode", cat: "claude",
    plain: "让 Claude Code 只调查、只出方案、先不改代码的档位。你看过方案点头了，它才开始动手。",
    analogy: "装修前先出图纸，业主签字后才进场施工。",
    tech: "六种权限模式之一（界面英文 Plan，配置值 plan）。Claude 可以读文件、运行用于探索的命令，但在你批准计划之前不编辑源代码（交互式终端中启用了 bypassPermissions 的会话例外）。用 Shift+Tab 切换，或在提示词前加 /plan，或 claude --permission-mode plan 启动。批准时可选择之后用 auto 模式或逐个批准编辑；Ctrl+G 可在编辑器里修改计划。",
    lessons: [4, 12, 18]
  },
  {
    id: "sandbox", term: "沙箱", en: "Sandbox (Claude Code Bash sandbox)", cat: "safety",
    plain: "给 Claude 运行的命令画一个“围栏”：只能碰指定的文件夹、只能连指定的网站。围栏由操作系统把守，所以围栏里的命令可以少问你几次。",
    analogy: "像儿童游乐区的围栏：里面随便玩，出不去。",
    tech: "Claude Code 内置的 Bash 沙箱由操作系统强制限制 shell 命令（Bash、PowerShell、Monitor 及其子进程）可访问的文件和网络域名，用 /sandbox 开启或设 sandbox.enabled。支持 macOS、Linux 和 WSL2，原生 Windows 不支持。Claude 的文件工具、MCP 服务器和 Hooks 不在沙箱内。与权限模式相互独立、可以叠加；更强的隔离可用容器或虚拟机。",
    lessons: [9, 12, 21]
  },
  {
    id: "auto-memory", term: "自动记忆", en: "Auto Memory (Claude Code)", cat: "claude",
    plain: "Claude Code 根据你的纠正和偏好，自己记下来的笔记。下次在同一个项目里工作时会先看一眼，不用你每次重复。",
    analogy: "像助理自己的小本子：你说过一次“周一别排会”，他就记下了。",
    tech: "默认开启，按 git 仓库保存在 ~/.claude/projects/<project>/memory/，同一仓库的工作树和子目录共用，只存在本机。MEMORY.md 是索引，每个会话开始时加载前 200 行或 25KB，其余主题文件按需读取。记的是 user、feedback、project、reference 四类信息，不记能从代码推出来的内容。用 /memory 查看、编辑和开关；也可设 autoMemoryEnabled 或 CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 关闭。",
    lessons: [5, 12]
  },
  {
    id: "mcp-scope", term: "MCP 作用域", en: "MCP Installation Scope", cat: "dev",
    plain: "决定一个 MCP 服务器“在哪些项目里能用、给不给团队共享”：只在这个项目给我用、跟着项目给全队用，还是在我所有项目里都能用。",
    analogy: "像钥匙放在哪：只放自己口袋、挂在办公室门口给全组用，还是放进自己随身的钥匙串。",
    tech: "claude mcp add 的 --scope（-s）取值：local（默认，存于 ~/.claude.json 的当前项目条目，只对你生效）、project（写入项目根目录 .mcp.json，可提交共享，交互会话首次使用前需批准）、user（存于 ~/.claude.json，对你的所有项目生效）。同名服务器按 local > project > user > 插件 > claude.ai 连接器取整条定义，不跨作用域合并字段。注意 MCP 的 local 与设置文件的 .claude/settings.local.json 不是同一个东西。",
    lessons: [6, 14]
  },
  {
    id: "mcp-tool-search", term: "MCP 工具搜索", en: "MCP Tool Search", cat: "arch",
    plain: "MCP 工具很多时，Claude Code 一开始只记下工具的名字，用到某个工具时再去把它的完整说明找出来，免得说明书把上下文塞满。",
    analogy: "像图书馆的目录卡：先看卡片，要哪本再去书架取。",
    tech: "Claude Code 默认开启：会话开始时只加载 MCP 工具名和服务器说明，完整的工具定义延后加载，由 Claude 通过 ToolSearch 工具按需检索。因此接入更多服务器对上下文影响较小。可用 ENABLE_TOOL_SEARCH 环境变量控制，服务器或单个工具可设为始终预先加载（alwaysLoad）。旧模型或部分云平台上会退回为全部预先加载。",
    lessons: [14, 16, 17]
  }
]);

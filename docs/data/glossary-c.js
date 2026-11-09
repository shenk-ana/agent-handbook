/* 术语分片 c：由调研 agent C（工具推荐目录）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "plugin", term: "插件", en: "Plugin (Claude Code)", cat: "claude",
    plain: "一个打包好的“功能包”，装一次就能给 Claude Code 加上一组命令、Skills、子代理、Hooks 或 MCP 服务器。",
    analogy: "像给手机装一个 App：一次装好，里面的功能全都能用；不想用了可以停用或卸载。",
    tech: "带 .claude-plugin/plugin.json 清单的目录，可包含 skills/、agents/、commands/、hooks 与 .mcp.json 等组件。通过 /plugin 或 claude plugin 命令从插件市场安装，安装范围分 user、project、local 三种。",
    lessons: [7, 13, 14], resources: ["claude-plugins-official", "knowledge-work-plugins"]
  },
  {
    id: "plugin-marketplace", term: "插件市场", en: "Plugin Marketplace", cat: "claude",
    plain: "插件的目录清单。先把一个市场添加进 Claude Code，才能从里面挑插件安装。Anthropic 有官方市场，任何人也都能发布自己的市场。",
    analogy: "像应用商店：官方商店有审核，第三方商店要自己多留个心眼。",
    tech: "一个含 .claude-plugin/marketplace.json 的仓库、目录或 URL，列出插件名称与来源。用 /plugin marketplace add owner/repo 添加；安装时写成 插件名@市场名。官方市场 claude-plugins-official 会在交互式终端第一次启动时自动添加，并默认自动更新；脚本安装前需先 claude plugin marketplace add anthropics/claude-plugins-official。",
    lessons: [13], resources: ["claude-plugins-official", "wshobson-agents", "awesome-claude-code"]
  },
  {
    id: "mcp-server", term: "MCP 服务器", en: "MCP Server", cat: "arch",
    plain: "按 MCP 标准提供工具的小程序。接上它，Claude 就多了一组能用的工具，比如读 GitHub、查数据库、开浏览器。",
    analogy: "像给电脑插上一个 USB 设备：接口统一，插上就能用，但它能做什么取决于设备本身。",
    tech: "实现 Model Context Protocol 服务端的进程或远程服务，向客户端（如 Claude Code、Claude 应用）暴露 tools、resources、prompts。可以在本机运行（stdio），也可以是远程 HTTP 服务；能力和权限由服务器自身及其使用的凭证决定。",
    lessons: [6, 14, 17], resources: ["mcp-servers", "github-mcp-server", "playwright-mcp", "mcp-registry"]
  },
  {
    id: "mcp-transport", term: "MCP 传输方式", en: "MCP Transport", cat: "dev",
    plain: "Claude 和 MCP 服务器之间“怎么传话”。要么在你电脑上直接启动一个程序，要么通过网址连接一个远程服务。",
    analogy: "像打电话和写信都能沟通，只是线路不同。",
    tech: "MCP 规范定义的通信层：stdio（客户端启动本地子进程，经标准输入输出交换 JSON-RPC 消息）和 Streamable HTTP（连接远程服务器，可配合 OAuth）。旧的 SSE 传输已不推荐。Claude Code 中用 claude mcp add --transport http 或 -- 命令 的形式区分。",
    lessons: [6, 14, 17], resources: ["mcp-spec", "mcp-inspector"]
  },
  {
    id: "slash-command", term: "斜杠命令", en: "Slash Command", cat: "claude",
    plain: "在 Claude Code 输入框里以 / 开头的命令，比如 /help、/mcp、/plugin，用来调出功能或运行预设的流程。",
    analogy: "像游戏里的快捷指令：输入一个短命令，就执行一串固定操作。",
    tech: "Claude Code 的内置命令加上用户自定义命令。自定义命令现在以 Skill 的形式存在（.claude/skills/<name>/SKILL.md，旧的 .claude/commands/*.md 仍可用），插件提供的命令写作 /插件名:命令名。具体命令以 /help 和官方文档为准。",
    lessons: [11, 13]
  },
  {
    id: "hook", term: "Hooks（钩子）", en: "Hooks", cat: "claude",
    plain: "在 Claude Code 的固定时机自动运行的脚本，比如每次改完文件就自动格式化，或者在执行危险命令前拦下来。",
    analogy: "像家里的自动感应灯：你不用记得去开，到了那个时刻它自己就动作。",
    tech: "在 settings.json 或插件中配置的事件处理器，在 PreToolUse、PostToolUse、UserPromptSubmit、Stop 等事件触发时执行 shell 命令等，可以根据退出码或输出阻止、放行或补充上下文。Hooks 以你的账户权限运行，安装来源不明的插件前要先检查其中的 Hooks。",
    lessons: [13, 21, 22]
  }
]);

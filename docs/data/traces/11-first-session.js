/* 演示脚本：在一个虚构项目里的第一次 Claude Code 会话（第 11 课）
   结构为示意：工具调用与工具结果字段与真实 API 一致，思考块与响应外层字段做了简化。
   工具名（Bash、Read、Write）与参数（command、file_path、content）与 Claude Code 内置工具一致；界面为自绘示意，信任对话框和确认框的文字是意译，以真实界面为准。
   项目“示例待办 API”与其中的文件均为虚构。 */
window.TRACES = window.TRACES || {};
window.TRACES["11-first-session"] = {
  title: "演示：第一次打开 Claude Code",
  skin: "terminal",
  task: "在一个没用过 Claude Code 的项目里启动它，先弄清项目是做什么的，再用 /init 生成 CLAUDE.md。",
  meter: { system: 2000, max: 6000, label: "演示比例。系统部分包含 Claude Code 的系统提示词和内置工具定义；这个项目还没有 CLAUDE.md" },
  steps: [
    {
      phase: "confirm",
      text: "是否信任此文件夹中的文件？（~/code/todo-api）",
      options: ["是，我信任此文件夹", "否，退出"],
      api: null,
      apiNote: "这不是 API 消息：Claude Code 在第一次进入某个文件夹时弹出工作区信任对话框，此时还没有向模型发送任何内容。",
      narr: "启动前的第一道关：确认你信任这个文件夹。别人仓库里的配置（如允许规则、Hooks）要等你信任后才生效。",
      tokens: 0
    },
    {
      phase: "user",
      text: "这个项目是做什么的？先别改任何东西。",
      api: { role: "user", content: "这个项目是做什么的？先别改任何东西。" },
      apiNote: "你输入的问题就是 user 消息。Claude Code 会自动附上系统提示词和工具定义。",
      narr: "官方快速入门推荐的第一个问题。加一句“先别改”，让它只读不写。",
      tokens: 40
    },
    {
      phase: "think",
      text: "先看目录结构和说明文件，再读入口代码。",
      api: { type: "thinking", note: "模型内部推理（默认不显示原文）" },
      apiNote: "思考和工具调用在同一次响应里，这里拆开展示。",
      narr: "第 1 轮 · 思考：不凭文件名猜，先拿到事实。",
      tokens: 40, round: 1
    },
    {
      phase: "act", tool: "Bash", arg: "ls -a",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_01", name: "Bash", input: { command: "ls -a", description: "列出项目根目录" } }],
        stop_reason: "tool_use"
      },
      apiNote: "ls 属于内置的只读命令，通常不需要你批准。",
      narr: "第 1 轮 · 行动：列出根目录。只读命令一般不弹确认。",
      tokens: 100, round: 1
    },
    {
      phase: "observe", tool: "Bash",
      out: [".git  README.md  package.json  src/  test/", "（共 5 项）"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_01", content: ".git\nREADME.md\npackage.json\nsrc\ntest" }]
      },
      apiNote: "命令输出作为工具结果回到模型。",
      narr: "第 1 轮 · 观察：一个 Node.js 项目，有说明文件和测试目录。",
      tokens: 180, round: 1
    },
    {
      phase: "act", tool: "Read", arg: "package.json",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_02", name: "Read", input: { file_path: "/home/dev/code/todo-api/package.json" } }],
        stop_reason: "tool_use"
      },
      apiNote: "Read 是只读工具，读工作目录里的文件不需要批准。",
      narr: "第 2 轮 · 行动：读 package.json，看依赖和脚本命令。",
      tokens: 240, round: 2
    },
    {
      phase: "observe", tool: "Read",
      out: ["\"name\": \"todo-api\"", "\"scripts\": { \"dev\": \"node src/server.js\", \"test\": \"vitest\" }", "\"dependencies\": { \"fastify\": \"…\" }"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_02", content: "{\n  \"name\": \"todo-api\",\n  \"scripts\": { \"dev\": \"node src/server.js\", \"test\": \"vitest\" },\n  \"dependencies\": { \"fastify\": \"…\" }\n}" }]
      },
      apiNote: "文件内容进入上下文。读得越多，上下文越满。",
      narr: "第 2 轮 · 观察：用 Fastify 写的接口服务，测试命令是 vitest。",
      tokens: 420, round: 2
    },
    {
      phase: "answer", final: false,
      text: "这是一个待办事项的 HTTP 接口服务（todo-api）：用 Fastify 实现，入口是 src/server.js，提供增删改查接口；测试用 vitest，运行 npm test。我没有修改任何文件。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "这是一个待办事项的 HTTP 接口服务……我没有修改任何文件。" }],
        stop_reason: "end_turn"
      },
      apiNote: "stop_reason 为 end_turn，Claude Code 停下来等你的下一条指令。",
      narr: "两轮就有了答案，而且说明了依据。接下来让它把这些知识写进 CLAUDE.md。",
      tokens: 520, round: 2
    },
    {
      phase: "user",
      text: "/init",
      api: { role: "user", content: "（/init 展开后的指令：分析代码库，生成 CLAUDE.md）" },
      apiNote: "/init 是内置命令，Claude Code 会把它展开成一段让 Claude 分析项目、写 CLAUDE.md 的指令。这里做了简化。",
      narr: "输入 /init：让 Claude 分析代码库，生成一份 CLAUDE.md 初稿。",
      tokens: 600, round: 3
    },
    {
      phase: "act", tool: "Write", arg: "CLAUDE.md",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_03", name: "Write", input: { file_path: "/home/dev/code/todo-api/CLAUDE.md", content: "# todo-api\n\n## 常用命令\n- 启动：npm run dev\n- 测试：npm test（vitest）\n\n## 结构\n- 接口在 src/routes/，入口 src/server.js\n" } }],
        stop_reason: "tool_use"
      },
      apiNote: "Write 会创建或覆盖文件，属于有副作用的操作。",
      narr: "第 3 轮 · 行动：准备写入 CLAUDE.md。这次是“写”，所以要过权限检查。",
      tokens: 760, round: 3
    },
    {
      phase: "confirm",
      text: "是否创建 CLAUDE.md？",
      options: ["是", "是，本次会话中允许所有编辑", "否，告诉 Claude 应该怎么做"],
      api: null,
      apiNote: "这不是 API 消息：演示把权限模式切到了手动模式（Manual，界面文字以实际版本为准），所以写文件前会问你。新版终端默认是自动模式，由另一个模型先检查每一步是否越界。",
      narr: "人在回路：演示用的是手动模式，写文件前先问你。第一次用 Claude Code，建议先这样看清每一步；不确定就选“是”，一次一次地看。",
      tokens: 760, round: 3
    },
    {
      phase: "observe", tool: "Write",
      out: ["已创建 CLAUDE.md（+9）", "+ # todo-api", "+ ## 常用命令", "+ - 测试：npm test（vitest）"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_03", content: "File created successfully at: /home/dev/code/todo-api/CLAUDE.md" }]
      },
      apiNote: "写入成功的结果回到模型。从下一个会话起，CLAUDE.md 会被自动加载。",
      narr: "第 3 轮 · 观察：绿色的 + 行就是新增的内容（diff）。",
      tokens: 840, round: 3
    },
    {
      phase: "answer",
      text: "已生成 CLAUDE.md，记录了启动和测试命令、目录结构。建议你再补上我从代码里看不出来的约定，比如“不要改 src/legacy/”。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "已生成 CLAUDE.md……建议你再补上我从代码里看不出来的约定。" }],
        stop_reason: "end_turn"
      },
      apiNote: "本轮结束。CLAUDE.md 要提交到仓库，团队成员才能共用。",
      narr: "完成：先问清项目，再生成项目说明。初稿要你自己审一遍、补上隐性规矩。",
      tokens: 920, round: 3
    }
  ]
};

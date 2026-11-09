/* 演示脚本：在 Claude Code 里修一个失败的测试（第 15 课）
   skin: "terminal" 表示用模拟的 Claude Code 终端界面呈现。界面为自绘示意，与真实界面细节可能不同。
   API 视角为示意：工具名与参数（Bash.command、Read.file_path、Edit.old_string/new_string）与 Claude Code 内置工具一致，思考块与响应外层字段做了简化。 */
window.TRACES = window.TRACES || {};
window.TRACES["claude-code-fix-test"] = {
  title: "演示：在 Claude Code 里修一个失败的测试",
  skin: "terminal",
  task: "跑一下测试，有失败的就修好。",
  meter: { system: 2200, max: 6000, label: "演示比例。系统部分包含 Claude Code 的系统提示词、内置工具定义和 CLAUDE.md" },
  steps: [
    {
      phase: "user",
      text: "跑一下测试，有失败的就修好。",
      api: { role: "user", content: "跑一下测试，有失败的就修好。" },
      apiNote: "你在 Claude Code 输入框里打的字，就是发给模型的 user 消息。Claude Code 还会自动带上系统提示词、内置工具定义和项目里的 CLAUDE.md。",
      narr: "一句很口语的指令。它没说用什么命令跑测试，Claude 得自己去弄清楚。",
      tokens: 40
    },
    {
      phase: "think",
      text: "先把测试跑一遍，看看哪里失败了。",
      api: { type: "thinking", note: "模型内部推理（默认不显示原文）" },
      apiNote: "思考和工具调用在同一次响应里，这里拆开展示。",
      narr: "第 1 轮 · 思考：不猜问题在哪，先拿到事实。",
      tokens: 40, round: 1
    },
    {
      phase: "act", tool: "Bash", arg: "npm test",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_01", name: "Bash", input: { command: "npm test", description: "运行测试" } }],
        stop_reason: "tool_use"
      },
      apiNote: "Bash 是 Claude Code 的内置工具。是否需要你批准，取决于权限模式和你配置的允许规则。",
      narr: "第 1 轮 · 行动：调用内置的 Bash 工具运行测试。终端里那一行“⏺ Bash(…)”就是一次工具调用。",
      tokens: 110, round: 1
    },
    {
      phase: "observe", tool: "Bash",
      out: ["FAIL  test/price.test.js", "✗ formatPrice › 金额保留两位小数", "  期望: \"¥12.50\"", "  实际: \"¥12.5\"", "Tests: 1 failed, 23 passed"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_01", content: "FAIL test/price.test.js\n✗ formatPrice › 金额保留两位小数\n期望 \"¥12.50\"，实际 \"¥12.5\"\nTests: 1 failed, 23 passed" }]
      },
      apiNote: "命令输出作为工具结果回到模型。输出很长时会占用大量上下文，这是长任务需要压缩的原因之一。",
      narr: "第 1 轮 · 观察：24 个测试里挂了 1 个，问题出在 formatPrice 没有补零。",
      tokens: 300, round: 1
    },
    {
      phase: "think",
      text: "失败在 formatPrice，先看它的实现再动手。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "Claude Code 把完整历史连同工具结果再发给模型，开始第 2 轮。",
      narr: "第 2 轮 · 思考：不急着改，先读代码。好的 Agent 先“看”再“动”。",
      tokens: 300, round: 2
    },
    {
      phase: "act", tool: "Read", arg: "src/price.js",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_02", name: "Read", input: { file_path: "/project/src/price.js" } }],
        stop_reason: "tool_use"
      },
      apiNote: "Read 是只读工具，通常不需要你批准。",
      narr: "第 2 轮 · 行动：读取源文件。只读操作风险低，所以一般不弹确认。",
      tokens: 360, round: 2
    },
    {
      phase: "observe", tool: "Read",
      out: ["读取了 18 行", "12  export function formatPrice(n) {", "13    return \"¥\" + n;", "14  }"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_02", content: "12\texport function formatPrice(n) {\n13\t  return \"¥\" + n;\n14\t}" }]
      },
      apiNote: "文件内容带着行号回到上下文。读的文件越多，上下文越满。",
      narr: "第 2 轮 · 观察：找到原因了，数字直接拼接，没有格式化成两位小数。",
      tokens: 520, round: 2
    },
    {
      phase: "think",
      text: "用 toFixed(2) 补齐两位小数，改一行就够。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "第 3 次请求模型。",
      narr: "第 3 轮 · 思考：选最小的改法，不顺手重构别的代码。",
      tokens: 520, round: 3
    },
    {
      phase: "act", tool: "Edit", arg: "src/price.js",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_03", name: "Edit", input: { file_path: "/project/src/price.js", old_string: "return \"¥\" + n;", new_string: "return \"¥\" + n.toFixed(2);" } }],
        stop_reason: "tool_use"
      },
      apiNote: "Edit 用“找到原文 old_string、替换成 new_string”的方式改文件，所以修改范围精确可查。",
      narr: "第 3 轮 · 行动：准备修改文件。改文件属于有副作用的操作。",
      tokens: 620, round: 3
    },
    {
      phase: "confirm",
      text: "是否修改 src/price.js？",
      options: ["是", "是，本次会话中允许所有编辑", "否，告诉 Claude 应该怎么做"],
      api: null,
      apiNote: "这不是 API 消息：是 Claude Code 在执行工具前按权限模式询问你（演示的是手动模式）。选“否”时，它会把你的意见作为结果交还给模型。",
      narr: "人在回路：手动（default）权限模式下，改文件前会先问你。也可以切到自动接受编辑，或由自动审核把关的模式。",
      tokens: 620, round: 3
    },
    {
      phase: "observe", tool: "Edit",
      out: ["已更新 src/price.js（+1 -1）", "- return \"¥\" + n;", "+ return \"¥\" + n.toFixed(2);"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_03", content: "已更新 /project/src/price.js" }]
      },
      apiNote: "修改成功的结果回到模型。",
      narr: "第 3 轮 · 观察：改动已写入。终端里的红绿行就是这次的差异（diff）。",
      tokens: 700, round: 3
    },
    {
      phase: "act", tool: "Bash", arg: "npm test",
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_04", name: "Bash", input: { command: "npm test", description: "重新运行测试" } }],
        stop_reason: "tool_use"
      },
      apiNote: "第 4 轮：模型没有直接宣布完成，而是先验证。",
      narr: "第 4 轮 · 行动：改完再跑一遍测试。验证是避免“以为修好了”的关键一步。",
      tokens: 760, round: 4
    },
    {
      phase: "observe", tool: "Bash",
      out: ["PASS  test/price.test.js", "✓ 24 个测试全部通过"],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_04", content: "PASS test/price.test.js\nTests: 24 passed" }]
      },
      apiNote: "验证结果回到模型，它据此判断可以结束了。",
      narr: "第 4 轮 · 观察：全部通过，有了真实的证据。",
      tokens: 840, round: 4
    },
    {
      phase: "answer",
      text: "修好了：formatPrice 没有补齐两位小数，我在 src/price.js 改了一行，用 toFixed(2) 格式化。重新运行后 24 个测试全部通过。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "修好了：formatPrice 没有补齐两位小数……24 个测试全部通过。" }],
        stop_reason: "end_turn"
      },
      apiNote: "stop_reason 为 end_turn，这一轮任务结束，Claude Code 等你下一条指令。",
      narr: "完成：4 轮循环，读了 1 个文件、改了 1 行、跑了 2 次测试，最后的结论有测试结果作证。",
      tokens: 920, round: 4
    }
  ]
};

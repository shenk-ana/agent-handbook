/* 演示脚本：Agent 循环（第 15 课）
   回放器数据格式见 docs/STYLE_GUIDE.md「回放器脚本」。
   这是预先写好的模拟过程，不会真的调用 Claude。API 视角为示意：tool_use / tool_result / stop_reason 的字段与真实 Messages API 一致，思考块（真实结构含 thinking 与 signature，默认不返回推理文本）和响应外层字段（id、usage 等）做了简化。
   phase: user | think | act | confirm | observe | answer */
window.TRACES = window.TRACES || {};
window.TRACES["agent-loop"] = {
  title: "演示：Claude 帮你查天气并加日历提醒",
  task: "明天东京会下雨吗？如果会，帮我在日历里加一条早上 8 点的“带伞”提醒。",
  meter: { system: 1400, max: 4000, label: "演示比例，真实窗口远大于此" },
  steps: [
    {
      phase: "user", who: "你",
      text: "明天东京会下雨吗？如果会，帮我在日历里加一条早上 8 点的“带伞”提醒。",
      api: { role: "user", content: "明天东京会下雨吗？如果会，帮我在日历里加一条早上 8 点的“带伞”提醒。" },
      apiNote: "程序把你的话作为第一条 user 消息发出。同时发出的还有系统提示词和两个工具的定义：get_weather 与 create_event。",
      narr: "任务进来了。注意它其实包含两件事，而且第二件要看第一件的结果才能决定做不做。",
      tokens: 60
    },
    {
      phase: "think", who: "Claude 在想",
      text: "要先知道明天东京的天气，才能决定加不加提醒。先调用天气工具。",
      api: { type: "thinking", note: "模型内部推理（默认不返回原文，可以开启摘要）" },
      apiNote: "思考和下一步的工具调用在同一次 API 响应里。这里把它拆开，是为了看清楚。",
      narr: "第 1 轮 · 思考：Claude 判断自己缺少信息（天气），于是决定先查。它不会凭空猜明天的天气。",
      tokens: 60, round: 1
    },
    {
      phase: "act", who: "调用工具",
      tool: "get_weather",
      kv: [["city", "东京"], ["date", "2026-11-08"]],
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_01", name: "get_weather", input: { city: "东京", date: "2026-11-08" } }],
        stop_reason: "tool_use"
      },
      apiNote: "stop_reason 为 tool_use，表示“我要用工具，请执行后把结果给我”。真正去查天气的是你的程序，不是模型。",
      narr: "第 1 轮 · 行动：Claude 只是“开出一张单子”，写明要用哪个工具、带什么参数。执行由外面的程序完成。",
      tokens: 150, round: 1
    },
    {
      phase: "observe", who: "工具返回",
      tool: "get_weather",
      kv: [["天气", "小雨转中雨"], ["降雨概率", "80%"], ["时段", "07:00–15:00"]],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_01", content: "{\"condition\":\"小雨转中雨\",\"rain_prob\":0.8,\"hours\":\"07:00-15:00\"}" }]
      },
      apiNote: "工具结果以 user 角色发回，tool_use_id 必须和上一步的 id 对上。",
      narr: "第 1 轮 · 观察：结果写进上下文。上下文条变长了，每一轮的结果都会累积在里面。",
      tokens: 290, round: 1
    },
    {
      phase: "think", who: "Claude 在想",
      text: "降雨概率 80%，而且早上 7 点就开始下。满足“会下雨”，需要创建提醒。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "程序带着完整的历史（问题、工具调用、工具结果）再次请求模型。模型本身不记得上一轮，每次都要把历史重新发给它。",
      narr: "第 2 轮 · 思考：拿到新信息后重新判断。条件成立，进入第二件事。",
      tokens: 290, round: 2
    },
    {
      phase: "act", who: "调用工具",
      tool: "create_event",
      kv: [["title", "带伞 ☂️"], ["start", "2026-11-08 08:00"], ["note", "东京降雨概率 80%"]],
      api: {
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_02", name: "create_event", input: { title: "带伞 ☂️", start: "2026-11-08T08:00:00+09:00", note: "东京降雨概率 80%" } }],
        stop_reason: "tool_use"
      },
      apiNote: "第二次工具调用。注意时间里带了东京时区 +09:00，参数要精确到程序能直接执行。",
      narr: "第 2 轮 · 行动：这一步会改动你的日历，属于“有副作用”的操作。",
      tokens: 390, round: 2
    },
    {
      phase: "confirm", who: "需要你确认",
      text: "Claude 想在你的日历中创建事件“带伞 ☂️”（明天 08:00）。是否允许？",
      api: null,
      apiNote: "这一步不是 API 消息，而是你的程序（或 Claude Code、Claude 应用）在执行工具前按权限规则询问你。拒绝时，就回传一条“用户拒绝”的工具结果。",
      narr: "人在回路：会改动东西的操作，好的 Agent 会先停下来问你。你点了“允许”，循环才继续。",
      tokens: 390, round: 2
    },
    {
      phase: "observe", who: "工具返回",
      tool: "create_event",
      kv: [["状态", "已创建"], ["事件 ID", "evt_8842"]],
      api: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "toolu_02", content: "{\"ok\":true,\"event_id\":\"evt_8842\"}" }]
      },
      apiNote: "如果创建失败，这里应设置 is_error: true 并写明原因，让模型决定重试还是告诉你。",
      narr: "第 2 轮 · 观察：确认事件已经创建成功，而不是“以为”成功了。",
      tokens: 470, round: 2
    },
    {
      phase: "think", who: "Claude 在想",
      text: "两件事都完成了，没有需要再调用的工具。可以向用户汇报。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "第三次请求模型。这一次它判断不需要再用工具了。",
      narr: "第 3 轮 · 思考：判断任务是否完成，本身也是循环的一部分。",
      tokens: 470, round: 3
    },
    {
      phase: "answer", who: "Claude",
      text: "明天东京有雨（降雨概率 80%，早上 7 点开始）。我已经在你的日历里加了明早 8:00 的“带伞 ☂️”提醒。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "明天东京有雨（降雨概率 80%……）。我已经在你的日历里加了……" }],
        stop_reason: "end_turn"
      },
      apiNote: "stop_reason 为 end_turn，循环在这里退出。整个过程调用了 3 次模型、执行了 2 次工具。",
      narr: "完成：循环结束。3 轮“思考 → 行动 → 观察”，最后给出有依据的回答。",
      tokens: 540, round: 3
    }
  ]
};

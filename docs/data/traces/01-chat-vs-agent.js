/* 演示脚本：只聊天 vs Agent（第 1 课）
   同一个任务的两种做法。预先写好的模拟过程，不调用真实服务。
   餐厅名称、网址均为虚构示例。网页搜索为服务端工具，结构参照官方 web search tool 文档。
   结构为示意：工具调用与工具结果字段与真实 API 一致，思考块与响应外层字段做了简化。 */
window.TRACES = window.TRACES || {};
(function () {
var TASK_01 = "下周六想带爸妈去湖边吃午饭，帮我挑一家合适的餐厅，把理由整理成一张表。";

window.TRACES["01-chat-only"] = {
  title: "演示 A：只聊天",
  task: TASK_01,
  meter: { system: 600, max: 3000, label: "演示比例。没有工具定义，系统部分更小" },
  steps: [
    {
      phase: "user", text: TASK_01,
      api: { role: "user", content: TASK_01 },
      apiNote: "请求里没有 tools 字段：模型只能读这段文字、写一段文字。",
      narr: "同一个任务，先看“只聊天”的做法：Claude 手里没有任何工具。",
      tokens: 50
    },
    {
      phase: "answer",
      text: "我没法查到实时的餐厅信息，不过可以给你一些挑选思路：选有包间或安静座位的、菜品偏清淡的、离停车场近的……你可以在点评网站上搜一下，把候选发给我，我帮你比较。",
      api: { role: "assistant", content: [{ type: "text", text: "我没法查到实时的餐厅信息，不过可以给你一些挑选思路……" }], stop_reason: "end_turn" },
      apiNote: "一次请求、一次回答，没有工具调用。",
      narr: "它很诚实：不知道就说不知道。但活儿又回到了你手上。注意右边的循环图一直没有转。",
      tokens: 190
    },
    {
      phase: "user",
      text: "我在网上找了三家：湖畔小馆、山水人家、老街面馆。（粘贴了三段介绍）",
      api: { role: "user", content: "我在网上找了三家：湖畔小馆、山水人家、老街面馆。……" },
      apiNote: "你自己去查、自己复制粘贴。这些文字成为对话历史的一部分。",
      narr: "你成了“跑腿的”：打开网页、挑候选、复制粘贴，都是你在做。",
      tokens: 420
    },
    {
      phase: "answer",
      text: "根据你给的介绍：湖畔小馆环境好、菜偏清淡，更适合长辈；山水人家要排队；老街面馆太简单。我推荐湖畔小馆，表格如下……",
      api: { role: "assistant", content: [{ type: "text", text: "根据你给的介绍：湖畔小馆环境好……" }], stop_reason: "end_turn" },
      apiNote: "模型很擅长“读你给的材料、做比较”。这部分只聊天也能做好。",
      narr: "整理和比较，聊天机器人做得不错。可它只能用你给它的那几段文字。",
      tokens: 600
    },
    {
      phase: "user",
      text: "那家下周六中午营业吗？要不要提前订位？",
      api: { role: "user", content: "那家下周六中午营业吗？要不要提前订位？" },
      apiNote: "新的问题又需要外部信息。",
      narr: "又冒出一个需要“去查”的问题。",
      tokens: 640
    },
    {
      phase: "answer",
      text: "这个我确认不了，你给的介绍里没写营业时间。建议你打电话问一下，或者看看它的官方页面。",
      api: { role: "assistant", content: [{ type: "text", text: "这个我确认不了……建议你打电话问一下。" }], stop_reason: "end_turn" },
      apiNote: "整个过程 3 次请求、0 次工具调用。",
      narr: "停在这里：任务没办完，营业时间还得你自己去问。这就是“只会说、不会做”。",
      final: false,
      tokens: 720
    }
  ]
};

window.TRACES["01-agent"] = {
  title: "演示 B：Agent 的做法",
  task: TASK_01,
  meter: { system: 1400, max: 3000, label: "演示比例。系统部分包含工具定义" },
  steps: [
    {
      phase: "user", text: TASK_01,
      api: { role: "user", content: TASK_01 },
      apiNote: "这次请求里带上了 web_search 工具的定义，Claude 可以自己决定要不要搜索。",
      narr: "同一个任务，这次 Claude 手里有“网页搜索”这个工具。",
      tokens: 50
    },
    {
      phase: "think",
      text: "要找湖边、适合长辈的餐厅，还要确认下周六中午是否营业。先搜候选。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "模型先拆解任务：找候选 → 核对营业时间 → 整理成表。",
      narr: "第 1 轮 · 思考：先把任务拆开，决定第一步做什么。",
      tokens: 50, round: 1
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "湖边 餐厅 清淡 适合老人 包间"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_01", name: "web_search", input: { query: "湖边 餐厅 清淡 适合老人 包间" } }] },
      apiNote: "server_tool_use：由 Anthropic 服务器执行搜索，不需要你的程序参与。",
      narr: "第 1 轮 · 行动：它自己去搜，而不是让你去搜。",
      tokens: 110, round: 1
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["结果 1", "湖畔小馆：临湖座位、杭帮菜"], ["结果 2", "山水人家：周末排队 1 小时"], ["结果 3", "老街面馆：快餐为主"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_01",
        content: [
          { type: "web_search_result", title: "湖畔小馆（示例）", url: "https://example.com/hupan", page_age: "October 20, 2026", encrypted_content: "…" },
          { type: "web_search_result", title: "山水人家 周末排队攻略（示例）", url: "https://example.com/shanshui", page_age: "September 12, 2026", encrypted_content: "…" }
        ]
      },
      apiNote: "搜索结果进入上下文，供下一步判断。",
      narr: "第 1 轮 · 观察：拿到三家候选，和“只聊天”时你手动找的差不多，但这次是它找的。",
      tokens: 420, round: 1
    },
    {
      phase: "think",
      text: "湖畔小馆最合适，但还不知道下周六中午营不营业、要不要订位。再查一次。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "根据观察结果调整下一步：信息还不够，继续查。",
      narr: "第 2 轮 · 思考：它发现还缺关键信息，于是决定再查。这就是“根据结果调整”。",
      tokens: 420, round: 2
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "湖畔小馆 营业时间 预订"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_02", name: "web_search", input: { query: "湖畔小馆 营业时间 预订" } }] },
      apiNote: "同一轮回答里可以发起多次搜索。",
      narr: "第 2 轮 · 行动：换一个更具体的关键词，专门查营业时间。",
      tokens: 470, round: 2
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["营业时间", "周二至周日 11:00–21:00"], ["预订", "周末建议提前 3 天电话预订"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_02",
        content: [{ type: "web_search_result", title: "湖畔小馆 官方页面（示例）", url: "https://example.com/hupan/info", page_age: "November 1, 2026", encrypted_content: "…" }]
      },
      apiNote: "page_age 表示页面更新时间，可以帮助判断信息是否过时。",
      narr: "第 2 轮 · 观察：周六营业，周末要提前订位。在演示 A 里，这得你自己打电话问。",
      tokens: 620, round: 2
    },
    {
      phase: "answer",
      text: "推荐湖畔小馆。理由表：①临湖安静座位，适合长辈 ②杭帮菜偏清淡 ③周六 11:00 开门 ④周末建议提前 3 天电话订位。备选：山水人家（排队较久）。来源已附在每一条后面，订位前建议再打电话确认。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "推荐湖畔小馆……", citations: [{ type: "web_search_result_location", url: "https://example.com/hupan/info", title: "湖畔小馆 官方页面（示例）", cited_text: "周二至周日 11:00–21:00", encrypted_index: "…" }] }],
        stop_reason: "end_turn"
      },
      apiNote: "一次请求里完成了两次搜索和最终回答，引用指向具体来源。",
      narr: "完成：2 轮循环，它自己找、自己核对，最后给出带来源的结论。你只说了一句话。",
      tokens: 760, round: 2
    }
  ]
};
})();

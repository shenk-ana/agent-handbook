/* 演示脚本：先查证再回答（第 2 课）
   “示例市”及其票价、网址均为虚构。预先写好的模拟过程，不调用真实服务。
   网页搜索为服务端工具，结构参照官方 web search tool 文档。
   结构为示意：工具调用与工具结果字段与真实 API 一致，思考块与响应外层字段做了简化。 */
window.TRACES = window.TRACES || {};
window.TRACES["02-check-before-answer"] = {
  title: "演示：记忆可能过时，先查再答",
  task: "示例市地铁现在起步价多少钱？我要写进给游客的指南里。",
  meter: { system: 1400, max: 3000, label: "演示比例" },
  steps: [
    {
      phase: "user",
      text: "示例市地铁现在起步价多少钱？我要写进给游客的指南里。",
      api: { role: "user", content: "示例市地铁现在起步价多少钱？我要写进给游客的指南里。" },
      apiNote: "请求中带有 web_search 工具。",
      narr: "两个关键词：“现在”说明要最新信息，“写进指南”说明出错的代价不小。",
      tokens: 50
    },
    {
      phase: "think",
      text: "我记得起步价是 3 元，但这是训练数据里的信息，截止日期之后可能调整过。要写进对外的指南，必须查最新的官方信息。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "模型知道自己的知识有截止日期，票价属于“会变的信息”。",
      narr: "第 1 轮 · 思考：它没有直接说“3 元”，而是先怀疑自己的记忆。",
      tokens: 50, round: 1
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "示例市 地铁 票价 调整 2026"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_01", name: "web_search", input: { query: "示例市 地铁 票价 调整 2026" } }] },
      apiNote: "搜索由服务器执行，结果返回在同一条 assistant 消息里。",
      narr: "第 1 轮 · 行动：专门搜“调整”，因为它怀疑票价变过。",
      tokens: 110, round: 1
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["官方公告", "2026-09-01 起起步价调整为 4 元"], ["旅游网站", "起步价 3 元（2025 年文章）"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_01",
        content: [
          { type: "web_search_result", title: "示例市轨道交通票价调整公告", url: "https://metro.example.com/notice/2026-fare", page_age: "August 15, 2026", encrypted_content: "…" },
          { type: "web_search_result", title: "示例市旅游攻略：坐地铁指南", url: "https://travel.example.com/guide", page_age: "April 2, 2025", encrypted_content: "…" }
        ]
      },
      apiNote: "两个来源说法不一致。page_age 能帮助判断哪个更新。",
      narr: "第 1 轮 · 观察：两个来源打架了。旧文章说 3 元，官方公告说 4 元。",
      tokens: 400, round: 1
    },
    {
      phase: "think",
      text: "官方公告更新、更权威，以它为准。再确认一下新票价是否已经生效，有没有优惠。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "遇到冲突时优先官方、优先较新的来源。",
      narr: "第 2 轮 · 思考：判断哪个来源可信，并且想到要确认“是否已经生效”。",
      tokens: 400, round: 2
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "示例市地铁 4 元 起步价 实施 优惠"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_02", name: "web_search", input: { query: "示例市地铁 4 元 起步价 实施 优惠" } }] },
      apiNote: "第二次搜索，用来交叉核对。",
      narr: "第 2 轮 · 行动：换个角度再查一次，交叉核对。",
      tokens: 460, round: 2
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["官方页面", "新票价已于 9 月 1 日实施"], ["优惠", "使用交通卡 9 折"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_02",
        content: [{ type: "web_search_result", title: "示例市地铁 票务说明", url: "https://metro.example.com/fare", page_age: "September 3, 2026", encrypted_content: "…" }]
      },
      apiNote: "第二个官方页面印证了公告。",
      narr: "第 2 轮 · 观察：官方票务页印证了新票价，还多了一条优惠信息。",
      tokens: 600, round: 2
    },
    {
      phase: "answer",
      text: "示例市地铁起步价目前是 4 元（2026 年 9 月 1 日起调整，此前为 3 元），使用交通卡可打 9 折。来源：示例市轨道交通官网的调价公告和票务说明。网上一些旧攻略还写着 3 元，指南发布前建议再到官网核对一次。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "示例市地铁起步价目前是 4 元……", citations: [{ type: "web_search_result_location", url: "https://metro.example.com/fare", title: "示例市地铁 票务说明", cited_text: "新票价已于 9 月 1 日实施", encrypted_index: "…" }] }],
        stop_reason: "end_turn"
      },
      apiNote: "带引用的回答：每个关键事实都能点回原始页面核对。",
      narr: "完成：答案和它最初的记忆不一样。如果不查，指南里就会印上一个过时的数字。",
      tokens: 700, round: 2
    }
  ]
};

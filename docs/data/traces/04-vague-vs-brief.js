/* 演示脚本：模糊指令 vs 任务简报（第 4 课）
   同一个需求的两种交代方式。地点、网址均为虚构示例。预先写好的模拟过程，不调用真实服务。
   网页搜索为服务端工具，结构参照官方 web search tool 文档。
   结构为示意：工具调用与工具结果字段与真实 API 一致，思考块与响应外层字段做了简化。 */
window.TRACES = window.TRACES || {};

window.TRACES["04-vague"] = {
  title: "演示 A：一句话交代",
  task: "周末带孩子去哪玩？",
  meter: { system: 1400, max: 3000, label: "演示比例" },
  steps: [
    {
      phase: "user", text: "周末带孩子去哪玩？",
      api: { role: "user", content: "周末带孩子去哪玩？" },
      apiNote: "只有 9 个字。孩子多大、住哪、预算多少，模型都不知道。",
      narr: "一句很常见的话。你心里有很多条件，但一个都没说出来。",
      tokens: 20
    },
    {
      phase: "think",
      text: "不知道城市、孩子年龄和预算，只能按最常见的情况泛泛地搜。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "信息不足时，模型只能做“平均的猜测”。",
      narr: "第 1 轮 · 思考：它只能猜一个“平均的家庭”。",
      tokens: 20, round: 1
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "周末 亲子 好去处 推荐"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_01", name: "web_search", input: { query: "周末 亲子 好去处 推荐" } }] },
      apiNote: "关键词很宽泛，结果也会很宽泛。",
      narr: "第 1 轮 · 行动：关键词很宽，搜回来的也会很杂。",
      tokens: 70, round: 1
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["结果", "“周末亲子游 TOP 10”类文章若干"], ["问题", "分布在不同城市，多数是户外"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_01",
        content: [{ type: "web_search_result", title: "周末亲子游好去处 TOP 10（示例）", url: "https://example.com/top10", page_age: "June 1, 2025", encrypted_content: "…" }]
      },
      apiNote: "结果相关性一般，而且是一年多前的文章。",
      narr: "第 1 轮 · 观察：拿到的是泛泛的榜单文章。",
      tokens: 330, round: 1
    },
    {
      phase: "answer",
      text: "推荐几个适合亲子的地方：①郊野公园露营 ②海洋馆 ③农场采摘 ④主题乐园 ⑤博物馆……（共 8 个）",
      api: { role: "assistant", content: [{ type: "text", text: "推荐几个适合亲子的地方：①郊野公园露营……" }], stop_reason: "end_turn" },
      apiNote: "回答本身没错，只是对你没用。",
      narr: "回答没错，但对你没用：有的太远，有的要开车，有的是户外。",
      tokens: 480, round: 1
    },
    {
      phase: "user", text: "太远了，我们没车。而且周末下雨，孩子才 5 岁，预算 200 以内……",
      api: { role: "user", content: "太远了，我们没车。而且周末下雨，孩子才 5 岁，预算 200 以内……" },
      apiNote: "条件现在才补充进来，前面的搜索和回答都白占了上下文。",
      narr: "现在才补条件。前面那一圈等于白跑，Claude 要从头返工，你可能还得再补第三次。",
      tokens: 540
    }
  ]
};

window.TRACES["04-brief"] = {
  title: "演示 B：写一份任务简报",
  task: "（一份包含目标、背景、限制、交付形式和完成标准的简报）",
  meter: { system: 1400, max: 3000, label: "演示比例" },
  steps: [
    {
      phase: "user",
      text: "目标：周六下午带孩子出去玩 3 小时左右。背景：孩子 5 岁，我们住示例市东区，没有车，天气预报周六有雨。限制：地铁单程 40 分钟内，三个人总预算 200 元以内。交付：给我 3 个选项，做成表格，列出交通、费用、适合的理由。完成标准：每个选项都核对过周六的开放时间，并附上来源。有不清楚的先问我。",
      api: { role: "user", content: "目标：周六下午带孩子出去玩 3 小时左右。背景：…… 有不清楚的先问我。" },
      apiNote: "多花一分钟写清楚，后面每一步都有了依据。",
      narr: "同一件事，这次多写了几行：目标、背景、限制、交付形式、完成标准，最后一句“有不清楚的先问我”。",
      tokens: 200
    },
    {
      phase: "think",
      text: "条件很清楚：室内、地铁可达、适合 5 岁。只差一点：孩子对什么更感兴趣？这会影响选择，先问一句。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "简报里允许提问，模型就不必硬猜关键信息。",
      narr: "第 1 轮 · 思考：信息基本齐了，只剩一个会影响结果的问题。",
      tokens: 200, round: 1
    },
    {
      phase: "answer",
      text: "开始之前想确认一件事：孩子更喜欢动手玩（比如科技馆、手工），还是看动物、看展？",
      api: { role: "assistant", content: [{ type: "text", text: "开始之前想确认一件事：孩子更喜欢动手玩……还是看动物、看展？" }], stop_reason: "end_turn" },
      apiNote: "提问本身就是一次完整的回答，循环暂时结束，等你回复。",
      narr: "它先问一个问题，而且只问一个。这比做完再返工省事得多。",
      tokens: 250, round: 1
    },
    {
      phase: "user", text: "喜欢动手玩。",
      api: { role: "user", content: "喜欢动手玩。" },
      apiNote: "你的回答进入对话历史。",
      narr: "你只需要回答几个字。",
      tokens: 260
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "示例市东区 室内 亲子 动手 科技馆 地铁"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_01", name: "web_search", input: { query: "示例市东区 室内 亲子 动手 科技馆 地铁" } }] },
      apiNote: "关键词直接来自你的简报，搜索精准得多。",
      narr: "第 2 轮 · 行动：关键词里每个条件都来自你的简报。",
      tokens: 320, round: 2
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["候选", "科技馆、儿童手工坊、陶艺馆、自然博物馆"], ["交通", "地铁 20～35 分钟"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_01",
        content: [{ type: "web_search_result", title: "示例市科技馆 参观指南", url: "https://museum.example.com/visit", page_age: "October 28, 2026", encrypted_content: "…" }]
      },
      apiNote: "候选都满足室内、地铁可达。",
      narr: "第 2 轮 · 观察：四个候选都满足室内、地铁可达，价格还要核对。",
      tokens: 600, round: 2
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "示例市科技馆 儿童手工坊 陶艺馆 周六 开放时间 门票"]],
      api: { role: "assistant", content: [{ type: "server_tool_use", id: "srvtoolu_02", name: "web_search", input: { query: "示例市科技馆 儿童手工坊 陶艺馆 周六 开放时间 门票" } }] },
      apiNote: "这一步是为了满足你写的“完成标准”。",
      narr: "第 3 轮 · 行动：专门去核对开放时间。因为简报里写了，这一步它不会省。",
      tokens: 660, round: 3
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["科技馆", "周六 9:00–17:00，成人 30 元"], ["手工坊", "周六需预约，亲子套票 158 元"], ["陶艺馆", "每人 88 元"], ["自然博物馆", "周六开放，免费需预约"]],
      api: {
        type: "web_search_tool_result", tool_use_id: "srvtoolu_02",
        content: [{ type: "web_search_result", title: "示例市科技馆 开放时间", url: "https://museum.example.com/hours", page_age: "November 1, 2026", encrypted_content: "…" }]
      },
      apiNote: "核对结果进入上下文，可以作为引用来源。",
      narr: "第 3 轮 · 观察：开放时间、价格都核对过了，还发现两处需要预约、一处超预算。",
      tokens: 880, round: 3
    },
    {
      phase: "answer",
      text: "3 个选项（都是室内、地铁可达）：①示例市科技馆：地铁 25 分钟，约 90 元，动手展区多 ②儿童手工坊：地铁 20 分钟，亲子套票 158 元 ③自然博物馆：地铁 35 分钟，免费需预约。开放时间均已核对，来源附在表格每一行。提醒：②和③需要提前预约。另有一家陶艺馆约 264 元，超出预算，没有列入，需要的话告诉我。",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "3 个选项（都是室内、地铁可达）……", citations: [{ type: "web_search_result_location", url: "https://museum.example.com/hours", title: "示例市科技馆 开放时间", cited_text: "周六 9:00–17:00", encrypted_index: "…" }] }],
        stop_reason: "end_turn"
      },
      apiNote: "完成标准写得可检查（核对开放时间、附来源），模型就知道什么时候算做完。",
      narr: "完成：一次到位。它还说明了超预算的陶艺馆为什么没列入，因为你写清楚了限制。",
      tokens: 1000, round: 3
    }
  ]
};

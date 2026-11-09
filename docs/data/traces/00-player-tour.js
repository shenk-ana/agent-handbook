/* 演示脚本：演示播放器使用说明（第 0 课）
   预先写好的模拟过程，不调用真实服务。网页搜索在 API 中是服务端工具，
   结构参照官方 web search tool 文档：server_tool_use → web_search_tool_result → 带引用的 text。
   URL 均为示例地址。
   结构为示意：工具调用与工具结果字段与真实 API 一致，思考块与响应外层字段做了简化。 */
window.TRACES = window.TRACES || {};
window.TRACES["00-player-tour"] = {
  title: "演示：先学会看演示",
  task: "这周哪天适合晾被子？帮我看一下天气。",
  meter: { system: 1200, max: 3000, label: "演示比例，真实上下文窗口远大于此" },
  steps: [
    {
      phase: "user",
      text: "这周哪天适合晾被子？帮我看一下天气。",
      api: { role: "user", content: "这周哪天适合晾被子？帮我看一下天气。" },
      apiNote: "API 视角显示程序和 Claude 之间真正传递的消息。你现在看到的是你发出的第一条 user 消息。",
      narr: "第 1 步：你的问题。底部一排小圆点是全部步骤，点任意一个可以直接跳过去。",
      tokens: 40
    },
    {
      phase: "think",
      text: "天气是会变的实时信息，我不能凭记忆回答，要先搜索本周预报。",
      api: { type: "thinking", note: "模型内部推理（默认不返回原文）" },
      apiNote: "思考发生在模型内部。为了看清楚，演示把它单独拆成一步。",
      narr: "紫色是“思考”。循环图里点亮的圆圈，告诉你现在处在哪个阶段。",
      tokens: 40, round: 1
    },
    {
      phase: "act", tool: "网页搜索",
      kv: [["关键词", "本周天气预报 晴 湿度"]],
      api: {
        role: "assistant",
        content: [{ type: "server_tool_use", id: "srvtoolu_01", name: "web_search", input: { query: "本周天气预报 晴 湿度" } }]
      },
      apiNote: "网页搜索是由 Anthropic 服务器执行的“服务端工具”，所以搜索调用和结果会出现在同一条 assistant 消息里。",
      narr: "琥珀色是“行动”：Claude 决定用哪个工具、带什么参数。点底部向右的箭头前进一步（电脑上也可按 → 键）。",
      tokens: 90, round: 1
    },
    {
      phase: "observe", tool: "网页搜索",
      kv: [["周三", "晴，湿度 40%"], ["周四", "多云转阴"], ["周五", "小雨"], ["来源", "example.com/weather"]],
      api: {
        type: "web_search_tool_result",
        tool_use_id: "srvtoolu_01",
        content: [{ type: "web_search_result", title: "本周天气预报（示例）", url: "https://example.com/weather", page_age: "November 2, 2026", encrypted_content: "…" }]
      },
      apiNote: "搜索结果以 web_search_tool_result 内容块返回。encrypted_content 在多轮对话中需要原样带回。",
      narr: "青绿色是“观察”：工具返回的结果。循环图下方的上下文条变长了，结果会占用“桌面”空间。",
      tokens: 260, round: 1
    },
    {
      phase: "think",
      text: "周三晴、湿度低，最适合；周五有雨，要提醒别晾。",
      api: { type: "thinking", note: "模型内部推理" },
      apiNote: "模型根据搜索结果重新判断。",
      narr: "看完结果再想一次。点底部的暂停按钮可以随时停下，再点箭头一步一步看。",
      tokens: 260, round: 2
    },
    {
      phase: "answer",
      text: "周三最适合晾被子：晴天、湿度约 40%。周四转阴可以收回，周五有小雨，别晾在外面。（来源：example.com/weather）",
      api: {
        role: "assistant",
        content: [{ type: "text", text: "周三最适合晾被子：晴天、湿度约 40%……", citations: [{ type: "web_search_result_location", url: "https://example.com/weather", title: "本周天气预报（示例）", cited_text: "周三 晴 湿度 40%", encrypted_index: "…" }] }],
        stop_reason: "end_turn"
      },
      apiNote: "回答里的 citations 就是你在应用里看到的“来源”标记。stop_reason 为 end_turn，本轮结束。",
      narr: "完成。这就是全部操作：播放、暂停、单步、跳转、切换视角。所有演示都是预先写好的回放。",
      tokens: 330, round: 2
    }
  ]
};

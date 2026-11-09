/* 第 3 课专属交互：“我想做 X → 用哪个”选择器。
   只操作本页 #family-picker 容器。产品信息截至 2026-11，来源见课程正文与交付报告。 */
(function () {
  "use strict";
  var GOALS = [
    {
      id: "chat", label: "问问题、写东西、翻译、出点子",
      pick: "Claude 应用（网页、电脑或手机）",
      why: "最简单的起点。打开 claude.ai 或下载 App，直接对话。免费账号也能用。",
      tip: "同一个账号在网页、桌面和手机上的对话会同步，换设备接着聊。"
    },
    {
      id: "fresh", label: "查最新信息，并且要有出处",
      pick: "Claude 应用 + 网页搜索",
      why: "网页搜索会在回答里附上来源链接，方便你核对。",
      tip: "团队版需要管理员先在组织设置里开启网页搜索。"
    },
    {
      id: "docs", label: "反复用同一批资料（课程讲义、公司手册）",
      pick: "Claude 应用里的 Projects",
      why: "把资料和固定要求放进一个项目，之后在项目里开的每个对话都能用上，不用每次重新上传。",
      tip: "第 5 课专门讲 Projects、文件和记忆。"
    },
    {
      id: "files", risk: true, label: "让它整理电脑上的文件、做表格和文档（不写代码）",
      pick: "Claude Cowork",
      why: "Cowork 把 Claude Code 的“动手能力”带给不写代码的人，能处理你连接的文件夹、生成文档和表格。",
      tip: "需要付费套餐。桌面应用里功能最完整；只给它访问需要的文件夹。"
    },
    {
      id: "browser", risk: true, label: "让它在网页上替我点击、填表",
      pick: "Claude in Chrome",
      why: "这个浏览器扩展能让 Claude 阅读网页、点击、输入和填写表单。",
      tip: "需要付费套餐，只支持电脑上的 Google Chrome。直接操作网站有安全风险，先读第 9 课。"
    },
    {
      id: "cli", label: "改代码、跑测试、修 bug（习惯命令行）",
      pick: "Claude Code（终端 CLI）",
      why: "功能最全的 Claude Code 形态，在项目目录里输入 claude 就能开始。",
      tip: "第 11 课从安装讲起。需要 Claude 订阅或 Anthropic Console 账号。"
    },
    {
      id: "gui", label: "写代码，但更喜欢图形界面",
      pick: "Claude Code：桌面应用里的 Code，或 VS Code / JetBrains 插件",
      why: "桌面应用可以直观地看改动、同时开几个会话；IDE 插件让你在编辑器里直接看差异。",
      tip: "桌面端的 Code 需要付费订阅；JetBrains 插件需要另外安装 CLI。"
    },
    {
      id: "cloud", label: "手边没有开发环境，或想把长任务交给云端",
      pick: "Claude Code 网页版（claude.ai/code）",
      why: "在浏览器里运行，不用本地安装，适合长时间任务和并行跑几个任务；也能在 Claude 手机 App 上查看。",
      tip: "适合处理放在代码托管平台上的仓库。"
    },
    {
      id: "build", label: "把 Claude 做进自己的产品或脚本",
      pick: "Claude API；需要 Claude Code 同款工具时用 Claude Agent SDK",
      why: "API 让你的程序直接调用模型；Agent SDK 把 Claude Code 的循环、内置工具和权限做成 Python / TypeScript 库。",
      tip: "按用量计费，需要 API 密钥。第 22 课详细讲。"
    }
  ];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function init() {
    var box = document.getElementById("family-picker");
    if (!box) return;
    box.innerHTML = "";
    box.appendChild(el("p", "fp-ask", "我想……"));
    var opts = el("div", "fp-opts");
    opts.setAttribute("role", "group");
    opts.setAttribute("aria-label", "选择你想做的事");
    var out = el("div", "fp-out");
    out.setAttribute("aria-live", "polite");
    var btns = [];
    function show(g) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b._id === g.id)); });
      out.innerHTML = "";
      out.appendChild(el("div", "fp-k", "推荐"));
      out.appendChild(el("div", "fp-pick", g.pick));
      out.appendChild(el("p", "fp-why", g.why));
      out.appendChild(el("p", "fp-tip", (g.risk ? "⚠ " : "") + g.tip));
      out.classList.add("on");
    }
    GOALS.forEach(function (g) {
      var b = el("button", "fp-opt", g.label);
      b.type = "button";
      b._id = g.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { show(g); });
      btns.push(b);
      opts.appendChild(b);
    });
    out.appendChild(el("p", "fp-why", "点上面的任意一项，这里会显示推荐。产品信息截至 2026-11。"));
    box.appendChild(opts);
    box.appendChild(out);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

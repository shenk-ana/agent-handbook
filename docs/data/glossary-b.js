/* 术语分片 b：由写作 agent B（第 6–10 课）维护。字段说明见 data/glossary.js 头部。 */
window.GLOSSARY = (window.GLOSSARY || []).concat([
  {
    id: "connector", term: "连接器", en: "Connector", cat: "claude",
    plain: "让 Claude 能访问你在别处的数据和服务（邮箱、日历、网盘、文档、任务管理等）的“接线”。连上之后，Claude 才能替你查日程、找文件、起草邮件。",
    analogy: "像给助理配了一张门禁卡：卡能开哪几扇门，由你在授权时决定。",
    tech: "Claude 应用中基于 MCP 的集成。官方目录中的连接器和用户自己添加的自定义连接器都通过远程 MCP 服务器提供工具；桌面应用另可安装在本机运行的扩展（本地 MCP 服务器）。登录 Claude 账号后，claude.ai 中添加的连接器也会出现在 Claude Code 的 /mcp 列表里。",
    lessons: [6, 7, 8, 9, 10, 14], resources: ["mcp-servers"]
  },
  {
    id: "oauth", term: "OAuth 授权", en: "OAuth", cat: "safety",
    plain: "连接器常用的“授权登录”方式：你在服务商自己的页面登录并点“允许”，Claude 拿到的是一张有范围、可撤销的通行证，而不是你的密码。",
    analogy: "酒店给你的房卡：只开指定房间、到期失效，丢了可以挂失，不用换门锁。",
    tech: "一种授权框架：客户端引导用户到授权服务器同意指定 scope，换取访问令牌（access token）并可刷新。MCP 推荐远程服务器用 OAuth 获取令牌；令牌可在服务商安全设置或 Claude 的连接器设置中撤销。",
    lessons: [6, 9, 14]
  },
  {
    id: "skill", term: "Skill（技能）", en: "Agent Skill", cat: "claude",
    plain: "一个打包好的“做事说明书”文件夹：里面有步骤说明，可能还有模板、参考资料和脚本。平时只占一行简介，遇到相关任务时 Claude 才把它翻开来照着做。",
    analogy: "公司里的标准作业手册：放在书架上不占桌面，接到对应的活儿才拿下来看。",
    tech: "以 SKILL.md（YAML frontmatter 含 name、description，正文为指令）为入口的目录，可附带参考文件与可执行脚本。采用渐进式加载：启动时只把 name 与 description 放进上下文，触发后再读取正文与所需文件。可用于 Claude 应用、Claude Code（~/.claude/skills/ 或 .claude/skills/）与 Claude API（需代码执行工具）。",
    lessons: [4, 7, 8, 9, 10, 13], resources: ["anthropic-skills"]
  },
  {
    id: "progressive-disclosure", term: "渐进式加载", en: "Progressive Disclosure", cat: "arch",
    plain: "Skill 的省空间做法：先只让 Claude 知道“有这本手册、它管什么”，真用到时再翻开正文，正文里提到的附件也是用到哪份读哪份。",
    tech: "Skills 的三级加载：第 1 级元数据（name + description，约百来个 token，常驻系统提示词）；第 2 级 SKILL.md 正文（触发时读取）；第 3 级附带文件与脚本（按需读取，脚本只有输出进入上下文）。因此可以安装很多 Skill 而不明显占用上下文。",
    lessons: [7]
  },
  {
    id: "artifact", term: "Artifact（作品）", en: "Artifact", cat: "claude",
    plain: "Claude 在对话旁边单独打开的一份“成品”：文档、网页、小工具、图表、演示文稿等。可以接着改、以后再打开，也可以分享给别人。",
    analogy: "像和设计师一边聊一边看他在白板上画稿：稿子单独摆着，随时能指着说“这里改一下”。",
    tech: "Claude 应用中独立于对话消息的可交互内容，保存在侧栏的 Artifacts 中，默认仅创建者可见，可设置分享范围；部分可连接应用、存储数据或调用 Claude。Claude Code 也能把会话产出发布为 Artifact。具体类型与套餐以官方帮助中心为准。",
    lessons: [8, 9, 10]
  },
  {
    id: "least-privilege", term: "最小权限", en: "Principle of Least Privilege", cat: "safety",
    plain: "只给 Agent 完成这件事“刚好够用”的权限：只读就够的不给写，一个文件夹够用的不给整个硬盘，用完就收回。",
    analogy: "请人来家里修水管，只给他厨房钥匙，不给保险柜密码。",
    tech: "安全设计原则：每个主体只拥有完成任务所需的最小访问范围与最短时长。在 Agent 中体现为按会话启用连接器、关闭不需要的工具、限定工作目录、只读 scope、Claude Code 的 deny 规则与沙箱等，用来缩小提示注入等攻击得手后的影响范围。",
    lessons: [6, 9, 12, 14, 19, 21]
  },
  {
    id: "data-privacy", term: "数据隐私", en: "Data Privacy", cat: "safety",
    plain: "你交给 Claude 的内容（聊天、文件、连接器读到的数据）会去哪、保存多久、会不会被用来训练模型，以及哪些东西压根不该交出去。",
    tech: "涉及数据最小化、保留期限、训练使用设置与访问控制。截至 2026-11，个人账户可在“设置 → 隐私”中控制是否允许用对话改进模型，无痕对话不用于训练；商业产品默认不用于训练。具体以 privacy.claude.com 为准。",
    lessons: [8, 9]
  },
  {
    id: "data-exfiltration", term: "数据外泄", en: "Data Exfiltration", cat: "safety",
    plain: "你的私人信息被悄悄送到了不该去的地方，比如被藏在网页里的恶意指令骗着发给陌生地址。",
    tech: "攻击者诱使 Agent 通过可用的输出通道（发邮件、发请求、写入共享文件、拼接链接等）把敏感数据传出信任边界。通常与提示注入配合出现；防御靠最小权限、限制网络出口、敏感操作人工确认。",
    lessons: [7, 9, 21]
  },
  {
    id: "scheduled-task", term: "定时任务", en: "Scheduled Task", cat: "claude",
    plain: "把一件事设置一次，之后 Claude 按你定的频率（每小时、每天、每周……）自动去做，你回来看结果就行，比如每天早上的日程简报。",
    tech: "截至 2026-11，Claude 付费套餐可在 Cowork 中创建定时任务：每次运行是一个独立会话，可选频率与审批模式，可暂停、编辑或手动触发；需要本地文件或应用的任务只在本机运行。Claude Code 另有自己的循环与定时机制（如 /loop），属于不同功能，以官方文档为准。",
    lessons: [10, 23]
  }
]);

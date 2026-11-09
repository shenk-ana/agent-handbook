/* 第 2 课专属交互：“这件事适合交给 Agent 吗？”
   只操作本页 #delegate-check 容器，不使用 localStorage。 */
(function () {
  "use strict";
  var LABELS = { ok: "放心交给它", check: "交给它，但要核对", no: "别交给它 / 你来拍板" };
  var CASES = [
    {
      q: "帮你给一段自己写的文字挑错别字、理顺语句。",
      a: "ok",
      why: "材料是你给的，改得对不对你一眼就能看出来，出错的代价也很小。"
    },
    {
      q: "总结一份 50 页的行业报告，列出五个要点。",
      a: "check",
      why: "Claude 很擅长读长文，但可能漏掉重点，或者把数字记错。请它标出每个要点出自第几页，抽查几处。"
    },
    {
      q: "问它：我正在吃的两种药能不能一起吃？然后照它说的做。",
      a: "no",
      why: "健康决定不能只靠 AI。可以让它帮你整理要问医生或药师的问题，但结论要听专业人士的。"
    },
    {
      q: "为公司年会想十个主题点子。",
      a: "ok",
      why: "创意类任务没有唯一正确答案，好不好你自己挑。这正是它擅长又低风险的事。"
    },
    {
      q: "查一下明天早上的航班有没有变动。",
      a: "check",
      why: "让它上网查很省事，但航班信息变得快，网页也可能没更新。出门前到航空公司官方渠道再确认一次。"
    },
    {
      q: "替你决定买哪只股票，并直接下单。",
      a: "no",
      why: "涉及钱、而且很难撤回的决定，不该交给 AI 自主执行。它可以帮你整理资料，决定和操作由你来。"
    },
    {
      q: "以你的名义直接给客户发一封道歉邮件，不用先给你看。",
      a: "no",
      why: "对外发出、以你名义、发了就收不回。让它起草可以，发之前你一定要看一遍，自己点发送。"
    }
  ];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function init() {
    var box = document.getElementById("delegate-check");
    if (!box) return;
    box.innerHTML = "";
    var score = el("p", "dc-score");
    score.setAttribute("aria-live", "polite");
    var answered = 0, right = 0;
    function paintScore() {
      score.textContent = answered < CASES.length
        ? "已判断 " + answered + " / " + CASES.length + " 件事"
        : "全部完成：" + right + " / " + CASES.length + " 与本书的建议一致。判断标准只有两条：出错的代价有多大？结果你能不能轻松核对？";
    }
    var list = el("ol", "dc-list");
    CASES.forEach(function (c, i) {
      var li = el("li", "dc-item");
      li.appendChild(el("p", "dc-q", c.q));
      var opts = el("div", "dc-opts");
      opts.setAttribute("role", "group");
      opts.setAttribute("aria-label", "第 " + (i + 1) + " 件事的判断");
      var fb = el("p", "dc-fb");
      fb.hidden = true;
      Object.keys(LABELS).forEach(function (k) {
        var b = el("button", "dc-opt dc-" + k, LABELS[k]);
        b.type = "button";
        b.addEventListener("click", function () {
          if (li.classList.contains("done")) return;
          li.classList.add("done");
          var ok = k === c.a;
          answered++; if (ok) right++;
          Array.prototype.forEach.call(opts.children, function (x) {
            x.disabled = true;
            if (x === b) x.classList.add(ok ? "is-right" : "is-wrong");
            if (x.classList.contains("dc-" + c.a)) x.classList.add("is-right");
          });
          fb.textContent = (ok ? "✅ 一致。" : "🤔 本书的建议是“" + LABELS[c.a] + "”。") + c.why;
          fb.hidden = false;
          paintScore();
        });
        opts.appendChild(b);
      });
      li.appendChild(opts);
      li.appendChild(fb);
      list.appendChild(li);
    });
    var reset = el("button", "dc-reset", "重新判断");
    reset.type = "button";
    reset.addEventListener("click", function () {
      init();
      // 重建后把焦点放回第一题，避免键盘和读屏用户的焦点掉回页面开头
      var first = document.querySelector("#delegate-check .dc-opt");
      if (first) first.focus();
    });
    box.appendChild(list);
    box.appendChild(score);
    box.appendChild(reset);
    paintScore();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

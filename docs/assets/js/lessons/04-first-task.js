/* 第 4 课专属交互：任务简报生成器。
   只操作本页 #brief-builder 容器。草稿仅保存在本机浏览器（localStorage，读写均包在 try/catch 中）。 */
(function () {
  "use strict";
  var KEY = "ah-04-brief-draft";
  var FIELDS = [
    { id: "goal", label: "① 目标：你想要什么结果？", ph: "例如：周六下午带孩子出去玩 3 小时左右" },
    { id: "context", label: "② 背景：Claude 需要知道什么？", ph: "例如：孩子 5 岁，我们住在东区，没有车，周六预报有雨" },
    { id: "limits", label: "③ 限制：必须遵守什么、哪些事不许做？", ph: "例如：地铁单程 40 分钟内，三个人总预算 200 元以内，不要推荐需要开车的地方" },
    { id: "format", label: "④ 交付：做成什么样子？", ph: "例如：3 个选项，做成表格，列出交通、费用、推荐理由" },
    { id: "done", label: "⑤ 完成标准：怎样才算做完？", ph: "例如：每个选项都核对过周六的开放时间，并附上来源" }
  ];
  var PREFIX = { goal: "目标：", context: "背景：", limits: "限制：", format: "交付：", done: "完成标准：" };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 忽略 */ } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { /* 忽略 */ } }

  function copy(text, btn) {
    function done(ok) { btn.textContent = ok ? "已复制" : "复制失败，请手动选择文字"; setTimeout(function () { btn.textContent = "复制简报"; }, 1800); }
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  function init() {
    var box = document.getElementById("brief-builder");
    if (!box) return;
    box.innerHTML = "";
    var state = load();
    var form = el("div", "bb-form");
    var inputs = {};
    FIELDS.forEach(function (f) {
      var wrap = el("label", "bb-field");
      wrap.appendChild(el("span", "bb-label", f.label));
      var ta = el("textarea", "bb-input");
      ta.rows = 2;
      ta.placeholder = f.ph;
      ta.value = state[f.id] || "";
      ta.addEventListener("input", render);
      inputs[f.id] = ta;
      wrap.appendChild(ta);
      form.appendChild(wrap);
    });
    var askWrap = el("label", "bb-check");
    var ask = document.createElement("input");
    ask.type = "checkbox";
    ask.checked = state.ask !== false;
    ask.addEventListener("change", render);
    askWrap.appendChild(ask);
    askWrap.appendChild(el("span", null, "⑥ 加上“有不清楚的先问我”"));
    form.appendChild(askWrap);

    var outHead = el("div", "bb-out-head");
    outHead.appendChild(el("span", "bb-k", "拼好的简报"));
    var meter = el("span", "bb-meter");
    outHead.appendChild(meter);
    var out = el("pre", "bb-out");
    out.setAttribute("aria-live", "polite");
    var actions = el("div", "bb-actions");
    var bCopy = el("button", "bb-btn primary", "复制简报");
    bCopy.type = "button";
    var bEx = el("button", "bb-btn", "填入示例");
    bEx.type = "button";
    var bClear = el("button", "bb-btn", "清空");
    bClear.type = "button";
    actions.appendChild(bCopy); actions.appendChild(bEx); actions.appendChild(bClear);

    function text() {
      var lines = [];
      FIELDS.forEach(function (f) { var v = inputs[f.id].value.trim(); if (v) lines.push(PREFIX[f.id] + v); });
      if (ask.checked) lines.push("开始之前，如果有不清楚或者会影响结果的地方，请先问我，一次最多问三个问题。");
      return lines.join("\n");
    }
    function render() {
      var t = text();
      var filled = FIELDS.filter(function (f) { return inputs[f.id].value.trim(); }).length;
      out.textContent = t || "在上面填几栏，这里会拼出一份可以直接复制给 Claude 的简报。不必每栏都填，但目标一定要有。";
      out.classList.toggle("empty", !t);
      meter.textContent = "已填 " + filled + " / 5 栏" + (filled && !inputs.goal.value.trim() ? " · 还缺目标" : "");
      // 只在有内容时保存草稿；全部清空时删除草稿
      if (filled) {
        var v = { ask: ask.checked };
        FIELDS.forEach(function (f) { v[f.id] = inputs[f.id].value; });
        save(v);
      } else {
        clear();
      }
    }
    bCopy.addEventListener("click", function () { var t = text(); if (t) copy(t, bCopy); });
    bEx.addEventListener("click", function () {
      var hasDraft = FIELDS.some(function (f) { return inputs[f.id].value.trim(); });
      if (hasDraft && !window.confirm("填入示例会覆盖你已经写的内容，确定吗？")) return;
      FIELDS.forEach(function (f) { inputs[f.id].value = f.ph.replace(/^例如：/, ""); });
      ask.checked = true;
      render();
    });
    bClear.addEventListener("click", function () {
      FIELDS.forEach(function (f) { inputs[f.id].value = ""; });
      ask.checked = true;
      render(); // 内容为空时 render 会删除草稿
    });

    box.appendChild(form);
    box.appendChild(outHead);
    box.appendChild(out);
    box.appendChild(actions);
    box.appendChild(el("p", "bb-note", "填写的内容只保存在你这台设备的浏览器里，不会上传。"));
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

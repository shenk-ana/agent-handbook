/* ==========================================================
   player.js：Agent 运行回放器
   用法：<div class="player" data-trace="agent-loop"></div>
         并在它之前加载 data/traces/agent-loop.js
   功能：对话视角 / API 视角切换、播放/暂停/单步/跳转/倍速、
         Agent 循环图（思考·行动·观察）高亮与流动光点、上下文占用条、旁白。
   键盘：焦点在回放器上时，空格 = 播放/暂停，← → = 上一步/下一步
   尊重 prefers-reduced-motion：不打字、不移动光点，仍可手动单步。
   confirm 步：可选 options（按钮文字数组）、choice（被选中的序号）、reject: true（选中的是拒绝，显示为红色）。
   answer 步：最后一步或 final: true 时显示“任务完成”；中途的回答（如先提问）可写 final: false，显示“等你回复”。
   ========================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var IC = {
    play: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    prev: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    restart: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>'
  };

  var PHASE_NODE = { think: "think", act: "act", confirm: "act", observe: "observe" };
  var ORDER = ["think", "act", "observe"];
  var CHAT_WHO = { user: "你", think: "💭 Claude 在想", act: "🔧 调用工具", observe: "📥 工具返回", confirm: "⏸ 需要你确认", answer: "✨ Claude" };
  var API_WHO = { user: "→ 程序发给 Claude（user）", think: "💭 模型内部推理", act: "← Claude 返回（assistant）", observe: "→ 程序发回工具结果（user）", confirm: "⏸ 程序在执行前询问你", answer: "← Claude 返回（assistant）" };

  /* ---------- 循环图 ---------- */
  var C = { x: 120, y: 124, R: 80, r: 30 };
  var ANG = { think: -90, act: 30, observe: 150 };
  function pt(deg, R) { var a = (deg * Math.PI) / 180; return [C.x + R * Math.cos(a), C.y + R * Math.sin(a)]; }
  function arcPath(fromDeg, toDeg) {
    var gap = 25;
    var a = pt(fromDeg + gap, C.R), b = pt(toDeg - gap, C.R);
    return "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " A" + C.R + " " + C.R + " 0 0 1 " + b[0].toFixed(1) + " " + b[1].toFixed(1);
  }
  function loopSVG(uid) {
    var nodes = { think: ["思考", "Think"], act: ["行动", "Act"], observe: ["观察", "Observe"] };
    var arrows = [["think", "act", ANG.think, ANG.act], ["act", "observe", ANG.act, ANG.observe], ["observe", "think", ANG.observe, ANG.think + 360]];
    var s = '<svg class="loop-svg" viewBox="0 0 240 236" role="img" aria-label="Agent 循环示意图：思考、行动、观察三个阶段循环">' +
      '<defs><marker id="ah-arr-' + uid + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor" style="color:var(--text-3)"/></marker></defs>';
    arrows.forEach(function (a) {
      s += '<path class="arrow" data-from="' + a[0] + '" data-to="' + a[1] + '" d="' + arcPath(a[2], a[3]) + '" marker-end="url(#ah-arr-' + uid + ')"/>';
    });
    s += '<text class="center-label" x="' + C.x + '" y="' + (C.y - 2) + '">Agent 循环</text>' +
      '<text class="center-sub" x="' + C.x + '" y="' + (C.y + 16) + '">等待任务</text>';
    Object.keys(nodes).forEach(function (k) {
      var p = pt(ANG[k], C.R);
      s += '<g class="node ' + k + '" data-node="' + k + '">' +
        '<circle class="halo" cx="' + p[0] + '" cy="' + p[1] + '" r="' + C.r + '"/>' +
        '<circle class="bg" cx="' + p[0] + '" cy="' + p[1] + '" r="' + C.r + '"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] - 5) + '">' + nodes[k][0] + "</text>" +
        '<text class="sub" x="' + p[0] + '" y="' + (p[1] + 11) + '">' + nodes[k][1] + "</text></g>";
    });
    var ap = pt(ANG.act, C.R);
    s += '<g class="pause-badge"><rect x="' + (ap[0] - 42) + '" y="' + (ap[1] + 36) + '" width="84" height="22" rx="11"/>' +
      '<text x="' + ap[0] + '" y="' + (ap[1] + 51) + '" text-anchor="middle" font-size="11" font-weight="700">⏸ 等你确认</text></g>';
    s += '<circle class="dot" r="5" cx="-20" cy="-20" opacity="0"/></svg>';
    return s;
  }

  /* ---------- 回放器 ---------- */
  var uidSeq = 0;
  function Player(host, trace) {
    this.host = host;
    this.trace = trace;
    this.steps = trace.steps || [];
    this.i = -1;
    this.view = "chat";
    this.speed = 1;
    this.playing = false;
    this.timers = [];
    this.uid = ++uidSeq;
    this.build();
    this.update(false);
  }

  Player.prototype.build = function () {
    var self = this, t = this.trace, host = this.host;
    host.innerHTML = "";
    host.setAttribute("tabindex", "0");
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", t.title || "Agent 演示");

    var head = h("div", "pl-head");
    head.appendChild(h("div", "pl-title", '<span class="live" aria-hidden="true"></span>' + esc(t.title || "演示")));
    var view = h("div", "pl-view");
    view.setAttribute("role", "group");
    view.setAttribute("aria-label", "显示方式");
    this.skin = t.skin || "chat";
    if (this.skin === "terminal") host.classList.add("skin-terminal");
    var chatLabel = this.skin === "terminal" ? "Claude Code 视角" : "对话视角";
    [["chat", chatLabel], ["api", "API 视角"]].forEach(function (v) {
      var b = h("button", null, v[1]);
      b.type = "button";
      b.setAttribute("data-view", v[0]);
      b.setAttribute("aria-pressed", String(v[0] === "chat"));
      b.title = v[0] === "api" ? "查看每一步底层的 API 消息结构" : (self.skin === "terminal" ? "模拟 Claude Code 终端里看到的过程" : "像聊天一样看过程");
      b.addEventListener("click", function () { self.setView(v[0]); });
      view.appendChild(b);
    });
    head.appendChild(view);

    var bodyEl = h("div", "pl-body");
    this.stage = h("div", "pl-stage");
    this.stage.setAttribute("aria-live", "polite");
    var side = h("div", "pl-side");
    var loopWrap = h("div", "loop-wrap", loopSVG(this.uid));
    this.narr = h("div", "pl-narr", '<span class="k">旁白</span><span class="txt">点击播放，看 Claude 如何一步步完成任务。</span>');
    var m = t.meter || { system: 1000, max: 4000 };
    this.meter = h("div", "pl-meter",
      '<div class="lbl"><span>上下文占用</span><b>0</b></div>' +
      '<div class="bar"><i class="sys"></i><i class="conv"></i></div>' +
      '<div class="legend"><span><i style="background:var(--text-3)"></i>系统提示词 + 工具定义</span><span><i style="background:var(--phase-think)"></i>对话与工具结果</span></div>' +
      (m.label ? '<div class="legend">' + esc(m.label) + "</div>" : ""));
    side.appendChild(loopWrap);
    side.appendChild(this.narr);
    side.appendChild(this.meter);
    bodyEl.appendChild(this.stage);
    bodyEl.appendChild(side);
    this.svg = loopWrap.querySelector("svg");

    var ctrl = h("div", "pl-ctrl");
    function btn(cls, icon, label, fn) {
      var b = h("button", "c " + cls, icon);
      b.type = "button"; b.setAttribute("aria-label", label); b.title = label;
      b.addEventListener("click", fn);
      ctrl.appendChild(b);
      return b;
    }
    this.bRestart = btn("restart", IC.restart, "从头开始", function () { self.jump(-1); self.play(); });
    this.bPrev = btn("prev", IC.prev, "上一步", function () { self.pause(); self.jump(self.i - 1); });
    this.bPlay = btn("play", IC.play, "播放", function () { self.playing ? self.pause() : self.play(); });
    this.bNext = btn("next", IC.next, "下一步", function () { self.pause(); self.step(); });
    this.bar = h("div", "pl-steps");
    this.steps.forEach(function (s, k) {
      var d = h("button", "p-" + s.phase);
      d.type = "button";
      d.setAttribute("aria-label", "跳到第 " + (k + 1) + " 步");
      d.addEventListener("click", function () { self.pause(); self.jump(k); });
      self.bar.appendChild(d);
    });
    ctrl.appendChild(this.bar);
    this.count = h("span", "pl-count", "0 / " + this.steps.length);
    ctrl.appendChild(this.count);
    var sp = h("select", "pl-speed");
    sp.setAttribute("aria-label", "播放速度");
    [0.5, 1, 1.5, 2].forEach(function (v) { var o = h("option", null, v + "×"); o.value = v; if (v === 1) o.selected = true; sp.appendChild(o); });
    sp.addEventListener("change", function () { self.speed = Number(sp.value); });
    ctrl.appendChild(sp);

    this.cover = h("div", "pl-cover",
      '<div class="task">任务：<b>' + esc(t.task || "") + "</b></div>" +
      '<button class="go" type="button">' + IC.play.replace("<svg", '<svg width="16" height="16"') + " 播放演示</button>" +
      '<div class="hint">也可以点底部的箭头按钮一步一步看。电脑上按空格键播放/暂停，← → 切换步骤。</div>');
    this.cover.querySelector(".go").addEventListener("click", function () { self.play(); host.focus({ preventScroll: true }); });

    host.appendChild(head);
    host.appendChild(bodyEl);
    host.appendChild(ctrl);
    host.appendChild(this.cover);

    host.addEventListener("keydown", function (e) {
      if (e.target !== host) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); self.playing ? self.pause() : self.play(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); self.pause(); self.step(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); self.pause(); self.jump(self.i - 1); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting && self.playing) self.pause(); }); }, { threshold: 0.15 }).observe(host);
    }
  };

  Player.prototype.clearTimers = function () { this.timers.forEach(clearTimeout); this.timers = []; };
  Player.prototype.later = function (fn, ms) { var id = setTimeout(fn, ms); this.timers.push(id); return id; };

  Player.prototype.renderMsg = function (s, animate) {
    var self = this;
    var api = this.view === "api";
    var wrap = h("div", "msg " + s.phase + (api ? " api" : ""));
    if (!animate) wrap.style.animation = "none";
    var who = (api ? API_WHO : CHAT_WHO)[s.phase] || s.who || "";
    if (!api && (s.phase === "act" || s.phase === "observe") && s.tool) who += " · " + s.tool;
    wrap.appendChild(h("div", "who", esc(who)));
    var bubble = h("div", "bubble");
    var typeTarget = null, typeText = "";

    var term = !api && this.skin === "terminal";
    if (api) {
      if (s.api) bubble.appendChild(h("pre", "json", esc(JSON.stringify(s.api, null, 2))));
      if (s.apiNote) bubble.appendChild(h("p", "api-note", esc(s.apiNote)));
    } else if (term && s.phase === "act") {
      bubble.innerHTML = '<span class="t-tool">' + esc(s.tool) + "</span>(" + esc(s.arg || "") + ")";
    } else if (term && s.phase === "observe") {
      bubble.innerHTML = (s.out || []).map(function (line) {
        var cls = /^\+/.test(line) ? "t-add" : /^-/.test(line) ? "t-del" : /^(✓|PASS)/.test(line) ? "t-ok" : /^(✗|FAIL)/.test(line) ? "t-bad" : "";
        return '<span class="t-line ' + cls + '">' + esc(line) + "</span>";
      }).join("");
    } else if (term && s.phase === "confirm") {
      var tpick = typeof s.choice === "number" ? s.choice : 0;
      bubble.innerHTML = '<span class="t-q">' + esc(s.text) + "</span>" + (s.options || []).map(function (o, k) {
        return '<span class="t-opt' + (k === tpick ? " sel" + (s.reject ? " no" : "") : "") + '">' + (k === tpick ? "❯ " : "&nbsp;&nbsp;") + (k + 1) + ". " + esc(o) + "</span>";
      }).join("");
    } else if (s.phase === "act" || s.phase === "observe") {
      var html = s.phase === "act" ? "<span class=\"kv\"><b>" + esc(s.tool) + "</b>(</span>" : "";
      (s.kv || []).forEach(function (p) { html += '<span class="kv">' + (s.phase === "act" ? "&nbsp;&nbsp;" : "") + esc(p[0]) + ": <b>" + esc(p[1]) + "</b></span>"; });
      if (s.phase === "act") html += '<span class="kv">)</span>';
      bubble.innerHTML = html;
    } else if (s.phase === "confirm") {
      var opts = s.options || ["拒绝", "允许"];
      var pick = typeof s.choice === "number" ? s.choice : (s.options ? 0 : opts.length - 1);
      bubble.innerHTML = esc(s.text) + '<div class="actions" aria-hidden="true">' + opts.map(function (o, k) {
        return '<span' + (k === pick ? ' class="yes' + (s.reject ? " no" : "") + '"' : "") + ">" + esc(o) + "</span>";
      }).join("") + "</div>";
      if (!animate) { var y = bubble.querySelector(".yes"); if (y) y.style.animation = "none"; }
    } else {
      typeText = s.text || "";
      if (animate && !reduceMotion && (s.phase === "answer" || s.phase === "think")) { typeTarget = bubble; wrap.classList.add("typing"); }
      else bubble.textContent = typeText;
    }
    wrap.appendChild(bubble);
    this.stage.appendChild(wrap);

    var dur = 0;
    if (typeTarget) {
      var chars = Array.from(typeText), per = 28 / this.speed;
      dur = chars.length * per;
      chars.forEach(function (ch, k) {
        self.later(function () {
          typeTarget.textContent = chars.slice(0, k + 1).join("");
          if (k === chars.length - 1) wrap.classList.remove("typing");
          self.scrollStage();
        }, k * per);
      });
    }
    return dur;
  };

  Player.prototype.scrollStage = function () { this.stage.scrollTop = this.stage.scrollHeight; };

  Player.prototype.rebuildStage = function () {
    this.clearTimers();
    this.stage.innerHTML = "";
    for (var k = 0; k <= this.i; k++) this.renderMsg(this.steps[k], false);
    this.scrollStage();
  };

  Player.prototype.update = function (animateFrom) {
    var s = this.steps[this.i];
    var self = this;
    // 循环图
    var node = s ? PHASE_NODE[s.phase] : null;
    Array.prototype.forEach.call(this.svg.querySelectorAll(".node"), function (g) { g.classList.toggle("on", g.getAttribute("data-node") === node); });
    Array.prototype.forEach.call(this.svg.querySelectorAll(".arrow"), function (a) {
      a.classList.toggle("lit", !!(animateFrom && a.getAttribute("data-from") === animateFrom && a.getAttribute("data-to") === node));
    });
    this.svg.querySelector(".pause-badge").classList.toggle("on", !!s && s.phase === "confirm");
    var lbl = this.svg.querySelector(".center-label"), sub = this.svg.querySelector(".center-sub");
    var rounds = 0;
    for (var k = 0; k <= this.i; k++) if (this.steps[k].round) rounds = this.steps[k].round;
    var isFinal = !!s && s.phase === "answer" && (s.final === true || (s.final !== false && this.i === this.steps.length - 1));
    if (isFinal) { lbl.textContent = "✓ 任务完成"; lbl.classList.add("done"); sub.textContent = rounds ? "共 " + rounds + " 轮" : "没有调用工具"; }
    else if (s && s.phase === "answer") { lbl.textContent = "等你回复"; lbl.classList.remove("done"); sub.textContent = rounds ? "已进行 " + rounds + " 轮" : "还没调用工具"; }
    else { lbl.textContent = "Agent 循环"; lbl.classList.remove("done"); sub.textContent = rounds ? "第 " + rounds + " 轮" : (s ? "收到任务" : "等待任务"); }
    // 光点
    if (animateFrom && node && animateFrom !== node && !reduceMotion) this.flyDot(animateFrom, node);
    // 旁白
    var txt = s ? s.narr : "点击播放，看 Claude 如何一步步完成任务。";
    this.narr.innerHTML = '<span class="k">旁白 · ' + (s ? "第 " + (this.i + 1) + " 步" : "准备") + '</span><span class="txt">' + esc(txt) + "</span>";
    // 上下文条
    var m = this.trace.meter || { system: 1000, max: 4000 };
    var conv = s ? s.tokens || 0 : 0;
    var used = s ? m.system + conv : 0;
    this.meter.querySelector("b").textContent = used.toLocaleString() + " tokens";
    this.meter.querySelector(".sys").style.width = (s ? (m.system / m.max) * 100 : 0) + "%";
    this.meter.querySelector(".conv").style.width = ((conv / m.max) * 100) + "%";
    // 控制条
    Array.prototype.forEach.call(this.bar.children, function (d, k) {
      d.classList.toggle("past", k < self.i);
      d.classList.toggle("cur", k === self.i);
      d.setAttribute("aria-current", k === self.i ? "step" : "false");
    });
    this.count.textContent = (this.i + 1) + " / " + this.steps.length;
    this.bPrev.disabled = this.i < 0;
    this.bNext.disabled = this.i >= this.steps.length - 1;
    this.bPlay.innerHTML = this.playing ? IC.pause : IC.play;
    this.bPlay.setAttribute("aria-label", this.playing ? "暂停" : (this.i >= this.steps.length - 1 ? "重新播放" : "播放"));
    this.host.classList.toggle("playing", this.playing);
  };

  Player.prototype.flyDot = function (from, to) {
    var path = this.svg.querySelector('.arrow[data-from="' + from + '"][data-to="' + to + '"]');
    var dot = this.svg.querySelector(".dot");
    if (!path || !dot || !path.getTotalLength) return;
    var len = path.getTotalLength(), t0 = null, dur = 520 / this.speed;
    dot.setAttribute("opacity", "1");
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var q = path.getPointAtLength(e * len);
      dot.setAttribute("cx", q.x); dot.setAttribute("cy", q.y);
      if (p < 1) requestAnimationFrame(frame); else dot.setAttribute("opacity", "0");
    }
    requestAnimationFrame(frame);
  };

  Player.prototype.prevNode = function () {
    for (var k = this.i - 1; k >= 0; k--) { var n = PHASE_NODE[this.steps[k].phase]; if (n) return n; }
    return null;
  };

  /** 前进一步（带动画），返回这一步需要的展示时长 */
  Player.prototype.step = function () {
    if (this.i >= this.steps.length - 1) return 0;
    this.cover.classList.add("hide");
    this.i++;
    var s = this.steps[this.i];
    var dur = this.renderMsg(s, true);
    this.scrollStage();
    this.update(this.prevNode());
    return dur;
  };

  Player.prototype.jump = function (k) {
    this.clearTimers();
    this.i = Math.max(-1, Math.min(k, this.steps.length - 1));
    if (this.i >= 0) this.cover.classList.add("hide");
    this.rebuildStage();
    this.update(null);
  };

  Player.prototype.play = function () {
    var self = this;
    this.cover.classList.add("hide");
    if (this.i >= this.steps.length - 1) this.jump(-1);
    this.playing = true;
    this.update(null);
    function tick() {
      if (!self.playing) return;
      if (self.i >= self.steps.length - 1) { self.playing = false; self.update(null); return; }
      var typing = self.step();
      var s = self.steps[self.i];
      var hold = (s.phase === "confirm" ? 3000 : s.phase === "answer" ? 2200 : 2600) / self.speed;
      self.later(tick, typing + hold);
    }
    // 从头开始时立刻出第一步，否则稍等片刻
    this.later(tick, this.i < 0 ? 200 : 500 / this.speed);
  };

  Player.prototype.pause = function () {
    if (!this.playing) return;
    this.playing = false;
    // 停止自动推进，但让正在打字的文字直接写完
    this.rebuildStage();
    this.update(null);
  };

  Player.prototype.setView = function (v) {
    this.view = v;
    Array.prototype.forEach.call(this.host.querySelectorAll(".pl-view button"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); });
    var wasPlaying = this.playing;
    this.playing = false;
    this.rebuildStage();
    this.update(null);
    if (wasPlaying) this.play();
  };

  function mountAll() {
    var traces = window.TRACES || {};
    Array.prototype.forEach.call(document.querySelectorAll(".player[data-trace]"), function (el) {
      var t = traces[el.getAttribute("data-trace")];
      if (!t) { el.innerHTML = '<p style="padding:16px">找不到演示脚本：' + esc(el.getAttribute("data-trace")) + "</p>"; return; }
      el._player = new Player(el, t);
    });
  }
  window.AgentPlayer = Player;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll); else mountAll();
})();

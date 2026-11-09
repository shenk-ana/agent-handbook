/* ==========================================================
   book.js：全书通用交互
   - 顶栏、侧栏目录、本页目录（自动生成）
   - 主题切换、基础/原理层切换、阅读进度
   - 术语悬停卡片、推荐工具卡片、小测验、代码高亮与复制
   - 上一课/下一课、首页目录、百科页
   依赖：data/toc.js（BOOK）、data/glossary.js（GLOSSARY）、data/resources.js（RESOURCES）
   页面约定：<body data-base="../" data-lesson="15">，base 为到书根目录的相对路径
   ========================================================== */
(function () {
  "use strict";

  /* ---------- 工具函数 ---------- */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem("ah-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem("ah-" + k, JSON.stringify(v)); } catch (e) { /* 隐私模式等情况下忽略 */ }
    }
  };
  window.AHStore = store;

  var root = document.documentElement;
  var body = document.body;
  var base = body.getAttribute("data-base") || "";
  var lessonNo = body.hasAttribute("data-lesson") ? Number(body.getAttribute("data-lesson")) : null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BOOK = window.BOOK || { parts: [], appendix: [] };
  var GLOSSARY = window.GLOSSARY || [];
  var RESOURCES = window.RESOURCES || [];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function lessonHref(l) { return base + "lessons/" + pad(l.n) + "-" + l.slug + ".html"; }
  /* 公开免费版：data/toc.js 的 edition 为 "public" 时，没有 access: "free" 的课和附录显示为付费（页面只有大纲和解锁说明） */
  var isPublic = BOOK.edition === "public";
  function locked(x) { return isPublic && x && x.access !== "free"; }
  var LOCK = '<span class="lock" title="付费内容：可看大纲，全文需解锁">🔒</span>';
  function allLessons() {
    var out = [];
    BOOK.parts.forEach(function (p) { p.lessons.forEach(function (l) { out.push(Object.assign({ part: p }, l)); }); });
    return out;
  }
  var termMap = {};
  GLOSSARY.forEach(function (t) { termMap[t.id] = t; });
  var resMap = {};
  RESOURCES.forEach(function (r) { resMap[r.id] = r; });

  var ICON = {
    menu: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    sun: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    book: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/></svg>'
  };

  /* ---------- 主题 ---------- */
  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function setTheme(t) { root.setAttribute("data-theme", t); store.set("theme", t); paintThemeBtn(); }
  function paintThemeBtn() {
    var b = $("#theme-btn");
    if (!b) return;
    var dark = effectiveTheme() === "dark";
    b.innerHTML = dark ? ICON.sun : ICON.moon;
    b.setAttribute("aria-label", dark ? "切换到浅色" : "切换到深色");
    b.title = b.getAttribute("aria-label");
  }

  /* ---------- 基础 / 原理层 ---------- */
  var layer = store.get("layer", "basic");
  function applyLayer(l, initial) {
    layer = l;
    body.setAttribute("data-layer", l);
    store.set("layer", l);
    $$("details.deep").forEach(function (d) { d.open = l === "deep"; });
    $$(".layer-switch button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-layer") === l)); });
    moveThumb();
    if (!initial) {
      var msg = l === "deep" ? "已展开全部“原理层”内容" : "已收起“原理层”内容，点击单个框仍可展开";
      announce(msg);
    }
  }
  function moveThumb() {
    var sw = $(".layer-switch");
    if (!sw) return;
    var on = $('button[aria-pressed="true"]', sw);
    var th = $(".thumb", sw);
    if (on && th) { th.style.left = on.offsetLeft + "px"; th.style.width = on.offsetWidth + "px"; }
  }
  var live;
  function announce(text) {
    if (!live) { live = document.createElement("div"); live.className = "visually-hidden"; live.setAttribute("aria-live", "polite"); body.appendChild(live); }
    live.textContent = text;
  }

  /* ---------- 顶栏 ---------- */
  function buildTopbar() {
    var top = $(".topbar[data-auto]");
    if (!top) return;
    var hasLayer = !!$("details.deep");
    top.innerHTML =
      '<button class="icon-btn menu-btn" id="menu-btn" aria-label="打开目录" aria-expanded="false" aria-controls="book-nav">' + ICON.menu + "</button>" +
      '<a class="brand" href="' + base + 'index.html"><span class="brand-mark" aria-hidden="true"></span><span class="brand-text">' + esc(BOOK.title) + "</span></a>" +
      '<span class="spacer"></span>' +
      (hasLayer ?
        '<div class="layer-switch" role="group" aria-label="内容深度">' +
        '<span class="thumb" aria-hidden="true"></span>' +
        '<button data-layer="basic" aria-pressed="false" title="只看大白话部分">基础</button>' +
        '<button data-layer="deep" aria-pressed="false" title="展开所有给开发者的原理内容">原理</button>' +
        "</div>" : "") +
      '<a class="icon-btn" href="' + base + 'glossary.html" title="百科术语表">' + ICON.book + '<span class="btn-label">百科</span></a>' +
      '<button class="icon-btn" id="theme-btn"></button>' +
      '<div class="read-progress" aria-hidden="true"></div>';
    paintThemeBtn();
    $("#theme-btn").addEventListener("click", function () { setTheme(effectiveTheme() === "dark" ? "light" : "dark"); });
    $$(".layer-switch button", top).forEach(function (b) {
      b.addEventListener("click", function () { applyLayer(b.getAttribute("data-layer")); });
    });
    $("#menu-btn").addEventListener("click", function () { toggleNav(); });
    window.addEventListener("resize", moveThumb);
  }
  function toggleNav(force) {
    var wasOpen = body.classList.contains("nav-open");
    var open = typeof force === "boolean" ? force : !wasOpen;
    if (open === wasOpen) return;
    body.classList.toggle("nav-open", open);
    var b = $("#menu-btn");
    if (b) b.setAttribute("aria-expanded", String(open));
    var nav = $("#book-nav");
    if (open && nav) {
      var first = $('[aria-current="page"]', nav) || $(".nav-close", nav);
      setTimeout(function () { if (first) first.focus(); }, 50);
    } else if (!open && b && nav && nav.contains(document.activeElement)) {
      b.focus();
    }
  }

  /* ---------- 侧栏目录 ---------- */
  function buildSidebar() {
    var nav = $(".sidebar[data-auto]");
    if (!nav) return;
    var progress = store.get("progress", {});
    var html = "";
    BOOK.parts.forEach(function (p) {
      html += '<div class="part"><div class="part-title">' + esc(p.num) + " · " + esc(p.title) + "</div><ol>";
      p.lessons.forEach(function (l) {
        var cur = l.n === lessonNo;
        if (l.status === "planned") {
          html += '<li><span class="planned"><span class="num">' + pad(l.n) + "</span>" + esc(l.title) + '<span class="soon">待写</span></span></li>';
        } else {
          html += '<li><a href="' + lessonHref(l) + '"' + (cur ? ' aria-current="page"' : "") + '><span class="num">' + pad(l.n) + "</span><span>" + esc(l.title) + "</span>" +
            (locked(l) ? LOCK : progress[l.n] ? '<span class="done-dot" title="已读完">●</span>' : l.status === "draft" ? '<span class="soon">草稿</span>' : "") + "</a></li>";
        }
      });
      html += "</ol></div>";
    });
    html += '<div class="part"><div class="part-title">附录</div><ol>';
    (BOOK.appendix || []).forEach(function (a) {
      var cur = body.getAttribute("data-page") === a.id;
      if (a.status === "planned") html += '<li><span class="planned">' + esc(a.title) + '<span class="soon">待写</span></span></li>';
      else html += '<li><a href="' + base + a.href + '"' + (cur ? ' aria-current="page"' : "") + "><span>" + esc(a.title) + "</span>" + (locked(a) ? LOCK : "") + "</a></li>";
    });
    html += "</ol></div>";
    nav.innerHTML = '<button class="icon-btn nav-close" type="button" aria-label="关闭目录">✕ 关闭</button>' + html;
    nav.setAttribute("aria-label", "全书目录");
    nav.id = "book-nav";
    $(".nav-close", nav).addEventListener("click", function () { toggleNav(false); });
    var scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.addEventListener("click", function () { toggleNav(false); });
    body.appendChild(scrim);
    var curEl = $('[aria-current="page"]', nav);
    if (curEl) nav.scrollTop = Math.max(0, curEl.offsetTop - nav.clientHeight / 2);
  }

  /* ---------- 本页目录 + 滚动高亮 + 阅读进度 ---------- */
  function buildPageToc() {
    var aside = $(".page-toc");
    var heads = $$(".article h2[id]");
    if (aside && heads.length) {
      var html = '<div class="label">' + esc(aside.getAttribute("data-label") || (lessonNo !== null ? "本课内容" : "本页内容")) + "</div><ol>";
      heads.forEach(function (h) {
        var label = h.getAttribute("data-toc") || h.textContent.replace(/^\s*\d+(\.\d+)?\s*/, "");
        html += '<li><a href="#' + h.id + '">' + esc(label.trim()) + "</a></li>";
      });
      aside.innerHTML = html + "</ol>";
    }
    var links = aside ? $$("a", aside) : [];
    var bar = $(".read-progress");
    var ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.scrollY;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + "%";
      var idx = -1;
      heads.forEach(function (hd, i) { if (hd.getBoundingClientRect().top < 140) idx = i; });
      links.forEach(function (a, i) { a.classList.toggle("active", i === idx); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  /* ---------- 术语卡片 ---------- */
  function setupTerms() {
    var terms = $$(".term[data-term]");
    if (!terms.length) return;
    var pop = document.createElement("div");
    pop.className = "term-pop";
    pop.id = "term-pop";
    body.appendChild(pop);
    var current = null, hideTimer = null, showTimer = null;

    function fill(t) {
      pop.innerHTML =
        '<div><span class="t">' + esc(t.term) + '</span><span class="en">' + esc(t.en) + "</span></div>" +
        "<p>" + esc(t.plain) + "</p>" +
        (t.analogy ? '<p class="analogy">🧩 ' + esc(t.analogy) + "</p>" : "") +
        (layer === "deep" && t.tech ? '<p><b>技术定义：</b>' + esc(t.tech) + "</p>" : "") +
        '<a class="more" href="' + base + "glossary.html#" + esc(t.id) + '">在百科中查看 →</a>';
    }
    function place(elm) {
      var r = elm.getBoundingClientRect();
      var pw = pop.offsetWidth, ph = pop.offsetHeight;
      var left = Math.max(16, Math.min(r.left + r.width / 2 - pw / 2, window.innerWidth - pw - 16));
      var top = r.bottom + 10;
      if (top + ph > window.innerHeight - 12 && r.top - ph - 10 > 12) top = r.top - ph - 10;
      pop.style.left = left + window.scrollX + "px";
      pop.style.top = top + window.scrollY + "px";
    }
    function show(elm) {
      var t = termMap[elm.getAttribute("data-term")];
      if (!t) return;
      clearTimeout(hideTimer);
      current = elm;
      fill(t);
      pop.classList.add("show");
      place(elm);
      elm.setAttribute("aria-describedby", "term-pop");
    }
    function hide() {
      pop.classList.remove("show");
      if (current) current.removeAttribute("aria-describedby");
      current = null;
    }
    function hideSoon() { clearTimeout(showTimer); hideTimer = setTimeout(hide, 180); }

    terms.forEach(function (elm) {
      var id = elm.getAttribute("data-term");
      if (!termMap[id]) { console.warn("[术语表] 缺少术语：" + id); return; }
      elm.setAttribute("tabindex", "0");
      elm.setAttribute("role", "button");
      if (!elm.title) elm.setAttribute("aria-label", elm.textContent + "（查看术语解释）");
      elm.addEventListener("mouseenter", function () { clearTimeout(hideTimer); showTimer = setTimeout(function () { show(elm); }, 120); });
      elm.addEventListener("mouseleave", hideSoon);
      elm.addEventListener("focus", function () { show(elm); });
      elm.addEventListener("blur", function (e) { if (!pop.contains(e.relatedTarget)) hideSoon(); });
      elm.addEventListener("keydown", function (e) {
        // Tab 进入卡片里的“在百科中查看”链接
        if (e.key === "Tab" && !e.shiftKey && current === elm && pop.classList.contains("show")) {
          var link = $("a", pop);
          if (link) { e.preventDefault(); clearTimeout(hideTimer); link.focus(); }
        }
      });
      elm.addEventListener("click", function (e) {
        e.preventDefault();
        if (current === elm && pop.classList.contains("show")) hide(); else show(elm);
      });
      elm.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(elm); } });
    });
    pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    pop.addEventListener("focusout", function (e) {
      if (pop.contains(e.relatedTarget)) return;
      var back = current;
      hide();
      if (back && !e.relatedTarget) back.focus();
    });
    pop.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && current) { var back = current; hide(); back.focus(); }
    });
    pop.addEventListener("mouseleave", hideSoon);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    document.addEventListener("click", function (e) {
      if (current && !pop.contains(e.target) && !e.target.closest(".term")) hide();
    });
    window.addEventListener("resize", function () { if (current) place(current); });
  }

  /* ---------- 推荐工具卡片 ---------- */
  var TYPE_LABEL = { skill: "Skill", mcp: "MCP", plugin: "插件", sdk: "SDK", tool: "工具" };
  var RISK_LABEL = { low: "风险低", mid: "需留意权限", high: "高权限" };
  function resCard(r) {
    return '<a class="res-card" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="top"><span class="pill type-' + esc(r.type) + '">' + esc(TYPE_LABEL[r.type] || r.type) + "</span>" +
      (r.official ? '<span class="pill official">官方</span>' : '<span class="pill">社区</span>') +
      (r.verified ? "" : '<span class="pill unverified" title="尚未联网核实，公开前必须核实">待核实</span>') + "</div>" +
      '<div class="name">' + esc(r.name) + "</div>" +
      '<p class="desc">' + esc(r.desc) + "</p>" +
      '<div class="foot"><span class="pill risk-' + esc(r.risk) + '" title="' + esc(r.riskNote) + '">● ' + esc(RISK_LABEL[r.risk] || "") + "</span>" +
      '<span class="pill">' + esc(r.audience) + "</span>" +
      (r.verified ? '<span class="pill">核实于 ' + esc(r.verified) + "</span>" : "") + "</div></a>";
  }
  function setupResources() {
    $$(".resources[data-ids]").forEach(function (box) {
      var ids = box.getAttribute("data-ids").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var html = "";
      ids.forEach(function (id) { if (resMap[id]) html += resCard(resMap[id]); else console.warn("[工具目录] 缺少条目：" + id); });
      box.classList.add("res-grid");
      box.innerHTML = html;
    });
  }

  /* ---------- 小测验 ---------- */
  function setupQuizzes() {
    $$(".quiz[data-answer]").forEach(function (q) {
      var ans = q.getAttribute("data-answer");
      var opts = $$(".opt", q);
      opts.forEach(function (o) {
        o.setAttribute("type", "button");
        o.addEventListener("click", function () {
          if (q.classList.contains("answered")) return;
          q.classList.add("answered");
          var ok = o.getAttribute("data-k") === ans;
          o.classList.add(ok ? "correct" : "wrong");
          opts.forEach(function (x) {
            if (x.getAttribute("data-k") === ans) x.classList.add("correct");
            x.disabled = true;
          });
          var ex = $(".explain", q);
          if (ex) ex.insertAdjacentHTML("afterbegin", "<b>" + (ok ? "✅ 答对了。" : "❌ 再想想。") + "</b> ");
          announce(ok ? "回答正确" : "回答错误，正确答案已标出");
        });
      });
    });
  }

  /* ---------- 代码高亮（轻量：python / bash / json） ---------- */
  var PY_KW = "def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|break|continue|True|False|None|lambda|yield|pass|raise|is|async|await";
  var PY_RE = new RegExp(
    "(#[^\\n]*)" +
    '|("""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')' +
    "|\\b(\\d+(?:\\.\\d+)?)\\b" +
    "|\\b(" + PY_KW + ")\\b" +
    "|\\b([A-Za-z_]\\w*)(?=\\()", "g");
  function highlight(src, lang) {
    if (lang !== "python" && lang !== "bash" && lang !== "json") return esc(src);
    var re = lang === "json" ? /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*")|(-?\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(\$[A-Z_]+)/g : lang === "bash" ? /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|\b(\d+)\b|\b(pip|npm|npx|export|cd|claude|python3?|uv)\b|(\$\{?\w+\}?)/g : PY_RE;
    var out = "", last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "n" : m[4] ? "k" : "f";
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>";
      last = re.lastIndex;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(last));
  }
  function copyText(text, btn) {
    function done(ok) { btn.textContent = ok ? "已复制" : "复制失败"; setTimeout(function () { btn.textContent = "复制"; }, 1600); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else fallback();
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
  }
  window.AHCopy = copyText; // 供课程专属脚本使用：AHCopy(text, buttonElement)

  function setupCode() {
    $$(".code").forEach(function (box) {
      var codeEl = $("pre code", box);
      if (!codeEl) return;
      var lang = codeEl.getAttribute("data-lang") || "";
      var raw = codeEl.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      codeEl.innerHTML = highlight(raw, lang);
      if (!$(".code-head", box)) {
        box.insertAdjacentHTML("afterbegin", '<div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span>' + esc(box.getAttribute("data-title") || lang) + "</span></div>");
      }
      var btn = document.createElement("button");
      btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "复制";
      btn.addEventListener("click", function () { copyText(raw, btn); });
      box.appendChild(btn);
    });
    $$(".prompt-sample").forEach(function (box) {
      var btn = document.createElement("button");
      btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "复制";
      var text = box.textContent.trim();
      btn.addEventListener("click", function () { copyText(text, btn); });
      box.appendChild(btn);
    });
  }

  /* ---------- 上一课 / 下一课 + 读完标记 ---------- */
  function setupPager() {
    var box = $(".pager[data-auto]");
    if (box && lessonNo !== null) {
      var list = allLessons();
      var i = list.findIndex(function (l) { return l.n === lessonNo; });
      function cell(l, dir) {
        if (!l) return "";
        var cls = dir === "next" ? "next" : "prev";
        var label = dir === "next" ? "下一课 →" : "← 上一课";
        if (l.status === "planned") return '<span class="' + cls + '"><span class="dir">' + label + "（待写）</span><span class=\"ttl\">" + pad(l.n) + " " + esc(l.title) + "</span></span>";
        return '<a class="' + cls + '" href="' + lessonHref(l) + '"><span class="dir">' + label + '</span><span class="ttl">' + pad(l.n) + " " + esc(l.title) + (locked(l) ? " " + LOCK : "") + "</span></a>";
      }
      box.innerHTML = cell(list[i - 1], "prev") + cell(list[i + 1], "next");
    }
    var end = $(".lesson-end");
    if (end && lessonNo !== null && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            var p = store.get("progress", {});
            if (!p[lessonNo]) { p[lessonNo] = Date.now(); store.set("progress", p); }
            io.disconnect();
          }
        });
      }, { threshold: 0.6 });
      io.observe(end);
    }
  }

  /* ---------- 入场动效 ---------- */
  function setupReveal() {
    var els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 首页目录 ---------- */
  function setupHome() {
    var box = $("#home-toc");
    if (!box) return;
    var progress = store.get("progress", {});
    var html = "";
    BOOK.parts.forEach(function (p) {
      html += '<section class="toc-part reveal"><div class="ph"><span class="pn">' + esc(p.num) + "</span><h3>" + esc(p.title) + '</h3><span class="aud">适合：' + esc(p.audience) + "</span></div><ol>";
      p.lessons.forEach(function (l) {
        var st = locked(l) ? '<span class="st locked">🔒 付费</span>' : progress[l.n] && isPublic ? '<span class="st ready">✓ 已读</span>' : isPublic ? '<span class="st ready">免费</span>' : progress[l.n] ? '<span class="st ready">✓ 已读</span>' : l.status === "ready" ? '<span class="st ready">可阅读</span>' : l.status === "draft" ? '<span class="st draft">草稿</span>' : '<span class="st">待写</span>';
        if (l.status === "planned") html += '<li><span><span class="num">' + pad(l.n) + "</span>" + esc(l.title) + st + "</span></li>";
        else html += '<li><a href="' + lessonHref(l) + '"><span class="num">' + pad(l.n) + "</span><span>" + esc(l.title) + "</span>" + st + "</a></li>";
      });
      html += "</ol></section>";
    });
    var note = $("#toc-note");
    if (note && isPublic) {
      var all = allLessons(), free = all.filter(function (l) { return !locked(l); }).length;
      var freeApx = (BOOK.appendix || []).filter(function (a) { return !locked(a); }).length;
      note.innerHTML = "这是免费版：开放 " + free + " 课与 " + freeApx + " 个附录，全书共 " + all.length + " 课。标 🔒 的是付费内容，点开能看本课大纲和解锁方式。";
    }
    box.innerHTML = html;
  }

  /* ---------- 百科页 ---------- */
  var CAT_LABEL = { basic: "基础概念", claude: "Claude 产品", arch: "架构原理", safety: "安全", dev: "开发" };
  function setupGlossary() {
    var app = $("#glossary-app");
    if (!app) return;
    var cats = ["all"].concat(Object.keys(CAT_LABEL));
    var state = { q: "", cat: "all" };
    app.innerHTML =
      '<div class="glossary-tools"><input type="search" placeholder="搜索术语，例如：上下文、MCP、token" aria-label="搜索术语">' +
      '<div class="cats" role="group" aria-label="按分类筛选">' +
      cats.map(function (c) { return '<button data-cat="' + c + '" aria-pressed="' + (c === "all") + '">' + (c === "all" ? "全部" : CAT_LABEL[c]) + "</button>"; }).join("") +
      '</div></div><div class="g-status visually-hidden" aria-live="polite"></div><div class="g-list"></div>';
    var list = $(".g-list", app);
    var sorted = GLOSSARY.slice().sort(function (a, b) { return a.en.localeCompare(b.en); });
    function render() {
      var q = state.q.toLowerCase();
      var items = sorted.filter(function (t) {
        if (state.cat !== "all" && t.cat !== state.cat) return false;
        if (!q) return true;
        return (t.term + t.en + t.plain + (t.tech || "")).toLowerCase().indexOf(q) >= 0;
      });
      var status = $(".g-status", app);
      if (status) status.textContent = items.length ? "找到 " + items.length + " 个术语" : "没有找到相关术语";
      if (!items.length) { list.innerHTML = '<div class="g-empty">没有找到相关术语。</div>'; return; }
      list.innerHTML = items.map(function (t) {
        var lessons = (t.lessons || []).map(function (n) {
          var l = allLessons().find(function (x) { return x.n === n; });
          if (!l) return "";
          return l.status === "planned" ? '<span class="pill">第 ' + n + " 课（待写）</span>" : '<a class="pill" href="' + lessonHref(l) + '">第 ' + n + " 课" + (locked(l) ? " 🔒" : "") + "</a>";
        }).join("");
        var res = (t.resources || []).filter(function (id) { return resMap[id]; }).map(function (id) {
          return '<a class="pill type-' + resMap[id].type + '" href="' + esc(resMap[id].url) + '" target="_blank" rel="noopener noreferrer">' + esc(resMap[id].name) + "</a>";
        }).join("");
        return '<article class="g-item" id="' + esc(t.id) + '"><h3>' + esc(t.term) + '<span class="en">' + esc(t.en) + '</span><span class="pill">' + esc(CAT_LABEL[t.cat] || "") + "</span></h3>" +
          '<div class="row"><span class="k">大白话</span><p>' + esc(t.plain) + "</p></div>" +
          (t.analogy ? '<div class="row"><span class="k">打个比方</span><p>' + esc(t.analogy) + "</p></div>" : "") +
          (t.tech ? '<div class="row"><span class="k">技术定义</span><p>' + esc(t.tech) + "</p></div>" : "") +
          ((lessons || res) ? '<div class="links">' + lessons + res + "</div>" : "") + "</article>";
      }).join("");
    }
    $("input", app).addEventListener("input", function (e) { state.q = e.target.value.trim(); render(); });
    $$(".cats button", app).forEach(function (b) {
      b.addEventListener("click", function () {
        state.cat = b.getAttribute("data-cat");
        $$(".cats button", app).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        render();
      });
    });
    render();
  }

  /* ---------- 启动 ---------- */
  function init() {
    buildTopbar();
    buildSidebar();
    applyLayer(layer, true);
    buildPageToc();
    setupTerms();
    setupResources();
    setupQuizzes();
    setupCode();
    setupPager();
    setupHome();
    setupGlossary();
    setupReveal();
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggleNav(false); });
    // 原理层展开、术语表渲染都会改变页面高度，最后再按锚点定位一次
    if (location.hash) {
      setTimeout(function () {
        var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (t) t.scrollIntoView();
      }, 0);
    }
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", paintThemeBtn);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

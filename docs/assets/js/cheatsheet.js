/* 附录 C 速查卡：复制模板、打印按钮（只操作本页 DOM，复制逻辑复用 window.AHCopy） */
(function () {
  "use strict";
  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = document.getElementById(btn.getAttribute("data-copy-target"));
        if (!el) return;
        var text = el.textContent.replace(/^\s+|\s+$/g, "");
        if (window.AHCopy) { window.AHCopy(text, btn); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { btn.textContent = "已复制"; });
        }
      });
    });
    var pr = document.getElementById("cs-print");
    if (pr) pr.addEventListener("click", function () { window.print(); });
  });
})();

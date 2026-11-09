/* 第 0 课专属交互：全书地图的路线切换。只操作本页 .book-map。 */
(function () {
  "use strict";
  var NOTES = {
    all: "全书分 6 个部分，加上附录。点上面的路线，看看哪些部分是为你准备的。第 0 部分（本课）对所有路线都适用。",
    user: "我想用好 Claude：第 0 → 1 → 2 部分，以第 10 课的实战案例收尾。不需要编程基础。",
    dev: "我用 Claude Code 写代码：第 1 部分 → 第 3 部分（Claude Code 实战）→ 第 4 部分（原理），配合附录 B 工具推荐目录。",
    deep: "我想懂原理、自己造：第 1 部分 → 第 3、4 部分，第 5 部分选读（地图上的空心圆点）。记得打开顶栏的“原理”开关，第 22 课会用 Agent SDK 和 Claude API 自己造一个。"
  };
  function init() {
    var box = document.querySelector(".book-map");
    if (!box) return;
    var note = box.querySelector(".map-note");
    var btns = Array.prototype.slice.call(box.querySelectorAll(".map-routes button"));
    function set(r) {
      box.setAttribute("data-route", r);
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-route") === r)); });
      if (note) note.textContent = NOTES[r] || "";
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-route")); }); });
    set("all");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

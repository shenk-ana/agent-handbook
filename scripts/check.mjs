#!/usr/bin/env node
// 全书一致性检查（无第三方依赖）。用法：node scripts/check.mjs [书的根目录，默认为仓库根目录]
// 公开免费版（toc.js 里 edition 为 "public"）额外检查：付费课只能是解锁页，且不能带出多余的文件。
// 检查：术语 / 工具 / 演示脚本引用是否存在、目录与文件是否对应、本地链接是否有效、h2 id 是否重复、
//       数据字段是否齐全、公开前未核实的工具条目。
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

function loadData(rel) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel });
  return ctx.window;
}

const { BOOK } = loadData("data/toc.js");
// 术语表分片：data/glossary.js 必须最先加载，其余 glossary-*.js 依次追加
const gctx = { window: {} };
vm.createContext(gctx);
const gfiles = ["glossary.js", ...fs.readdirSync(path.join(ROOT, "data")).filter((f) => /^glossary-.+\.js$/.test(f)).sort()];
for (const f of gfiles) vm.runInContext(fs.readFileSync(path.join(ROOT, "data", f), "utf8"), gctx, { filename: f });
const GLOSSARY = gctx.window.GLOSSARY;
const { RESOURCES } = loadData("data/resources.js");
const TRACES = {};
const traceDir = path.join(ROOT, "data/traces");
for (const f of fs.readdirSync(traceDir).filter((f) => f.endsWith(".js"))) {
  const w = loadData(`data/traces/${f}`);
  for (const [id, t] of Object.entries(w.TRACES || {})) TRACES[id] = { ...t, file: `data/traces/${f}` };
}

const pad = (n) => String(n).padStart(2, "0");
const lessons = BOOK.parts.flatMap((p) => p.lessons);
const lessonNos = new Set(lessons.map((l) => l.n));
const termIds = new Set();
const resIds = new Set(RESOURCES.map((r) => r.id));

// ---- 数据字段 ----
for (const t of GLOSSARY) {
  for (const k of ["id", "term", "en", "cat", "plain", "tech"]) if (!t[k]) err(`术语 ${t.id || "?"} 缺少字段 ${k}`);
  if (termIds.has(t.id)) err(`术语 id 重复：${t.id}`);
  termIds.add(t.id);
  for (const n of t.lessons || []) if (!lessonNos.has(n)) err(`术语 ${t.id} 引用了不存在的课号 ${n}`);
  for (const r of t.resources || []) if (!resIds.has(r)) err(`术语 ${t.id} 引用了不存在的工具 ${r}`);
}
const seenRes = new Set();
for (const r of RESOURCES) {
  for (const k of ["id", "name", "url", "type", "desc", "audience", "risk", "riskNote"]) if (!r[k]) err(`工具 ${r.id || "?"} 缺少字段 ${k}`);
  if (seenRes.has(r.id)) err(`工具 id 重复：${r.id}`);
  seenRes.add(r.id);
  if (!["skill", "mcp", "plugin", "sdk", "tool"].includes(r.type)) err(`工具 ${r.id} 的 type 无效：${r.type}`);
  if (!["low", "mid", "high"].includes(r.risk)) err(`工具 ${r.id} 的 risk 无效：${r.risk}`);
  if (!r.verified) warn(`工具 ${r.id} 尚未核实（verified 为空），公开前必须核实`);
}
for (const [id, t] of Object.entries(TRACES)) {
  if (!Array.isArray(t.steps) || !t.steps.length) err(`演示 ${id} 没有 steps`);
  for (const [i, s] of (t.steps || []).entries()) {
    if (!["user", "think", "act", "confirm", "observe", "answer"].includes(s.phase)) err(`演示 ${id} 第 ${i + 1} 步 phase 无效：${s.phase}`);
    if (!s.narr) err(`演示 ${id} 第 ${i + 1} 步缺少旁白 narr`);
  }
}

// ---- 目录与文件 ----
const lessonFiles = fs.readdirSync(path.join(ROOT, "lessons")).filter((f) => /^\d\d-.+\.html$/.test(f));
for (const l of lessons) {
  const f = `${pad(l.n)}-${l.slug}.html`;
  const exists = lessonFiles.includes(f);
  if (l.status !== "planned" && !exists) err(`目录标记为 ${l.status} 但缺少文件 lessons/${f}`);
  if (l.status === "planned" && exists) warn(`lessons/${f} 已存在，但目录中仍是 planned`);
}
for (const f of lessonFiles) {
  if (!lessons.some((l) => `${pad(l.n)}-${l.slug}.html` === f)) err(`lessons/${f} 不在 data/toc.js 中`);
}

// ---- 页面检查 ----
const rootPages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const pages = [...rootPages, ...lessonFiles.map((f) => `lessons/${f}`)];
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), "utf8");
  const dir = path.dirname(path.join(ROOT, p));
  for (const f of gfiles) if (!html.includes(`data/${f}"`)) err(`${p}：没有引入术语分片 data/${f}`);
  for (const m of html.matchAll(/data-term="([^"]+)"/g)) if (!termIds.has(m[1])) err(`${p}：术语表缺少 ${m[1]}`);
  for (const m of html.matchAll(/data-ids="([^"]+)"/g)) for (const id of m[1].split(",").map((s) => s.trim())) if (!resIds.has(id)) err(`${p}：工具目录缺少 ${id}`);
  for (const m of html.matchAll(/data-trace="([^"]+)"/g)) {
    const t = TRACES[m[1]];
    if (!t) err(`${p}：找不到演示脚本 ${m[1]}`);
    else if (!html.includes(path.basename(t.file))) err(`${p}：用了演示 ${m[1]}，但没有引入 ${t.file}`);
  }
  for (const m of html.matchAll(/(?:href|src)="([^"#:?]+)(?:[#?][^"]*)?"/g)) {
    const target = path.resolve(dir, m[1]);
    if (!fs.existsSync(target)) err(`${p}：链接目标不存在 ${m[1]}`);
  }
  const ids = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) err(`${p}：h2 id 重复 ${dup.join(", ")}`);
  if (/<img[^>]+src="https?:/i.test(html)) warn(`${p}：引用了外部图片，离线时无法显示`);
  if (/<script[^>]+src="https?:/i.test(html)) err(`${p}：引用了外部脚本，本书要求完全离线可用`);
  if (/\/Users\/|shenkguge|localhost/.test(html)) err(`${p}：包含本机路径或个人信息`);
  if (p.startsWith("lessons/")) {
    const inline = (html.match(/\sstyle="/g) || []).length;
    if (inline) err(`${p}：有 ${inline} 处内联 style 属性，请改用 class（见 STYLE_GUIDE 第 5 节）`);
    for (const m of html.matchAll(/<svg\b[^>]*>/g)) {
      if (/role="img"/.test(m[0]) && /aria-hidden="true"/.test(m[0])) err(`${p}：SVG 同时有 role="img" 和 aria-hidden="true"`);
    }
  }
}

// ---- 公开免费版 ----
if (BOOK.edition === "public") {
  const locked = (html) => /<body[^>]*\sdata-locked[\s>]/.test(html);
  const items = [
    ...lessons.filter((l) => l.status !== "planned").map((l) => ({ f: `lessons/${pad(l.n)}-${l.slug}.html`, access: l.access })),
    ...(BOOK.appendix || []).filter((a) => a.status !== "planned").map((a) => ({ f: a.href, access: a.access })),
  ];
  for (const { f, access } of items) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const html = fs.readFileSync(path.join(ROOT, f), "utf8");
    if (access !== "free" && !locked(html)) err(`公开版：${f} 是付费内容，但不是解锁页`);
    if (access === "free" && locked(html)) err(`公开版：${f} 是免费内容，却被生成成了解锁页`);
  }
  // 所有 assets/ 与 data/ 下的文件都必须被某个页面引用，防止付费课的样式、脚本、演示被带出
  const referenced = new Set();
  for (const p of pages) {
    const html = fs.readFileSync(path.join(ROOT, p), "utf8");
    for (const m of html.matchAll(/(?:href|src)="([^"#:?]+)(?:[#?][^"]*)?"/g)) referenced.add(path.resolve(path.dirname(path.join(ROOT, p)), m[1]));
  }
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const d of ["assets", "data"]) for (const f of walk(path.join(ROOT, d))) if (!referenced.has(f)) err(`公开版：${path.relative(ROOT, f)} 没有被任何页面引用，可能是付费内容`);
  const pubLessons = fs.readdirSync(path.join(ROOT, "lessons"));
  if (pubLessons.includes("_template.html")) err("公开版：不应包含 lessons/_template.html");
}

for (const w of warns) console.log("⚠️  " + w);
for (const e of errors) console.log("❌ " + e);
console.log(`\n检查了 ${pages.length} 个页面、${GLOSSARY.length} 个术语、${RESOURCES.length} 个工具、${Object.keys(TRACES).length} 个演示。`);
console.log(errors.length ? `❌ ${errors.length} 个错误` : "✅ 没有错误");
process.exit(errors.length ? 1 : 0);

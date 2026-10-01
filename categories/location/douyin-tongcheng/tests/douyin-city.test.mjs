import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = join(dir, "scripts", "douyin-city.js");
const code = readFileSync(scriptPath, "utf8");

// 用桩替换 Loon 全局对象，运行脚本并捕获 $done 参数
function runScript({ url, argument = null, store = {} }) {
  let doneArg;
  const fn = new Function(
    "$request",
    "$done",
    "$argument",
    "$persistentStore",
    "console",
    code
  );
  const ps = { read: (k) => (k in store ? store[k] : null) };
  fn({ url }, (a) => (doneArg = a), argument, ps, console);
  return doneArg;
}

const FEED =
  "https://aweme.snssdk.com/aweme/v1/feed/?latitude=39.9042&longitude=116.4074&type=0";

test("中文城市名：巴黎 → 改写经纬度", () => {
  const r = runScript({ url: FEED, argument: "city=巴黎" });
  assert.ok(r.url.includes("latitude=48.8566"), r.url);
  assert.ok(r.url.includes("longitude=2.3522"), r.url);
});

test("英文城市名不区分大小写：TOKYO", () => {
  const r = runScript({ url: FEED, store: { 城市: "TOKYO" } });
  assert.ok(r.url.includes("latitude=35.6762"), r.url);
  assert.ok(r.url.includes("longitude=139.6503"), r.url);
});

test("直接写经纬度：31.2304,121.4737", () => {
  const r = runScript({ url: FEED, argument: "city=31.2304,121.4737" });
  assert.ok(r.url.includes("latitude=31.2304"), r.url);
  assert.ok(r.url.includes("longitude=121.4737"), r.url);
});

test("lat/lng 短参数名也能改写", () => {
  const r = runScript({
    url: "https://api.amemv.com/x/?lat=1&lng=2",
    argument: "city=伦敦",
  });
  assert.ok(r.url.includes("lat=51.5074"), r.url);
  assert.ok(r.url.includes("lng=-0.1278"), r.url);
});

test("新语法 $argument 对象形式：{city: '巴黎'}", () => {
  const r = runScript({ url: FEED, argument: { city: "巴黎" } });
  assert.ok(r.url.includes("latitude=48.8566"), r.url);
  assert.ok(r.url.includes("longitude=2.3522"), r.url);
});

test("新语法替换后字符串形式：[巴黎]", () => {
  const r = runScript({ url: FEED, argument: "[巴黎]" });
  assert.ok(r.url.includes("latitude=48.8566"), r.url);
});

test("插件参数优先于插件配置项", () => {
  const r = runScript({
    url: FEED,
    argument: "city=巴黎",
    store: { 城市: "东京" },
  });
  assert.ok(r.url.includes("latitude=48.8566"), r.url);
});

test("未配置城市 → 直接放行", () => {
  assert.deepEqual(runScript({ url: FEED }), {});
});

test("未知城市名 → 直接放行", () => {
  assert.deepEqual(runScript({ url: FEED, argument: "city=火星" }), {});
});

test("非法经纬度 → 直接放行", () => {
  assert.deepEqual(runScript({ url: FEED, argument: "city=999,999" }), {});
});

test("URL 里没有定位参数 → 不改动", () => {
  assert.deepEqual(
    runScript({
      url: "https://aweme.snssdk.com/aweme/v1/feed/?type=0",
      argument: "city=巴黎",
    }),
    {}
  );
});

test("城市库无重复（中英文）", () => {
  const zh = new Set();
  const en = new Set();
  for (const m of code.matchAll(/\["([^"]+)",\s*"([^"]+)",/g)) {
    assert.ok(!zh.has(m[1]), `重复中文名: ${m[1]}`);
    assert.ok(!en.has(m[2]), `重复英文名: ${m[2]}`);
    zh.add(m[1]);
    en.add(m[2]);
  }
  assert.ok(zh.size >= 60, `城市太少: ${zh.size}`);
});

test("插件文件使用最新语法：[Argument] 定义参数", () => {
  const plugin = readFileSync(join(dir, "douyin-tongcheng.lnplugin"), "utf8");
  assert.match(plugin, /^#!name=抖音同城任意门/m);
  assert.ok(!/^#!input/m.test(plugin), "不应再使用旧式 #!input 写法");
  assert.match(plugin, /^\[Argument\]/m, "缺少 [Argument] 段");
  assert.match(
    plugin,
    /^city = input,"",tag=城市,desc=/m,
    "缺少 city 参数定义"
  );
  assert.match(plugin, /#!loon_version = 3\.5\.1\(983\)/);
  assert.match(plugin, /request if \$\{url\} ~=/, "脚本未使用 v2 条件语法");
  assert.match(
    plugin,
    /script\("https:\/\/raw\.githubusercontent\.com\/Lxp1986\/loon-plugins\/main\/categories\/location\/douyin-tongcheng\/scripts\/douyin-city\.js", \{\$\{city\}\}\)/,
    "脚本未以对象形式引用 {city} 参数"
  );
  assert.match(plugin, /with tag="抖音同城改定位", timeout=10/);
  assert.match(plugin, /douyin-icon\.jpg/m);
  assert.match(plugin, /\*\.amemv\.com/, "缺少 amemv MITM");
  assert.match(plugin, /\*\.snssdk\.com/, "缺少 snssdk MITM");
  assert.match(plugin, /douyin-city\.js/, "缺少脚本引用");
});

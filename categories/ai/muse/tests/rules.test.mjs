import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..");

// Loon / Surge / Stash 通用规则类型；本仓库规则不指定策略（策略由订阅方指定）
const RULE_RE = /^(DOMAIN-SUFFIX|DOMAIN|DOMAIN-KEYWORD|DOMAIN-REGEX|IP-CIDR|IP-CIDR6|IP-ASN|USER-AGENT|URL-REGEX),[^,\s]+$/;

function ruleLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

const listRules = ruleLines(readFileSync(join(dir, "muse.list"), "utf8"));

test("muse.list 每条规则语法合法且不带策略", () => {
  assert.ok(listRules.length > 0, "规则不能为空");
  for (const line of listRules) {
    assert.match(line, RULE_RE, `非法规则行: ${line}`);
    assert.equal(line.split(",").length, 2, `规则不应指定策略: ${line}`);
  }
});

test("muse.list 无重复域名", () => {
  const seen = new Set();
  for (const line of listRules) {
    const key = line.toLowerCase();
    assert.ok(!seen.has(key), `重复规则: ${line}`);
    seen.add(key);
  }
});

test("muse.lnplugin [Rule] 段与 muse.list 对应，策略统一为 PROXY 占位符", () => {
  const plugin = readFileSync(join(dir, "muse.lnplugin"), "utf8");
  assert.match(plugin, /^#!name=/m, "缺少 #!name 头");
  assert.match(
    plugin,
    /^#!icon=https:\/\/raw\.githubusercontent\.com\/Lxp1986\/loon-plugins\/main\/categories\/ai\/muse\/assets\/muse-icon\.jpg$/m,
    "缺少 Muse 图标"
  );
  const ruleSection = plugin.split("[Rule]")[1];
  assert.ok(ruleSection, "缺少 [Rule] 段");
  const pluginRules = ruleLines(ruleSection);
  assert.deepEqual(
    pluginRules,
    listRules.map((r) => `${r},PROXY`),
    "插件规则应与 muse.list 一一对应，策略统一用 PROXY 占位符（用户在安装时映射到自己的策略组）"
  );
});

test("核心域名必须在列", () => {
  const must = [
    "DOMAIN-SUFFIX,meta.ai",
    "DOMAIN-SUFFIX,muse.ai",
    "DOMAIN-SUFFIX,meta.com",
    "DOMAIN-SUFFIX,metaaivm.com",
    "DOMAIN-SUFFIX,hatch.one",
    "DOMAIN,meta-ohttp-relay-prod.fastly-edge.com",
    "DOMAIN,meta.privacy-gateway.cloudflare.com",
  ];
  for (const r of must) assert.ok(listRules.includes(r), `缺失核心规则: ${r}`);
});

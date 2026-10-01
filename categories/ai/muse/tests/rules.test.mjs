import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..");

// 插件内规则格式：类型,域名,PROXY（PROXY 是占位符，用户安装时映射到自己的策略组）
const RULE_RE =
  /^(DOMAIN-SUFFIX|DOMAIN|DOMAIN-KEYWORD|DOMAIN-REGEX|IP-CIDR|IP-CIDR6|IP-ASN|USER-AGENT|URL-REGEX),[^,\s]+,PROXY$/;

function ruleLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

const plugin = readFileSync(join(dir, "muse.lnplugin"), "utf8");
const ruleSection = plugin.split("[Rule]")[1];
assert.ok(ruleSection, "缺少 [Rule] 段");
const rules = ruleLines(ruleSection);

test("本仓库不放规则集：muse.list 不应存在", () => {
  assert.ok(!existsSync(join(dir, "muse.list")), "规则集应放在 rules-and-scripts，不在 loon-plugins");
});

test("插件头完整：名称、图标、策略组映射说明", () => {
  assert.match(plugin, /^#!name=/m, "缺少 #!name 头");
  assert.match(
    plugin,
    /^#!icon=https:\/\/raw\.githubusercontent\.com\/Lxp1986\/loon-plugins\/main\/categories\/ai\/muse\/assets\/muse-icon\.jpg$/m,
    "缺少 Muse 图标"
  );
  assert.match(plugin, /proxy=你的策略组/, "缺少策略组映射说明");
});

test("插件 [Rule] 每条语法合法，策略统一为 PROXY 占位符", () => {
  assert.ok(rules.length > 0, "规则不能为空");
  for (const line of rules) {
    assert.match(line, RULE_RE, `非法规则行: ${line}`);
  }
});

test("插件 [Rule] 无重复域名", () => {
  const seen = new Set();
  for (const line of rules) {
    const key = line.toLowerCase();
    assert.ok(!seen.has(key), `重复规则: ${line}`);
    seen.add(key);
  }
});

test("核心域名必须在列", () => {
  const must = [
    "DOMAIN-SUFFIX,meta.ai,PROXY",
    "DOMAIN-SUFFIX,muse.ai,PROXY",
    "DOMAIN-SUFFIX,meta.com,PROXY",
    "DOMAIN-SUFFIX,metaaivm.com,PROXY",
    "DOMAIN-SUFFIX,hatch.one,PROXY",
    "DOMAIN,meta-ohttp-relay-prod.fastly-edge.com,PROXY",
    "DOMAIN,meta.privacy-gateway.cloudflare.com,PROXY",
  ];
  for (const r of must) assert.ok(rules.includes(r), `缺失核心规则: ${r}`);
});

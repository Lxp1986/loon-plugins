import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildLoonClearUrl,
  buildLoonSaveUrl,
  parseCoordinateText,
  validateCoordinates,
} from "../beginner/coordinate.js";
import { extractFromString, parseCoords } from "../picker/worker/src/parse.js";

test("beginner parser accepts latitude/longitude and enforces WGS-84 ranges", () => {
  assert.deepEqual(parseCoordinateText("22.5431, 114.0579"), { lat: 22.5431, lon: 114.0579 });
  assert.deepEqual(parseCoordinateText("-33.86 -151.20"), { lat: -33.86, lon: -151.2 });
  assert.throws(() => validateCoordinates(90.01, 0), /纬度/);
  assert.throws(() => validateCoordinates(0, 180.01), /经度/);
  assert.throws(() => parseCoordinateText("not coordinates"), /纬度/);
});

test("existing stateless picker parser extracts known map formats", async () => {
  assert.deepEqual(extractFromString("https://maps.apple.com/?ll=37.3349,-122.0090"), {
    lat: 37.3349, lon: -122.009, name: "", src: "apple",
  });
  assert.deepEqual(extractFromString("https://www.google.com/maps/@40.7128,-74.0060,12z"), {
    lat: 40.7128, lon: -74.006, name: "", src: "google",
  });
  const parsed = await parseCoords("31.2400,121.4900");
  assert.equal(parsed.src, "text");
  assert.equal(parsed.lat, 31.24);
  assert.equal(parsed.lon, 121.49);
});

test("Loon save and clear URLs target the local interception endpoint", () => {
  const save = new URL(buildLoonSaveUrl({ lat: 22.5431, lon: 114.0579, altitude: 20 }));
  assert.equal(save.hostname, "gs-loc.apple.com");
  assert.equal(save.pathname, "/ils-settings/save");
  assert.equal(save.searchParams.get("lat"), "22.5431");
  assert.equal(save.searchParams.get("lon"), "114.0579");
  assert.equal(new URL(buildLoonClearUrl()).searchParams.get("action"), "clear");
});

test("Loon plugin keeps required scripts, hosts, append semantics, and beginner-safe wording", async () => {
  const [plugin, worker] = await Promise.all([
    readFile(new URL("../ios-location-spoofer.lnplugin", import.meta.url), "utf8"),
    readFile(new URL("../picker/worker/src/index.js", import.meta.url), "utf8"),
  ]);
  for (const host of ["gs-loc.apple.com", "gs-loc-cn.apple.com", "bluedot.is.autonavi.com", "bluedot.is.autonavi.com.gds.alibabadns.com"]) {
    assert.match(plugin, new RegExp(host.replaceAll(".", "\\.")));
  }
  assert.match(plugin, /hostname\s*=\s*%APPEND%/);
  assert.match(plugin, /location-spoofer\.js/);
  assert.match(plugin, /location-settings\.js/);
  assert.match(plugin, /requires-body=true/);
  assert.match(plugin, /HTTPS 解密/);
  assert.match(plugin, /CA 证书/);
  assert.match(plugin, /不需要 Cloudflare/);
  assert.match(plugin, /#!input\s*=\s*纬度/);
  assert.match(plugin, /#!input\s*=\s*经度/);
  assert.match(plugin, /#!select\s*=\s*启用,false,true/);
  assert.doesNotMatch(plugin, /#!input\s*=\s*altitude/);
  assert.doesNotMatch(plugin, /海拔/);
  assert.match(plugin, /#!name=定位助手（无状态）/);
  assert.match(plugin, /tag=定位替换/);
  assert.match(worker, /hostname = %APPEND% gs-loc\.apple\.com/);
});

test("beginner page is static and states the MITM certificate boundary", async () => {
  const [html, app, coordinate] = await Promise.all([
    readFile(new URL("../beginner/index.html", import.meta.url), "utf8"),
    readFile(new URL("../beginner/app.js", import.meta.url), "utf8"),
    readFile(new URL("../beginner/coordinate.js", import.meta.url), "utf8"),
  ]);
  assert.match(html, /网页本身不能替代 Loon MITM 证书/);
  assert.match(html, /没有数据库、登录和 Cloudflare 依赖/);
  assert.match(coordinate, /gs-loc\.apple\.com\/ils-settings\/save/);
  assert.doesNotMatch(app, /fetch\([^)]*open-meteo|nominatim|cloudflare/i);
});

test("public documentation, icon, manifests, and raw links stay discoverable", async () => {
  const files = [
    "ios-location-spoofer.lnplugin",
    "ios-location-spoofer.sgmodule",
    "ios-location-spoofer-surge.sgmodule",
    "ios-location-spoofer.snippet",
  ];
  const [guide, icon, rootReadme, ...manifests] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../assets/icon.svg", import.meta.url), "utf8"),
    readFile(new URL("../../../../README.md", import.meta.url), "utf8"),
    ...files.map((file) => readFile(new URL(`../${file}`, import.meta.url), "utf8")),
  ]);
  for (const term of ["首次安装", "MITM", "CA 证书", "导入插件", "保存坐标", "恢复真实定位", "网络层定位替换", "失败排查"]) {
    assert.match(guide, new RegExp(term));
  }
  assert.match(icon, /^<svg\b/);
  assert.match(icon, /定位图标/);
  assert.match(icon, /蓝色渐变/);
  assert.match(icon, /#F7FAFF/);
  assert.match(icon, /#2778F5/);
  const iconUrl = "https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/location/ios-location-spoofer/assets/icon.svg";
  for (const manifest of manifests) {
    assert.match(manifest, new RegExp(`#!icon=${iconUrl.replaceAll(".", "\\.")}`));
  }
  assert.match(guide, /raw\.githubusercontent\.com\/Lxp1986\/loon-plugins/);
  assert.match(rootReadme, /categories\/location\/ios-location-spoofer\/README\.md/);
  assert.match(rootReadme, /raw\.githubusercontent\.com\/Lxp1986\/loon-plugins/);
  assert.doesNotMatch(guide, /cyberhandyman\/ios-location-spoofer/);
});

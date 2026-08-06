# iOS Location Spoofer · Loon 定位助手

面向小白的最短路径：Loon 导入插件 → 开启 HTTPS 解密并安装/信任 Loon 自己的 CA 证书 → 打开 [beginner 安装向导](beginner/index.html) 选择地点并保存。

**不需要 Cloudflare，不需要账号，不需要数据库。** 坐标由 Loon 的 `location-settings.js` 写入当前设备本机存储；首次未保存坐标时默认放行真实定位。

## 三步开始

1. 在 Loon 的插件中导入 [`ios-location-spoofer.lnplugin`](ios-location-spoofer.lnplugin)，或使用 raw 地址：
   `https://raw.githubusercontent.com/cyberhandyman/ios-location-spoofer/main/ios-location-spoofer.lnplugin`
2. 在 Loon 开启 HTTPS 解密（MITM），生成、安装并在 iOS「证书信任设置」中信任 **Loon 自己的 CA 证书**。
3. 保持 Loon 已连接，下载仓库后打开 [`beginner/index.html`](beginner/index.html)（也可放到任意静态托管），选择固定地点或输入纬度/经度，点击「保存到本机」。需要恢复时点击「恢复真实定位」。

网页本身**不能替代 Loon MITM 证书**。保存 URL 只是发往 `gs-loc.apple.com/ils-settings/save` 的本机拦截请求；没有 Loon、MITM 或受信任 CA 时不会写入坐标。

完整的新手说明与故障排查见 [`docs/BEGINNER.md`](docs/BEGINNER.md)。

## 其他客户端与底层说明

| 客户端 | 模块 |
|---|---|
| Shadowrocket / Surge / Egern | [`ios-location-spoofer.sgmodule`](ios-location-spoofer.sgmodule) |
| Loon | [`ios-location-spoofer.lnplugin`](ios-location-spoofer.lnplugin) |
| Stash | [`ios-location-spoofer.stoverride`](ios-location-spoofer.stoverride) |
| Quantumult X | [`ios-location-spoofer.snippet`](ios-location-spoofer.snippet) |

插件保留现有 `location-spoofer.js` 的 ARPC/protobuf、海拔与运动状态处理，以及 `location-settings.js` 的本机持久化逻辑；本次 MVP 没有重写上游核心定位算法。

## 🔍 原理

iPhone 靠周围 Wi-Fi、基站的 BSSID 去问 Apple「这些设备在哪」，Apple 回一份坐标清单，iOS 据此算出自己的位置。

本模块在 **Apple 回坐标的半路上**（`gs-loc.apple.com/clls/wloc`）把响应里的坐标全部改成你指定的数字，iPhone 算出来就是你选的地方。选点页则通过 `ils-settings` 请求把坐标写进**你手机本机**的持久化存储，模块读取后生效——**全程不经过任何服务器**。

---

## 可选高级功能：Cloudflare Worker

仓库中的 [`stateless-picker/worker`](stateless-picker/worker) 只是可选的高级托管页面，默认安装路径不会调用它。它仍然是无状态的，不绑定 KV/D1；如果你需要公开网址或 Worker 自托管，再阅读该目录的说明并自行部署。

## 🙏 fork from 鸣谢贡献者

[Yu9191/wloc](https://github.com/Yu9191/wloc) · [mekos2772/ios-location-spoofer](https://github.com/mekos2772/ios-location-spoofer) · [acheong08/ios-location-spoofer](https://github.com/acheong08/ios-location-spoofer)

---

## 📄 免责声明

1. 本项目为免费开源工具，**仅供个人学习、研究与技术测试之用**，请勿用于任何违反所在国家/地区法律法规的用途。
2. 使用本项目（含模块、脚本、选点页）所引发的**一切风险与后果由使用者自行承担**，与开源项目原作者、贡献者及本仓库维护者无关。
3. 本项目与 **Apple Inc.** 无任何关联，不隶属、不代表 Apple，亦未获其授权或认可。
4. 本项目**不在中国大陆提供服务**。
5. 下载、安装或使用本项目，即视为你已阅读并同意本声明；如不同意，请立即停止使用。

许可证：**GNU AGPL-3.0**（继承自上游项目）

# iOS Location Spoofer · Loon 定位助手

面向小白的最短路径：Loon 导入插件 → 开启 HTTPS 解密并安装/信任 Loon 自己的 CA 证书 → 打开 [beginner 安装向导](beginner/index.html) 选择地点并保存。

本仓库是 Loon 插件集合，按功能分类存放：每个插件使用独立目录，并在下面登记 GitHub 页面链接与 `raw` 直链。

**不需要 Cloudflare，不需要账号，不需要数据库。** 坐标由 Loon 的 `location-settings.js` 写入当前设备本机存储；首次未保存坐标时默认放行真实定位。

## 三步开始

1. 在 Loon 的插件中导入 [`ios-location-spoofer.lnplugin`](ios-location-spoofer.lnplugin)，或使用 raw 地址：
   `https://raw.githubusercontent.com/Lxp1986/ios-location-spoofer/main/ios-location-spoofer.lnplugin`
2. 在 Loon 开启 HTTPS 解密（MITM），生成、安装并在 iOS「证书信任设置」中信任 **Loon 自己的 CA 证书**。
3. 保持 Loon 已连接，下载仓库后打开 [`beginner/index.html`](beginner/index.html)（也可放到任意静态托管），选择固定地点或输入纬度/经度，点击「保存到本机」。需要恢复时点击「恢复真实定位」。

网页本身**不能替代 Loon MITM 证书**。保存 URL 只是发往 `gs-loc.apple.com/ils-settings/save` 的本机拦截请求；没有 Loon、MITM 或受信任 CA 时不会写入坐标。

完整的新手说明与故障排查见 [`docs/BEGINNER.md`](docs/BEGINNER.md)。

> 能力边界：这是网络层定位替换，不能修改 iPhone GPS 芯片或阻止 App 直接读取 GNSS、Wi‑Fi、蓝牙、基站和系统缓存。因此不能保证防止硬件定位自动恢复；需要持续测试时，应使用受控测试设备或 App 自身的定位注入能力。

## 其他客户端与底层说明

| 客户端 | 模块 |
|---|---|
| Shadowrocket / Surge / Egern | [`ios-location-spoofer.sgmodule`](ios-location-spoofer.sgmodule) |
| Loon | [`ios-location-spoofer.lnplugin`](ios-location-spoofer.lnplugin) |
| Stash | [`ios-location-spoofer.stoverride`](ios-location-spoofer.stoverride) |
| Quantumult X | [`ios-location-spoofer.snippet`](ios-location-spoofer.snippet) |

插件保留现有 `location-spoofer.js` 的 ARPC/protobuf、海拔与运动状态处理，以及 `location-settings.js` 的本机持久化逻辑；本次 MVP 没有重写上游核心定位算法。

## 插件分类

| 分类 | 插件 | GitHub | raw 直链 |
|---|---|---|---|
| `location/` 定位工具 | iOS Location Spoofer | [仓库目录](https://github.com/Lxp1986/ios-location-spoofer/tree/main/location) | [`ios-location-spoofer.lnplugin`](https://raw.githubusercontent.com/Lxp1986/ios-location-spoofer/main/location/ios-location-spoofer.lnplugin) |

> 当前历史核心文件仍保留在仓库根目录以兼容已有导入地址；后续新增插件按 `location/`、`media/`、`ai/`、`privacy/` 等功能目录归类，并同步更新本表。新插件不会覆盖已有插件目录。

## 原理

iPhone 通过 Wi‑Fi、基站等信息请求 Apple 定位服务。本项目在 Loon 的 HTTPS 解密层修改定位响应，并把目标坐标写入当前设备的本机存储；服务端不保存用户坐标。

## 可选高级功能：Cloudflare Worker

仓库中的 [`stateless-picker/worker`](stateless-picker/worker) 只是可选的高级托管页面，默认安装路径不会调用它。它仍然是无状态的，不绑定 KV/D1；如果你需要公开网址或 Worker 自托管，再阅读该目录的说明并自行部署。

## 许可证与来源

本项目继承上游项目的 GNU AGPL-3.0 许可证。底层实现来源与致谢见原始项目说明。
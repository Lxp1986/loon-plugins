# iOS Location Spoofer（Loon）

这是一个面向测试与开发场景的 Loon 网络层定位替换插件。它在 Loon 拦截到 Apple/Wi‑Fi/基站定位接口的响应时，按本机保存的坐标替换网络返回值；坐标保存在当前设备的本地存储，不上传到本仓库或插件作者的服务器。

> 重要边界：这是网络层测试工具，不是系统 GPS 修改器。它不能保证覆盖 App 直接读取的 GNSS、蓝牙、Wi‑Fi、基站或系统缓存，也不承诺绕过考勤、风控或其他第三方安全机制。请仅在你有权测试的设备、App 和网络环境中使用。

## 快速入口

- [直接导入 Loon 插件](https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/location/ios-location-spoofer/ios-location-spoofer.lnplugin)
- [新手静态选点页](./beginner/index.html)：可选，不是 Loon 内置流程的前置条件
- [完整实现说明](./docs/BEGINNER.md)
- 图标：[assets/icon.svg](./assets/icon.svg)

## 首次安装

### 1. 导入插件

在 Loon 的插件管理中选择「从 URL 导入」，粘贴上面的 raw 地址并保存，然后确认插件已启用。也可以在 GitHub 目录中下载 `ios-location-spoofer.lnplugin` 后导入。

插件包含两条规则：

1. 拦截定位接口的 HTTP 响应并替换坐标；
2. 拦截选点页的保存请求，把坐标写入当前设备的本地持久化存储。

没有保存坐标时，插件默认关闭替换并放行真实定位。

### 2. 开启 Loon MITM 和 CA 证书

在 Loon 中开启 HTTPS 解密（MITM），生成并安装 Loon 的 CA 证书。回到 iOS 后完成两步：

1. 设置 → 通用 → VPN 与设备管理，安装 Loon 证书描述文件；
2. 设置 → 通用 → 关于本机 → 证书信任设置，打开该 Loon 证书的完全信任。

然后回到 Loon，确认 MITM、插件和脚本开关均已开启。网页能打开不代表 MITM 已生效；没有证书或没有完全信任时，坐标保存请求不会被本机脚本接管。

插件会追加以下 MITM 主机名，不应清空你原有的主机名：

```text
gs-loc.apple.com
gs-loc-cn.apple.com
bluedot.is.autonavi.com
bluedot.is.autonavi.com.gds.alibabadns.com
```

如果你的 Loon 版本导入后没有识别 `%APPEND%`，请备份配置后手动把上述主机名追加到 MITM 列表。

## 在 Loon 内填写并保存坐标（推荐）

这个插件已经提供 Loon 原生配置项，普通用户不需要打开网页：

1. 在 Loon → 配置 → 插件中打开 `iOS Location Spoofer (Stateless)` 的详情；
2. 点击右上角刷新，或删除旧插件后用新的 raw 链接重新导入；
3. 在插件配置项中填写：
   - `latitude`：纬度，例如 `23.1066`；
   - `longitude`：经度，例如 `113.3245`；
   - `enabled`：选择 `true` 启用，选择 `false` 恢复真实定位；
4. 保存并返回，保持 Loon 已连接，重新打开目标 App 并触发一次定位请求。

经纬度格式是十进制度，不要把地址、地图链接或“纬度,经度”整段文字填入单个输入框。示例：

```text
纬度 = 23.1066
经度 = 113.3245
启用 = true
```

这是**完全在 Loon 内完成**的主流程，不需要 Cloudflare、网页、服务器或快捷指令。网页和 `picker/worker` 只用于地图选点、地址搜索等扩展功能。

## 网页选点（可选）

如果不想查经纬度，可以使用仓库内的 `beginner/index.html`：

1. 打开页面，选择固定地点，或输入「纬度, 经度」；纬度范围是 `-90..90`，经度范围是 `-180..180`；
2. 点击「保存到本机」；
3. 保持 Loon 已连接，重新打开目标 App 并触发一次定位请求。

保存按钮访问固定的 `https://gs-loc.apple.com/ils-settings/save?...` 地址。该请求由 Loon 在本机拦截，`location-settings.js` 只把坐标写入本机存储，不会把坐标发送到本项目服务器。

如果页面按钮提示网络失败，可直接回到上面的 Loon 原生配置项填写。也可以使用可选的 `picker/worker` 地图选点页；它不是插件运行的前置条件。

## 恢复真实定位

在新手页点击「恢复真实定位」，或打开：

```text
https://gs-loc.apple.com/ils-settings/save?action=clear
```

这会把本机 `enabled` 设为 `false`，之后插件放行真实定位。如果目标 App 仍显示旧位置，请完全退出并重新打开 App；仍未恢复时，暂时停用插件再测试，以排除 App 自身缓存。

## 能力边界：网络层定位替换

插件只处理 Loon 能够解密并匹配到的网络请求，主要是 Apple/Wi‑Fi/基站定位服务的 `/clls/wloc` 响应。它不修改 iPhone 的 GPS 芯片、Core Location 数据库或系统定位权限，也不能控制目标 App 的缓存、传感器读取和异常检测。

因此可能出现以下情况：

- App 直接读取 GNSS、蓝牙、Wi‑Fi、基站或系统缓存时，仍可能看到真实位置；
- 请求未经过 Loon、未命中规则、使用证书固定或响应无法解码时，不会替换；
- App 重新请求定位后可能刷新结果，测试时应保持 Loon 连接并重新触发请求。

本插件适合可控的网络定位测试、接口调试和演示，不保证任何第三方 App 的持续显示结果。

## 失败排查

### 页面能打开，但保存失败

确认 Loon 已连接且没有使用直连模式；检查插件已启用、MITM 已启用、四个主机名已加入，并确认 Loon CA 已安装且在「证书信任设置」中完全信任。仍失败时复制保存 URL，在同一台设备上直接打开。

### 保存成功，但位置没有变化

检查纬度和经度没有写反，重启目标 App，并再次触发定位请求。若目标 App 有定位缓存，先恢复真实定位，再保存测试坐标。

### 导入后其他 MITM 主机名消失

先恢复 Loon 配置备份。旧版 Loon 可能不兼容 `%APPEND%`，请改为手动追加本插件需要的四个主机名，不要用插件内容覆盖整个 MITM 列表。

### 仍然被系统定位恢复

这是网络层工具的正常能力边界，不代表坐标写入失败。确认目标请求确实经过 Loon 并命中规则；如果 App 使用硬件或其他系统数据源，本插件无法强制覆盖。请改用目标 App 自带的测试注入、受控测试设备或系统级调试方案。

### 如何彻底关闭

先点击「恢复真实定位」，再在 Loon 中停用插件。停用后插件规则和保存拦截均不再运行。

## 其他客户端

本目录也保留 Surge/Egern、Stash 和 Quantumult X 的配置文件；它们的安装方式、MITM 设置和证书要求以对应客户端为准。本文的「Loon 插件」入口是 `ios-location-spoofer.lnplugin`。

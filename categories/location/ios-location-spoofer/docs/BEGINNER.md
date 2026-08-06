# Loon 定位助手：小白安装说明

这条路径只需要 Loon 和本机静态网页，不需要 Cloudflare、登录账号或数据库。坐标只写入当前设备的本机存储。

## 第一步：导入插件

在 Loon 的插件管理中导入仓库里的 [`ios-location-spoofer.lnplugin`](../ios-location-spoofer.lnplugin)，也可以使用对应的 GitHub raw 地址。导入后确认插件处于启用状态。

插件包含两个动作：拦截 Apple/Amap 的定位响应并替换坐标；拦截 `ils-settings` 保存请求并写入本机。底层 `location-spoofer.js` 与 `location-settings.js` 不需要手动修改。

## 第二步：开启 HTTPS 解密并信任证书

在 Loon 中打开 HTTPS 解密（MITM），生成并安装 **Loon 自己的 CA 证书**。回到 iOS：

1. 设置 → 通用 → VPN 与设备管理，安装 Loon 的证书描述文件；
2. 设置 → 通用 → 关于本机 → 证书信任设置，打开 Loon 证书的完全信任；
3. 回到 Loon，确认 MITM、脚本和插件开关均已开启。

网页本身不能替代 Loon MITM 证书。证书没有安装或没有完全信任时，页面即使能打开，也不能把坐标写入 Loon 的本机存储。

插件的 `[MITM]` 使用 `hostname = %APPEND% ...` 追加四个必要主机名，避免正常情况下覆盖你已有的 MITM 列表。Loon 官方插件格式文档明确列出 `[MITM]` 的 `hostname` 字段，但不同旧版本对 `%APPEND%` 的兼容性可能不同；若你的版本导入后没有追加主机名，请先备份现有配置，再把以下四项手动合并到 Loon 的 MITM hostname 中，不要清空原有主机名：

```text
gs-loc.apple.com
gs-loc-cn.apple.com
bluedot.is.autonavi.com
bluedot.is.autonavi.com.gds.alibabadns.com
```

## 第三步：选择并保存坐标

下载仓库后直接打开 [`beginner/index.html`](../beginner/index.html)，或把 `beginner/` 放到任意静态托管。它是纯静态页面，不使用外部数据库：

1. 选择固定地点，或输入 `纬度, 经度`；
2. 点击「保存到本机」。页面会请求固定的 `https://gs-loc.apple.com/ils-settings/save?...` 地址，由 Loon 在本机拦截并保存；
3. 打开目标 App 验证。页面提示网络失败时，点击「复制保存 URL」，确认 Loon 已连接、MITM 已开启、CA 已信任后重新打开该 URL。

需要恢复真实定位时，点击「恢复真实定位」，或复制并打开 `https://gs-loc.apple.com/ils-settings/save?action=clear`。它会把本机 `enabled` 设为 `false`；如果目标 App 仍缓存旧位置，重启目标 App，必要时暂时停用插件。

## 故障排查

### 为什么有时会被硬件定位恢复

本项目是 **网络层定位替换**，不是修改 iPhone 的 GPS 芯片或 Core Location 系统数据。它只能在 Loon 拦截到 Apple/Wi‑Fi/基站定位请求时替换网络返回值；如果目标 App 直接读取 GNSS、基站、Wi‑Fi、蓝牙或系统缓存，或者主动检测定位异常，Loon 插件无法保证持续覆盖，也不能阻止系统重新取得真实位置。

因此不能承诺“防止硬件定位自动恢复”。可以做的只有：保持 Loon 连接和 MITM，确保插件持续启用，并在目标 App 重新请求定位时再次替换网络结果。若必须让 App 始终只看到测试位置，需要使用 App 自身的测试注入、受控测试设备或系统级调试方案；这不属于普通 Loon 插件的能力范围。

### 页面可以打开，但保存失败

先检查 Loon 是否已连接并且不是直连模式；再检查 MITM、脚本、插件开关，以及 Loon CA 是否在 iOS「证书信任设置」中完全信任。仍失败时复制保存 URL，在同一台设备上重新打开。

### 保存成功但位置没有变化

确认纬度与经度没有写反，范围分别是 `-90..90` 与 `-180..180`。重启目标 App；如果系统或 App 使用了缓存位置，先点「恢复真实定位」再重新保存一次。

### 导入插件后其他 MITM 规则消失

这是旧版解析 `%APPEND%` 不兼容或导入方式覆盖配置造成的。恢复备份；随后只把四个定位主机名手动追加到 MITM hostname，再启用插件。不要删除其他业务主机名。

### 没有任何坐标时会怎样

默认 `enabled=false`，模块会放行真实定位。清除保存数据或点击「恢复真实定位」也会回到这个状态。

## 可选高级功能：Cloudflare Worker（最后再看）

如果你需要一个公开 HTTPS 网址，可以部署 [`picker/worker`](../picker/worker)。这是可选托管页面，不是 Loon 插件运行的前置条件，也不会替代 Loon MITM 证书；默认推荐的 `beginner/` 静态页面不调用 Worker。

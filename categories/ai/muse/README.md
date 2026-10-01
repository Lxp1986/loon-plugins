# Muse 分流规则

Meta Muse 客户端的分流规则：聊天、实时语音、后台同步、账号体系。规则**不指定策略**，订阅或安装后在你自己的配置里指定策略组。

## 文件

| 文件 | 用途 |
|---|---|
| `muse.list` | 规则集：`RULE-SET,https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/ai/muse/muse.list,你的策略组` |
| `muse.lnplugin` | Loon 一键安装插件（内嵌同一份规则） |

## 名单来源

- iOS 客户端二进制静态拆解（151 个主机名的全量子集，含 agent / 网关 / 云端 VM / 实时语音 / 账号体系）
- Mac 客户端拆解补全的网关域名（`node.hatch.one`、`*.willow606.com`）
- Meta 官方文档域名（`muse.ai`、`ai.meta.com` 等）

宽后缀写法（`DOMAIN-SUFFIX,meta.ai` 这类）防止 Meta 新增子域名时漏网；隐私中继的 Fastly / Cloudflare 域名用精确 `DOMAIN`，不整站收录公有 CDN。

## 维护

- IP 不写：Meta 用 anycast，IP 经常变，写死必失效
- Meta 新增域名不会通知，定期用客户端拆解复核
- 跑测试：仓库根目录 `npm test`

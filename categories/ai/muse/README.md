# Muse 分流规则

Meta Muse 客户端的分流规则：聊天、实时语音、后台同步、账号体系。

## 策略组（插件安装时设置）

插件规则里的 `PROXY` 是 Loon 占位符，不是写死的策略。安装插件后，在 Loon 的插件设置里把它映射到你自己的策略组：

```
proxy=你的策略组名
```

例如你的策略组叫 `美国节点`，就填 `proxy=美国节点`。不映射的话，未指定策略的规则在 Loon 插件里会默认走 DIRECT。

只想用规则集订阅（自己写 RULE-SET 行指定策略）的，用这个：

```
RULE-SET,https://raw.githubusercontent.com/Lxp1986/rules-and-scripts/refs/heads/master/loon/muse/muse.list,你的策略组
```

## 文件

| 文件 | 用途 |
|---|---|
| `muse.lnplugin` | Loon 一键安装插件（规则内嵌在插件 [Rule] 段） |
| `assets/muse-icon.jpg` | 插件图标（Muse 官方应用图标） |

> 本仓库只放 Loon 插件，不放规则集。规则集订阅用 [rules-and-scripts 仓库](https://github.com/Lxp1986/rules-and-scripts) 的 `loon/muse/muse.list`。

## 名单来源

- iOS 客户端二进制静态拆解（151 个主机名的全量子集，含 agent / 网关 / 云端 VM / 实时语音 / 账号体系）
- Mac 客户端拆解补全的网关域名（`node.hatch.one`、`*.willow606.com`）
- Meta 官方文档域名（`muse.ai`、`ai.meta.com` 等）

宽后缀写法（`DOMAIN-SUFFIX,meta.ai` 这类）防止 Meta 新增子域名时漏网；隐私中继的 Fastly / Cloudflare 域名用精确 `DOMAIN`，不整站收录公有 CDN。

## 维护

- IP 不写：Meta 用 anycast，IP 经常变，写死必失效
- Meta 新增域名不会通知，定期用客户端拆解复核
- 跑测试：仓库根目录 `npm test`

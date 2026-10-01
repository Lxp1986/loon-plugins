# Loon Plugins

Loon 插件公开集合，按功能分类维护。每个插件自带配置文件、脚本、文档和测试，互不混放。

## 插件目录

| 分类 | 插件 | GitHub | Loon raw 直链 |
|---|---|---|---|
| `location` | 定位助手（无状态） | [中文说明](https://github.com/Lxp1986/loon-plugins/blob/main/categories/location/ios-location-spoofer/README.md) | [导入插件](https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/location/ios-location-spoofer/ios-location-spoofer.lnplugin) |
| `location` | 抖音同城任意门 | [中文说明](https://github.com/Lxp1986/loon-plugins/blob/main/categories/location/douyin-tongcheng/README.md) | [导入插件](https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/location/douyin-tongcheng/douyin-tongcheng.lnplugin) |
| `ai` | Muse 分流规则 | [中文说明](https://github.com/Lxp1986/loon-plugins/blob/main/categories/ai/muse/README.md) | [导入插件](https://raw.githubusercontent.com/Lxp1986/loon-plugins/main/categories/ai/muse/muse.lnplugin) |

新用户请先阅读 [定位助手使用说明](https://github.com/Lxp1986/loon-plugins/blob/main/categories/location/ios-location-spoofer/README.md)。

## 分类规则

新插件统一放入：

```text
categories/<category>/<plugin-name>/
```

当前分类：

- `media/`：媒体处理
- `ai/`：AI 服务与工具
- `privacy/`：隐私与安全
- `system/`：系统增强

## 插件目录约定

```text
<plugin-name>/
├── README.md
├── *.lnplugin / *.sgmodule / *.snippet
├── scripts/
├── docs/
├── tests/
└── picker/ 或 web/（可选）
```

根目录只保留仓库级 README、LICENSE、`categories/` 和必要的开发配置，不直接堆放插件文件。

## 许可

各插件的许可证和来源以其目录内说明为准。

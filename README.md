# Loon Plugins

Loon 插件公开集合，按功能分类维护。每个插件自带配置文件、脚本、文档和测试，互不混放。

## 插件目录

| 分类 | 插件 | GitHub | Loon raw 直链 |
|---|---|---|---|


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

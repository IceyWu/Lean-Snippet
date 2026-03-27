# Lean Snippet

> VS Code 代码片段管理 & 日志工具。

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/IceyWu.LeanSnippet?label=Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=IceyWu.LeanSnippet)

**中文** | [English](./README.md)

## 功能

- **片段管理** — 侧边栏浏览、添加、导入/导出代码片段
- **多语言** — 内置 JS、TS、Vue、HTML，支持自定义语言
- **日志工具** — 插入具名 `console.log`，一键清理所有日志
- **快捷键编辑** — 面板内查看和自定义快捷键

<p align="center">
  <img src="./assets/use.gif" width="100%" alt="演示" />
</p>

## 快捷键

| 快捷键         | 功能               |
| -------------- | ------------------ |
| `Ctrl+Shift+L` | 将选中变量插入 log |
| `Ctrl+Shift+/` | 选择日志类型插入   |
| `Ctrl+Shift+D` | 删除文件内所有日志 |

> Mac 下将 `Ctrl` 替换为 `Cmd`。所有快捷键均可在面板中自定义。

### 日志示例

```js
// 选中 `text`，按 Ctrl+Shift+L →
console.log("🍧-----text-----", text);

// 按 Ctrl+Shift+D → 所有 console.log 被移除
```

## 片段速查

### JavaScript / TypeScript

| 前缀         | 说明                 |
| ------------ | -------------------- |
| `lre`        | 异步请求模板         |
| `lret`       | 带 try-catch 的请求  |
| `lcl`        | `console.log` 带变量 |
| `laf`        | 箭头函数             |
| `lif`        | If-else              |
| `lsw`        | Switch-case          |
| `lcc`        | JSDoc 注释           |
| `linterface` | TS 接口              |
| `ltype`      | TS 类型别名          |
| `ltsfunc`    | TS 函数              |
| `lclass`     | TS 类                |
| `lenum`      | TS 枚举              |
| `ltrycatch`  | Try-catch 块         |

### Vue 3

| 前缀                     | 说明                                           |
| ------------------------ | ---------------------------------------------- |
| `lvc`                    | 组件模板                                       |
| `lvb`                    | 基础模板                                       |
| `lref`                   | `ref()`                                        |
| `lrea`                   | `reactive()`                                   |
| `lcom`                   | `computed()`                                   |
| `lwa` / `lwe`            | `watch` / `watchEffect`                        |
| `lmo` / `lun`            | `onMounted` / `onUnmounted`                    |
| `lvem` / `lvpr` / `lvde` | `defineEmits` / `defineProps` / `defineExpose` |

### HTML

| 前缀    | 说明         |
| ------- | ------------ |
| `lrem`  | 英文占位文本 |
| `lremc` | 中文占位文本 |
| `lremn` | 数字占位文本 |

## 安装

1. 在 VS Code 扩展面板中搜索 **Lean Snippet**
2. 或从 [Marketplace](https://marketplace.visualstudio.com/items?itemName=IceyWu.LeanSnippet) 安装

## License

MIT &copy; 2023-PRESENT [Icey Wu](https://github.com/IceyWu)

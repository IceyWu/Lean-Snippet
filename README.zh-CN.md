<br>

<p align="center">
<img src="https://raw.githubusercontent.com/IceyWu/Lean-Snippet/main/assets/images/logo.png" style="width:100px;" height="128" />
</p>

<h1 align="center">Lean Snippet</h1>
<h3 align="center">🌈 智能代码片段扩展 - Visual Studio Code</h3>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=IceyWu.LeanSnippet" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/IceyWu.LeanSnippet.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
</p>

[🚀 从应用商店下载](https://marketplace.visualstudio.com/items?itemName=IceyWu.LeanSnippet)

**中文** | [English](./README.md)

## ✨ 主要特性

- 🎯 **智能侧边栏面板** - 可视化浏览和管理代码片段
- 🌈 **多语言支持** - JavaScript、TypeScript、Vue、HTML 代码片段
- ⚡ **快速插入** - 一键插入代码片段，支持快捷键
- 🎨 **自定义图标** - 精美的语言特色图标
- 📝 **日志管理** - 智能 console.log 插入和清理
- 🔧 **交互操作** - 添加、导入、导出代码片段
- 💾 **TypeScript 驱动** - 完全重写为 TypeScript，性能更佳

<br>

## 🚀 使用方法

### 侧边栏面板

1. 点击活动栏中的 **Lean Snippet** 图标
2. 按语言浏览代码片段（JavaScript、TypeScript、Vue、HTML）
3. 双击或使用操作按钮插入代码片段
4. 使用预览功能查看代码片段详情

<p align="center">
<img src="./assets/use.gif" style="width:100%;" alt="使用演示" />
</p>

## ⌨️ 键盘快捷键

| 快捷键 | 描述 |
|--------|------|
| `Ctrl+Shift+L` / `Cmd+Shift+L` | 插入带变量的日志语句 |
| `Ctrl+Shift+/` / `Cmd+Shift+/` | 为选中内容插入日志语句 |
| `Ctrl+Shift+D` / `Cmd+Shift+D` | 删除所有 console.log 语句 |
| `Ctrl+Shift+J` / `Cmd+Shift+J` | 插入 consolePlus 语句 |

### 示例

**带变量的日志:**

```javascript
console.log('🍧-----text-----', text);
```

**选中内容日志:**

```javascript
console.log('🌳result------------------------------>');
```

## 📝 代码片段

### JavaScript & TypeScript

| 前缀 | 描述 | 内容 |
|------|------|------|
| `lre` | API 请求示例 | `async/await 请求模式` |
| `lcl` | 带变量的控制台日志 | `console.log('🌈-----xxx-----', xxx)` |
| `laf` | 箭头函数 | `const func = () => {}` |
| `lif` | If-else 语句 | `if(){...} else{...}` |
| `lsw` | Switch 语句 | `switch(){case: break; default: break;}` |
| `lcc` | JSDoc 注释 | `/** * @func fnName */` |
| `linterface` | TypeScript 接口 | `interface InterfaceName {}` |
| `ltype` | TypeScript 类型别名 | `type TypeName = type` |
| `ltsfunc` | TypeScript 函数 | `function name(): returnType {}` |
| `lclass` | TypeScript 类 | `class ClassName {}` |
| `lenum` | TypeScript 枚举 | `enum EnumName {}` |
| `ltrycatch` | Try-catch 块 | `try{} catch(error: unknown){}` |

### Vue 3 组合式 API

| 前缀 | 描述 | 内容 |
|------|------|------|
| `lvc` | Vue 3 组件模板 | 完整组件结构 |
| `lvb` | Vue 基础模板 | 基础 Vue 模板 |
| `lref` | 响应式引用 | `const valName = ref(..)` |
| `lrea` | 响应式对象 | `const valName = reactive(..)` |
| `lcom` | 计算属性 | `const valName = computed(..)` |
| `lwa` | 监听器 | `watch(..)` |
| `lwe` | 监听器效果 | `watchEffect(..)` |
| `lmo` | 挂载钩子 | `onMounted(..)` |
| `lbm` | 挂载前钩子 | `onBeforeMount(..)` |
| `lbu` | 卸载前钩子 | `onBeforeUnmount(..)` |
| `lun` | 卸载钩子 | `onUnmounted(..)` |
| `lvem` | 定义事件 | `const emit = defineEmits([])` |
| `lvpr` | 定义属性 | `const props = defineProps({})` |
| `lvde` | 定义暴露 | `defineExpose({})` |

### HTML 工具

| 前缀 | 描述 | 内容 |
|------|------|------|
| `lrem` | 英文占位文本 | 英文 Lorem ipsum |
| `lremc` | 中文占位文本 | 中文占位文本 |
| `lremn` | 数字占位文本 | 数字占位文本 |

## 🛠️ 开发技术

此扩展采用 TypeScript 构建，遵循现代 VS Code 扩展开发最佳实践：

- **TypeScript**: 完整的类型安全和更好的开发体验
- **模块化架构**: 清晰的关注点分离
- **自定义图标**: 精美的 SVG 图标，提供更好的视觉体验
- **交互式侧边栏**: 可视化代码片段管理和预览功能

## 🔧 安装方法

1. 从 [VS Code 应用商店](https://marketplace.visualstudio.com/items?itemName=IceyWu.LeanSnippet) 安装
2. 或在 VS Code 扩展面板中搜索 "Lean Snippet"
3. 重载 VS Code 即可使用！

## 🚀 关于项目

**Lean Snippet** 旨在通过以下方式提升您的编码效率：

- 智能代码片段管理
- 快速插入工具
- 可视化浏览体验
- 多语言支持
- 可定制和可扩展

随着现代 Web 技术的快速发展，开发者需要高效的工具来减少重复工作并提高代码质量。Lean Snippet 将常用模式和最佳实践封装成易于访问的代码片段，在优化代码大小和开发效率的同时，大大提高了代码的可读性和可维护性。

**享受 Lean Snippet 带来的编码乐趣！** 🌈

## 📄 许可证

MIT License &copy; 2023-PRESENT [Icey Wu](https://github.com/IceyWu)

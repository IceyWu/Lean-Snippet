# 项目结构说明

## 📁 目录结构

```
Lean-Snippet/
├── src/                    # TypeScript 源代码
│   ├── commands/          # 命令处理模块
│   │   ├── deleteCommands.ts
│   │   └── logCommands.ts
│   ├── providers/         # 数据提供程序
│   │   └── snippetProvider.ts
│   ├── utils/            # 工具函数
│   │   ├── statusBar.ts
│   │   └── textUtils.ts
│   └── extension.ts      # 主入口文件
├── out/                   # TypeScript 编译输出 (自动生成)
├── snippets/             # 代码片段文件
│   ├── snippets-js.code-snippets
│   ├── snippets-ts.code-snippets
│   ├── snippets-vue.code-snippets
│   └── snippets-html.code-snippets
├── assets/               # 静态资源
│   ├── images/
│   └── use.gif
├── .vscode/              # VS Code 配置
├── node_modules/         # 依赖包 (自动生成)
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── eslint.config.js      # ESLint 配置
├── .gitignore           # Git 忽略文件
├── .vscodeignore        # VS Code 扩展打包忽略文件
└── README.md            # 项目说明
```

## 🚀 开发流程

1. **开发**: 在 `src/` 目录下编写 TypeScript 代码
2. **编译**: 运行 `npm run compile` 编译到 `out/` 目录
3. **测试**: 按 F5 启动扩展开发模式
4. **打包**: 运行 `npm run package` 生成 `.vsix` 文件
5. **发布**: 运行 `npm run publish` 发布到市场

## 📝 文件说明

### 核心文件

- `src/extension.ts` - 扩展主入口，注册所有功能
- `src/providers/snippetProvider.ts` - 侧栏代码片段视图提供程序
- `src/commands/` - 各种命令的实现
- `src/utils/` - 工具函数和辅助功能

### 配置文件

- `package.json` - 扩展配置、依赖和命令定义
- `tsconfig.json` - TypeScript 编译配置
- `eslint.config.js` - 代码质量检查配置

### 忽略文件

- `.gitignore` - Git 版本控制忽略文件
- `.vscodeignore` - 扩展打包时忽略的文件

## 🔧 代码规范

- 所有源代码使用 TypeScript
- 遵循 ESLint 规则
- 使用模块化设计，按功能分离代码
- 添加 JSDoc 注释说明函数用途

## 📦 打包说明

运行 `npm run package` 后：

- 只打包必要的文件 (out/, snippets/, assets/, package.json 等)
- 排除源代码 (src/), 开发工具配置, 和临时文件
- 生成的 .vsix 文件可以直接安装或发布

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const logCommands_1 = require("./commands/logCommands");
const deleteCommands_1 = require("./commands/deleteCommands");
const statusBar_1 = require("./utils/statusBar");
const snippetProvider_1 = require("./providers/snippetProvider");
/**
 * 激活扩展
 * @param context - 扩展上下文
 */
function activate(context) {
    console.log('Lean Snippet is now active');
    // 注册所有命令
    (0, logCommands_1.registerSurpriseCommand)(context);
    (0, logCommands_1.registerInsertLogStatement)(context);
    (0, deleteCommands_1.registerDeleteAllLogStatements)(context);
    (0, logCommands_1.registerInsertLogChoose)(context);
    (0, logCommands_1.registerInsertConsolePlus)(context);
    // 创建状态栏项目
    (0, statusBar_1.createStatusBarItem)(context);
    // 创建并注册代码片段视图提供程序
    const snippetProvider = new snippetProvider_1.SnippetProvider(context);
    const treeView = vscode.window.createTreeView('leanSnippetView', {
        treeDataProvider: snippetProvider,
        showCollapseAll: true
    });
    // 注册代码片段相关命令
    const refreshCommand = vscode.commands.registerCommand('leanSnippet.refreshSnippets', () => {
        snippetProvider.refresh();
        vscode.window.showInformationMessage('🌈 Snippets refreshed!');
    });
    const insertCommand = vscode.commands.registerCommand('leanSnippet.insertSnippet', (item) => {
        snippetProvider.insertSnippet(item);
    });
    const openFileCommand = vscode.commands.registerCommand('leanSnippet.openSnippetFile', (item) => {
        snippetProvider.openSnippetFile(item);
    });
    const previewCommand = vscode.commands.registerCommand('leanSnippet.previewSnippet', (item) => {
        snippetProvider.previewSnippet(item);
    });
    // 添加到订阅列表
    context.subscriptions.push(treeView, refreshCommand, insertCommand, openFileCommand, previewCommand);
}
/**
 * 停用扩展
 */
function deactivate() {
    // 清理资源
}
//# sourceMappingURL=extension.js.map
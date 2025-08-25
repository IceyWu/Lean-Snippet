import * as vscode from 'vscode';
import { 
  registerInsertLogStatement, 
  registerInsertLogChoose, 
  registerInsertConsolePlus,
  registerSurpriseCommand
} from './commands/logCommands';
import { registerDeleteAllLogStatements } from './commands/deleteCommands';
import { createStatusBarItem } from './utils/statusBar';
import { SnippetProvider } from './providers/snippetProvider';

/**
 * 激活扩展
 * @param context - 扩展上下文
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Lean Snippet is now active');

  // 注册所有命令
  registerSurpriseCommand(context);
  registerInsertLogStatement(context);
  registerDeleteAllLogStatements(context);
  registerInsertLogChoose(context);
  registerInsertConsolePlus(context);
  
  // 创建状态栏项目
  createStatusBarItem(context);

  // 创建并注册代码片段视图提供程序
  const snippetProvider = new SnippetProvider(context);
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
  context.subscriptions.push(
    treeView,
    refreshCommand,
    insertCommand,
    openFileCommand,
    previewCommand
  );
}

/**
 * 停用扩展
 */
export function deactivate(): void {
  // 清理资源
}

import * as vscode from 'vscode';

/**
 * 创建并配置状态栏项目
 * @param context - 扩展上下文
 */
export function createStatusBarItem(context: vscode.ExtensionContext): void {
  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  
  // 设置状态栏项的属性
  statusBarItem.text = '🌈Lean Snippet';
  statusBarItem.tooltip = '🌈 Generate useful snippets!';
  statusBarItem.command = 'extension.surprise';
  
  // 显示状态栏项
  statusBarItem.show();
  
  // 注册状态栏项，以便在插件卸载时清理资源
  context.subscriptions.push(statusBarItem);
}

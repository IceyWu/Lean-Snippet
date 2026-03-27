import * as vscode from "vscode";
import { registerDeleteAllLogStatements } from "./commands/deleteCommands";
import {
  registerInsertLogChoose,
  registerInsertLogStatement,
  registerSurpriseCommand,
} from "./commands/logCommands";
import { MainViewProvider } from "./providers/mainViewProvider";
import { Logger } from "./utils/logger";

/**
 * 激活扩展
 * @param context - 扩展上下文
 */
export function activate(context: vscode.ExtensionContext): void {
  Logger.success("扩展已激活");

  // 注册所有命令
  registerSurpriseCommand(context);
  registerInsertLogStatement(context);
  registerDeleteAllLogStatements(context);
  registerInsertLogChoose(context);

  // 创建并注册主视图面板
  const mainViewProvider = new MainViewProvider(
    vscode.Uri.file(context.extensionPath),
    context,
  );
  vscode.window.registerWebviewViewProvider(
    MainViewProvider.viewType,
    mainViewProvider,
  );

  // 所有功能已集成到主视图面板中
}

/**
 * 停用扩展
 */
export function deactivate(): void {
  // 清理资源
}

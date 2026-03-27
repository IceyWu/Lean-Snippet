import * as vscode from "vscode";
import {
  deleteFoundLogStatements,
  getAllLogStatements,
  getRandomEmoji,
} from "../utils/textUtils";

/**
 * 注册删除所有log语句命令
 * @param context - 扩展上下文
 */
export function registerDeleteAllLogStatements(
  context: vscode.ExtensionContext,
): void {
  const deleteAllLogStatements = vscode.commands.registerCommand(
    "extension.deleteAllLogStatements",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const documentText = editor.document.getText();

      const workspaceEdit = new vscode.WorkspaceEdit();
      const logStatements = getAllLogStatements(document, documentText);

      if (logStatements.length === 0) {
        vscode.window.showInformationMessage("当前文件中没有找到日志语句");
        return;
      }

      deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
      vscode.workspace.applyEdit(workspaceEdit).then((success) => {
        if (success) {
          const emoji = getRandomEmoji();
          vscode.window.showInformationMessage(
            `${emoji} 已删除 ${logStatements.length} 条日志语句`,
          );
        }
      });
    },
  );

  context.subscriptions.push(deleteAllLogStatements);
}

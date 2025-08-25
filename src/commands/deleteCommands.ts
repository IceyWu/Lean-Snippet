import * as vscode from 'vscode';
import { getAllLogStatements, deleteFoundLogStatements } from '../utils/textUtils';

/**
 * 注册删除所有log语句命令
 * @param context - 扩展上下文
 */
export function registerDeleteAllLogStatements(context: vscode.ExtensionContext): void {
  const deleteAllLogStatements = vscode.commands.registerCommand(
    'extension.deleteAllLogStatements',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const documentText = editor.document.getText();

      const workspaceEdit = new vscode.WorkspaceEdit();
      const logStatements = getAllLogStatements(document, documentText);

      deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
    }
  );
  
  context.subscriptions.push(deleteAllLogStatements);
}

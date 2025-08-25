import * as vscode from 'vscode';
import { insertText, getRandomEmoji } from '../utils/textUtils';

/**
 * 注册插入log语句命令
 * @param context - 扩展上下文
 */
export function registerInsertLogStatement(context: vscode.ExtensionContext): void {
  const insertLogStatement = vscode.commands.registerCommand(
    'extension.insertLogStatement',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const randomEmoji = getRandomEmoji();

      if (text) {
        vscode.commands
          .executeCommand('editor.action.insertLineAfter')
          .then(() => {
            const logToInsert = `console.log('${randomEmoji}-----${text}-----', ${text});`;
            insertText(logToInsert);
          });
      } else {
        insertText('console.log();');
      }
    }
  );
  
  context.subscriptions.push(insertLogStatement);
}

/**
 * 注册插入选择内容命令
 * @param context - 扩展上下文
 */
export function registerInsertLogChoose(context: vscode.ExtensionContext): void {
  const insertLogChoose = vscode.commands.registerCommand(
    'extension.insertLogChoose',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const randomEmoji = getRandomEmoji();
      
      if (text) {
        vscode.commands
          .executeCommand('editor.action.insertLineAfter')
          .then(() => {
            const logToInsert = `console.log('${randomEmoji}${text}------------------------------>');`;
            insertText(logToInsert);
          });
      } else {
        insertText(
          `console.log('${randomEmoji}------------------------------>');`
        );
      }
    }
  );
  
  context.subscriptions.push(insertLogChoose);
}

/**
 * 注册consolePlus命令
 * @param context - 扩展上下文
 */
export function registerInsertConsolePlus(context: vscode.ExtensionContext): void {
  const insertConsolePlus = vscode.commands.registerCommand(
    'extension.insertConsolePlus',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      
      if (text) {
        vscode.commands
          .executeCommand('editor.action.insertLineAfter')
          .then(() => {
            const logToInsert = `consolePlus.log('${text}', ${text});`;
            insertText(logToInsert);
          });
      } else {
        insertText('consolePlus.log();');
      }
    }
  );
  
  context.subscriptions.push(insertConsolePlus);
}

/**
 * 注册惊喜命令
 * @param context - 扩展上下文
 */
export function registerSurpriseCommand(context: vscode.ExtensionContext): void {
  const surprise = vscode.commands.registerCommand('extension.surprise', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const content = `// 🌈thanks for AnNan!! 🎇🎇🎇🎇🎇🎇`;
    insertText(content);
  });
  
  context.subscriptions.push(surprise);
}

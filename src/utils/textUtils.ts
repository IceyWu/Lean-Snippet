import * as vscode from 'vscode';

/**
 * 在编辑器中插入文本
 * @param text - 要插入的文本
 */
export function insertText(text: string): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage(
      "Can't insert log because no document is open"
    );
    return;
  }

  const selection = editor.selection;
  const range = new vscode.Range(selection.start, selection.end);

  editor.edit((editBuilder) => {
    editBuilder.replace(range, text);
  });
}

/**
 * 获取随机表情符号
 * @returns 随机表情符号
 */
export function getRandomEmoji(): string {
  const emojis = [
    "🌈",
    "🦄", 
    "🐳",
    "🎁",
    "🐬",
    "🐠",
    "🌵",
    "🌳",
    "🍧",
    "🎉",
    "🍪",
    "🍭",
  ];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * 获取文档中所有的log语句
 * @param document - VS Code文档对象
 * @param documentText - 文档文本内容
 * @returns log语句的范围数组
 */
export function getAllLogStatements(
  document: vscode.TextDocument,
  documentText: string
): vscode.Range[] {
  const logStatements: vscode.Range[] = [];

  const logRegex =
    /console\.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\([^)]*\);?/g;
  
  let match: RegExpExecArray | null;
  while ((match = logRegex.exec(documentText))) {
    const matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length)
    );
    if (!matchRange.isEmpty) {
      logStatements.push(matchRange);
    }
  }
  
  return logStatements;
}

/**
 * 删除找到的log语句
 * @param workspaceEdit - 工作区编辑对象
 * @param docUri - 文档URI
 * @param logs - 要删除的log语句范围数组
 */
export function deleteFoundLogStatements(
  workspaceEdit: vscode.WorkspaceEdit,
  docUri: vscode.Uri,
  logs: vscode.Range[]
): void {
  logs.forEach((log) => {
    const lineNum = log.start.line;
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    // 获取所在行的内容
    const lineContent = editor.document.lineAt(lineNum).text;
    // 获取所在行的内容的长度
    const lineContentLength = lineContent.length;
    // 删除所在行的内容
    workspaceEdit.delete(
      docUri,
      new vscode.Range(
        new vscode.Position(lineNum, 0),
        new vscode.Position(lineNum, lineContentLength)
      )
    );
  });
  
  const randomEmoji = getRandomEmoji();
  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    vscode.window.showInformationMessage(
      ` Opps!${randomEmoji} There have ${logs.length} logs deleted`
    );
  });
}

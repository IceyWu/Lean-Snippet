const vscode = require("vscode");

const insertText = (val) => {
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
    editBuilder.replace(range, val);
  });
};
const getRandomEmoji = () => {
  const emojis = [
    "🌈",
    "🦄",
    "🐛",
    "🐳",
    "🐙",
    "🐬",
    "🐠",
    "🌵",
    "🍄",
    "🌯",
    "🍺",
    "🍻",
    "🍩",
    "🍦",
    "🍧",
    "🍨",
    "🍪",
    "🍫",
    "🍬",
    "🍭",
  ];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

function getAllLogStatements(document, documentText) {
  let logStatements = [];

  const logRegex =
    /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
  let match;
  while ((match = logRegex.exec(documentText))) {
    let matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length)
    );
    if (!matchRange.isEmpty) logStatements.push(matchRange);
  }
  return logStatements;
}

function deleteFoundLogStatements(workspaceEdit, docUri, logs) {
  logs.forEach((log) => {
    workspaceEdit.delete(docUri, log);
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    logs.length > 1
      ? vscode.window.showInformationMessage(
          `${logs.length} console.logs deleted`
        )
      : vscode.window.showInformationMessage(
          `${logs.length} console.log deleted`
        );
  });
}

function activate(context) {
  console.log("console-log-utils is now active");
  //   彩蛋：增加log打印:thanks for using lean-snippet
  const surprise = vscode.commands.registerCommand("extension.surprise", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const content = `// 🌈thanks for AnNan!! 🎇🎇🎇🎇🎇🎇`;
    insertText(content);
  });
  context.subscriptions.push(surprise);
  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  // 设置状态栏项的属性
  statusBarItem.text = "🌈Lean Snippet";
  statusBarItem.tooltip = "🌈 Generate useful snippets!";
  statusBarItem.command = "extension.surprise"; // 替换为你的扩展命令
  // 显示状态栏项
  statusBarItem.show();
  // 注册状态栏项，以便在插件卸载时清理资源
  context.subscriptions.push(statusBarItem);

  const insertLogStatement = vscode.commands.registerCommand(
    "extension.insertLogStatement",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const randomEmoji = getRandomEmoji();

      text
        ? vscode.commands
            .executeCommand("editor.action.insertLineAfter")
            .then(() => {
              const logToInsert = `console.log('${randomEmoji}-----${text}-----', ${text});  // text: ${text}`;
              insertText(logToInsert);
            })
        : insertText("console.log();");
    }
  );
  context.subscriptions.push(insertLogStatement);

  const deleteAllLogStatements = vscode.commands.registerCommand(
    "extension.deleteAllLogStatements",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const documentText = editor.document.getText();

      let workspaceEdit = new vscode.WorkspaceEdit();

      const logStatements = getAllLogStatements(document, documentText);

      deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
    }
  );
  context.subscriptions.push(deleteAllLogStatements);
}
exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;

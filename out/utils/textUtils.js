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
exports.insertText = insertText;
exports.getRandomEmoji = getRandomEmoji;
exports.getAllLogStatements = getAllLogStatements;
exports.deleteFoundLogStatements = deleteFoundLogStatements;
const vscode = __importStar(require("vscode"));
/**
 * 在编辑器中插入文本
 * @param text - 要插入的文本
 */
function insertText(text) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("Can't insert log because no document is open");
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
function getRandomEmoji() {
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
function getAllLogStatements(document, documentText) {
    const logStatements = [];
    const logRegex = /console\.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\([^)]*\);?/g;
    let match;
    while ((match = logRegex.exec(documentText))) {
        const matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
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
function deleteFoundLogStatements(workspaceEdit, docUri, logs) {
    logs.forEach((log) => {
        const lineNum = log.start.line;
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        // 获取所在行的内容
        const lineContent = editor.document.lineAt(lineNum).text;
        // 获取所在行的内容的长度
        const lineContentLength = lineContent.length;
        // 删除所在行的内容
        workspaceEdit.delete(docUri, new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, lineContentLength)));
    });
    const randomEmoji = getRandomEmoji();
    vscode.workspace.applyEdit(workspaceEdit).then(() => {
        vscode.window.showInformationMessage(` Opps!${randomEmoji} There have ${logs.length} logs deleted`);
    });
}
//# sourceMappingURL=textUtils.js.map
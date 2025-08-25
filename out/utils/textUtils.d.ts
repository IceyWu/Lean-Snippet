import * as vscode from 'vscode';
/**
 * 在编辑器中插入文本
 * @param text - 要插入的文本
 */
export declare function insertText(text: string): void;
/**
 * 获取随机表情符号
 * @returns 随机表情符号
 */
export declare function getRandomEmoji(): string;
/**
 * 获取文档中所有的log语句
 * @param document - VS Code文档对象
 * @param documentText - 文档文本内容
 * @returns log语句的范围数组
 */
export declare function getAllLogStatements(document: vscode.TextDocument, documentText: string): vscode.Range[];
/**
 * 删除找到的log语句
 * @param workspaceEdit - 工作区编辑对象
 * @param docUri - 文档URI
 * @param logs - 要删除的log语句范围数组
 */
export declare function deleteFoundLogStatements(workspaceEdit: vscode.WorkspaceEdit, docUri: vscode.Uri, logs: vscode.Range[]): void;
//# sourceMappingURL=textUtils.d.ts.map
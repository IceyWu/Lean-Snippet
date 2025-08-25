import * as vscode from 'vscode';
/**
 * 代码片段项目类型
 */
export declare class SnippetItem extends vscode.TreeItem {
    readonly label: string;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    readonly snippet?: any | undefined;
    readonly filePath?: string | undefined;
    readonly prefix?: string | undefined;
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, snippet?: any | undefined, filePath?: string | undefined, prefix?: string | undefined);
}
/**
 * 代码片段数据提供程序
 */
export declare class SnippetProvider implements vscode.TreeDataProvider<SnippetItem> {
    private context;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void>;
    private extensionPath;
    constructor(context: vscode.ExtensionContext);
    refresh(): void;
    getTreeItem(element: SnippetItem): vscode.TreeItem;
    getChildren(element?: SnippetItem): Thenable<SnippetItem[]>;
    /**
     * 获取语言分类
     */
    private getLanguageCategories;
    /**
     * 获取指定语言的代码片段
     */
    private getSnippetsForLanguage;
    /**
     * 从文件加载代码片段
     */
    private loadSnippetsFromFile;
    /**
     * 插入代码片段
     */
    insertSnippet(item: SnippetItem): Promise<void>;
    /**
     * 打开代码片段文件
     */
    openSnippetFile(item: SnippetItem): Promise<void>;
    /**
     * 预览代码片段
     */
    previewSnippet(item: SnippetItem): Promise<void>;
}
//# sourceMappingURL=snippetProvider.d.ts.map
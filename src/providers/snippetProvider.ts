import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 代码片段项目类型
 */
export class SnippetItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly snippet?: any,
    public readonly filePath?: string,
    public readonly prefix?: string
  ) {
    super(label, collapsibleState);
    
    if (snippet) {
      this.tooltip = `${this.label}${prefix ? ` - Prefix: ${prefix}` : ''}`;
      this.description = prefix;
      this.contextValue = 'snippet';
      this.iconPath = new vscode.ThemeIcon('symbol-snippet');
      this.command = {
        command: 'leanSnippet.insertSnippet',
        title: 'Insert Snippet',
        arguments: [this]
      };
    } else if (filePath) {
      this.tooltip = `代码片段文件: ${path.basename(filePath)}`;
      this.contextValue = 'snippetFile';
      this.iconPath = new vscode.ThemeIcon('file-code');
      this.command = {
        command: 'leanSnippet.openSnippetFile',
        title: 'Open Snippet File',
        arguments: [this]
      };
    } else {
      this.contextValue = 'category';
      this.iconPath = new vscode.ThemeIcon('folder');
    }
  }
}

/**
 * 代码片段数据提供程序
 */
export class SnippetProvider implements vscode.TreeDataProvider<SnippetItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private extensionPath: string;

  constructor(private context: vscode.ExtensionContext) {
    this.extensionPath = context.extensionPath;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SnippetItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SnippetItem): Thenable<SnippetItem[]> {
    if (!element) {
      // 根节点 - 显示语言分类
      return Promise.resolve(this.getLanguageCategories());
    } else if (element.contextValue === 'category') {
      // 语言分类节点 - 显示该语言的代码片段
      return Promise.resolve(this.getSnippetsForLanguage(element.label));
    }
    
    return Promise.resolve([]);
  }

  /**
   * 获取语言分类
   */
  private getLanguageCategories(): SnippetItem[] {
    const categories = [
      new SnippetItem('JavaScript', vscode.TreeItemCollapsibleState.Collapsed),
      new SnippetItem('TypeScript', vscode.TreeItemCollapsibleState.Collapsed),
      new SnippetItem('Vue', vscode.TreeItemCollapsibleState.Collapsed),
      new SnippetItem('HTML', vscode.TreeItemCollapsibleState.Collapsed)
    ];
    
    // 为每个分类添加图标
    categories[0].iconPath = new vscode.ThemeIcon('symbol-variable', new vscode.ThemeColor('charts.yellow'));
    categories[0].tooltip = 'JavaScript代码片段';
    
    categories[1].iconPath = new vscode.ThemeIcon('symbol-class', new vscode.ThemeColor('charts.blue'));
    categories[1].tooltip = 'TypeScript代码片段';
    
    categories[2].iconPath = new vscode.ThemeIcon('symbol-interface', new vscode.ThemeColor('charts.green'));
    categories[2].tooltip = 'Vue.js代码片段';
    
    categories[3].iconPath = new vscode.ThemeIcon('symbol-namespace', new vscode.ThemeColor('charts.orange'));
    categories[3].tooltip = 'HTML代码片段';
    
    return categories;
  }

  /**
   * 获取指定语言的代码片段
   */
  private getSnippetsForLanguage(language: string): SnippetItem[] {
    const snippetFiles: { [key: string]: string } = {
      'JavaScript': 'snippets-js.code-snippets',
      'TypeScript': 'snippets-ts.code-snippets', 
      'Vue': 'snippets-vue.code-snippets',
      'HTML': 'snippets-html.code-snippets'
    };

    const fileName = snippetFiles[language];
    if (!fileName) {
      console.log(`No file mapping found for language: ${language}`);
      return [];
    }

    // 尝试多个可能的路径
    const possiblePaths = [
      path.join(this.extensionPath, 'snippets', fileName),
      path.join(__dirname, '..', '..', 'snippets', fileName),
      path.join(process.cwd(), 'snippets', fileName)
    ];

    console.log(`Extension path: ${this.extensionPath}`);
    console.log(`__dirname: ${__dirname}`);
    console.log(`process.cwd(): ${process.cwd()}`);

    for (const snippetPath of possiblePaths) {
      console.log(`Trying path: ${snippetPath}`);
      
      if (fs.existsSync(snippetPath)) {
        console.log(`Found snippet file at: ${snippetPath}`);
        return this.loadSnippetsFromFile(snippetPath, fileName);
      }
    }

    console.log(`No snippet file found for ${fileName}`);
    return [new SnippetItem(
      `❌ File not found: ${fileName}`,
      vscode.TreeItemCollapsibleState.None
    )];
  }

  /**
   * 从文件加载代码片段
   */
  private loadSnippetsFromFile(filePath: string, fileName: string): SnippetItem[] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const snippets = JSON.parse(content);
      
      const items: SnippetItem[] = [];
      
      // 添加文件信息项目
      items.push(new SnippetItem(
        `📁 ${fileName} (${Object.keys(snippets).length} snippets)`,
        vscode.TreeItemCollapsibleState.None,
        undefined,
        filePath
      ));

      // 添加代码片段项目
      Object.keys(snippets).forEach(key => {
        const snippet = snippets[key];
        const prefix = snippet.prefix || 'No prefix';
        const description = snippet.description || 'No description';
        
        const item = new SnippetItem(
          `${key}`,
          vscode.TreeItemCollapsibleState.None,
          snippet,
          undefined,
          prefix
        );
        
        // 添加更好的图标和描述
        item.iconPath = new vscode.ThemeIcon('symbol-snippet');
        item.tooltip = `${description}\nPrefix: ${prefix}`;
        item.description = `${prefix}`;
        
        items.push(item);
      });

      console.log(`Loaded ${items.length - 1} snippets from ${fileName}`);
      return items;
    } catch (error) {
      console.error(`Error reading snippet file ${filePath}:`, error);
      return [new SnippetItem(
        `❌ Error loading ${fileName}: ${error}`,
        vscode.TreeItemCollapsibleState.None
      )];
    }
  }

  /**
   * 插入代码片段
   */
  async insertSnippet(item: SnippetItem): Promise<void> {
    if (!item.snippet) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const snippet = item.snippet;
    let body = '';
    
    if (Array.isArray(snippet.body)) {
      body = snippet.body.join('\n');
    } else {
      body = snippet.body || '';
    }

    const selection = editor.selection;
    const snippetString = new vscode.SnippetString(body);
    
    await editor.insertSnippet(snippetString, selection);
    
    vscode.window.showInformationMessage(`🌈 Inserted snippet: ${item.label}`);
  }

  /**
   * 打开代码片段文件
   */
  async openSnippetFile(item: SnippetItem): Promise<void> {
    if (!item.filePath) {
      return;
    }

    try {
      const document = await vscode.workspace.openTextDocument(item.filePath);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
  }

  /**
   * 预览代码片段
   */
  async previewSnippet(item: SnippetItem): Promise<void> {
    if (!item.snippet) {
      return;
    }

    const snippet = item.snippet;
    let body = '';
    
    if (Array.isArray(snippet.body)) {
      body = snippet.body.join('\n');
    } else {
      body = snippet.body || '';
    }

    const description = snippet.description || 'No description';
    const prefix = snippet.prefix || 'No prefix';

    const previewContent = `# 代码片段预览

## ${item.label}

**描述:** ${description}  
**前缀:** \`${prefix}\`

### 代码内容:
\`\`\`
${body}
\`\`\`

---
*点击 "Insert Snippet" 按钮将此代码片段插入到当前编辑器中*
`;

    // 创建一个新的文档来显示预览
    const doc = await vscode.workspace.openTextDocument({
      content: previewContent,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }
}

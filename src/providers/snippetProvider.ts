import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IconManager } from '../utils/iconManager';

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
  private iconManager: IconManager;

  constructor(private context: vscode.ExtensionContext) {
    this.extensionPath = context.extensionPath;
    this.iconManager = new IconManager(this.extensionPath);
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
    
    // 为每个分类添加自定义图标
    categories[0].iconPath = this.iconManager.getLanguageIcon('JavaScript');
    categories[0].tooltip = 'JavaScript代码片段';
    
    categories[1].iconPath = this.iconManager.getLanguageIcon('TypeScript');
    categories[1].tooltip = 'TypeScript代码片段';
    
    categories[2].iconPath = this.iconManager.getLanguageIcon('Vue');
    categories[2].tooltip = 'Vue.js代码片段';
    
    categories[3].iconPath = this.iconManager.getLanguageIcon('HTML');
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
        item.iconPath = this.iconManager.getSnippetIcon();
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

  /**
   * 添加新的代码片段
   */
  async addSnippet(): Promise<void> {
    // 选择语言类型
    const languageOptions = [
      { label: 'JavaScript', value: 'snippets-js.code-snippets' },
      { label: 'TypeScript', value: 'snippets-ts.code-snippets' },
      { label: 'Vue', value: 'snippets-vue.code-snippets' },
      { label: 'HTML', value: 'snippets-html.code-snippets' }
    ];

    const selectedLanguage = await vscode.window.showQuickPick(languageOptions, {
      placeHolder: '选择要添加代码片段的语言类型'
    });

    if (!selectedLanguage) {
      return;
    }

    // 输入代码片段信息
    const name = await vscode.window.showInputBox({
      prompt: '输入代码片段名称',
      placeHolder: '例如: My Custom Snippet'
    });

    if (!name) {
      return;
    }

    const prefix = await vscode.window.showInputBox({
      prompt: '输入代码片段前缀（触发词）',
      placeHolder: '例如: mcs'
    });

    if (!prefix) {
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: '输入代码片段描述',
      placeHolder: '例如: My custom code snippet'
    });

    // 打开编辑器让用户输入代码内容
    const doc = await vscode.workspace.openTextDocument({
      content: '// 请在这里输入您的代码片段内容\n// 每行代码将作为代码片段的一行\n',
      language: selectedLanguage.value.includes('js') ? 'javascript' : 
                selectedLanguage.value.includes('ts') ? 'typescript' :
                selectedLanguage.value.includes('vue') ? 'vue' : 'html'
    });

    await vscode.window.showTextDocument(doc);

    const proceed = await vscode.window.showInformationMessage(
      '请编辑代码内容，完成后点击"确认"将代码片段添加到文件中',
      'Confirm', 'Cancel'
    );

    if (proceed !== 'Confirm') {
      return;
    }

    // 获取用户输入的代码内容
    const content = doc.getText();
    const codeLines = content.split('\n').filter(line => 
      !line.trim().startsWith('//') || line.trim() !== ''
    );

    // 创建新的代码片段对象
    const newSnippet = {
      prefix: prefix,
      body: codeLines,
      description: description || `Custom snippet: ${name}`
    };

    // 添加到相应的代码片段文件
    const snippetFilePath = path.join(this.extensionPath, 'snippets', selectedLanguage.value);
    
    try {
      let existingSnippets: { [key: string]: any } = {};
      if (fs.existsSync(snippetFilePath)) {
        const fileContent = fs.readFileSync(snippetFilePath, 'utf8');
        existingSnippets = JSON.parse(fileContent);
      }

      existingSnippets[name] = newSnippet;

      fs.writeFileSync(snippetFilePath, JSON.stringify(existingSnippets, null, 2));
      
      this.refresh();
      vscode.window.showInformationMessage(`🌈 代码片段 "${name}" 已成功添加到 ${selectedLanguage.label}!`);
      
      // 关闭临时编辑器
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      
    } catch (error) {
      vscode.window.showErrorMessage(`添加代码片段失败: ${error}`);
    }
  }

  /**
   * 导入代码片段文件
   */
  async importSnippets(): Promise<void> {
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Import',
      filters: {
        'Code Snippets': ['code-snippets', 'json']
      }
    };

    const fileUri = await vscode.window.showOpenDialog(options);
    if (!fileUri || fileUri.length === 0) {
      return;
    }

    try {
      const importPath = fileUri[0].fsPath;
      const content = fs.readFileSync(importPath, 'utf8');
      const importedSnippets = JSON.parse(content);

      // 选择目标语言类型
      const languageOptions = [
        { label: 'JavaScript', value: 'snippets-js.code-snippets' },
        { label: 'TypeScript', value: 'snippets-ts.code-snippets' },
        { label: 'Vue', value: 'snippets-vue.code-snippets' },
        { label: 'HTML', value: 'snippets-html.code-snippets' }
      ];

      const selectedLanguage = await vscode.window.showQuickPick(languageOptions, {
        placeHolder: '选择要导入到哪个语言类型'
      });

      if (!selectedLanguage) {
        return;
      }

      const targetPath = path.join(this.extensionPath, 'snippets', selectedLanguage.value);
      
      let existingSnippets: { [key: string]: any } = {};
      if (fs.existsSync(targetPath)) {
        const fileContent = fs.readFileSync(targetPath, 'utf8');
        existingSnippets = JSON.parse(fileContent);
      }

      // 合并代码片段
      const mergedSnippets = { ...existingSnippets, ...importedSnippets };
      fs.writeFileSync(targetPath, JSON.stringify(mergedSnippets, null, 2));

      this.refresh();
      const count = Object.keys(importedSnippets).length;
      vscode.window.showInformationMessage(`🌈 成功导入 ${count} 个代码片段到 ${selectedLanguage.label}!`);

    } catch (error) {
      vscode.window.showErrorMessage(`导入代码片段失败: ${error}`);
    }
  }

  /**
   * 导出代码片段文件
   */
  async exportSnippets(): Promise<void> {
    // 选择要导出的语言类型
    const languageOptions = [
      { label: 'JavaScript', value: 'snippets-js.code-snippets' },
      { label: 'TypeScript', value: 'snippets-ts.code-snippets' },
      { label: 'Vue', value: 'snippets-vue.code-snippets' },
      { label: 'HTML', value: 'snippets-html.code-snippets' },
      { label: 'All Languages', value: 'all' }
    ];

    const selectedLanguage = await vscode.window.showQuickPick(languageOptions, {
      placeHolder: '选择要导出的语言类型'
    });

    if (!selectedLanguage) {
      return;
    }

    const options: vscode.SaveDialogOptions = {
      saveLabel: 'Export',
      filters: {
        'Code Snippets': ['json']
      }
    };

    if (selectedLanguage.value === 'all') {
      options.defaultUri = vscode.Uri.file('lean-snippet-all.json');
    } else {
      options.defaultUri = vscode.Uri.file(`lean-snippet-${selectedLanguage.label.toLowerCase()}.json`);
    }

    const saveUri = await vscode.window.showSaveDialog(options);
    if (!saveUri) {
      return;
    }

    try {
      let exportData: any = {};

      if (selectedLanguage.value === 'all') {
        // 导出所有语言的代码片段
        const allFiles = [
          'snippets-js.code-snippets',
          'snippets-ts.code-snippets', 
          'snippets-vue.code-snippets',
          'snippets-html.code-snippets'
        ];

        for (const fileName of allFiles) {
          const filePath = path.join(this.extensionPath, 'snippets', fileName);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const snippets = JSON.parse(content);
            const languageName = fileName.replace('snippets-', '').replace('.code-snippets', '');
            exportData[languageName] = snippets;
          }
        }
      } else {
        // 导出单个语言的代码片段
        const filePath = path.join(this.extensionPath, 'snippets', selectedLanguage.value);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          exportData = JSON.parse(content);
        }
      }

      fs.writeFileSync(saveUri.fsPath, JSON.stringify(exportData, null, 2));
      vscode.window.showInformationMessage(`🌈 代码片段已成功导出到: ${saveUri.fsPath}`);

    } catch (error) {
      vscode.window.showErrorMessage(`导出代码片段失败: ${error}`);
    }
  }

  /**
   * 删除代码片段
   */
  async deleteSnippet(item: SnippetItem): Promise<void> {
    if (!item.snippet) {
      return;
    }

    const confirmation = await vscode.window.showWarningMessage(
      `确定要删除代码片段 "${item.label}" 吗？此操作不可撤销。`,
      'Delete', 'Cancel'
    );

    if (confirmation !== 'Delete') {
      return;
    }

    // 找到包含此代码片段的文件
    const allFiles = [
      { name: 'snippets-js.code-snippets', lang: 'JavaScript' },
      { name: 'snippets-ts.code-snippets', lang: 'TypeScript' },
      { name: 'snippets-vue.code-snippets', lang: 'Vue' },
      { name: 'snippets-html.code-snippets', lang: 'HTML' }
    ];

    for (const file of allFiles) {
      const filePath = path.join(this.extensionPath, 'snippets', file.name);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const snippets = JSON.parse(content);
          
          if (snippets[item.label]) {
            delete snippets[item.label];
            fs.writeFileSync(filePath, JSON.stringify(snippets, null, 2));
            
            this.refresh();
            vscode.window.showInformationMessage(`🌈 代码片段 "${item.label}" 已从 ${file.lang} 中删除`);
            return;
          }
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }

    vscode.window.showErrorMessage(`未找到代码片段 "${item.label}"`);
  }
}

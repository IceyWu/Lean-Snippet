import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 代码片段操作面板WebView提供程序
 */
export class SnippetActionsProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'leanSnippetActions';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // 允许在webview中运行脚本
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理来自webview的消息
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.type) {
          case 'addSnippet':
            this.handleAddSnippet(message.data);
            break;
          case 'importSnippets':
            this.handleImportSnippets();
            break;
          case 'exportSnippets':
            this.handleExportSnippets(message.data);
            break;
          case 'quickInsert':
            this.handleQuickInsert(message.data);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private _getHtmlForWebview(_webview: vscode.Webview) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snippet Actions</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 10px;
            margin: 0;
        }
        
        .action-section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            background-color: var(--vscode-editor-background);
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-textBlockQuote-foreground);
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }
        
        .section-title::before {
            content: "🌈";
            margin-right: 8px;
        }
        
        .section-title::after {
            content: "▼";
            margin-left: auto;
            transition: transform 0.2s;
        }
        
        .section-title.collapsed::after {
            transform: rotate(-90deg);
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 4px 2px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        input, select, textarea {
            width: 100%;
            padding: 8px;
            margin: 4px 0;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            box-sizing: border-box;
        }
        
        textarea {
            min-height: 80px;
            resize: vertical;
            font-family: var(--vscode-editor-font-family);
        }
        
        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
        }
        
        .form-group {
            margin-bottom: 10px;
        }
        
        label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            color: var(--vscode-input-foreground);
        }
        
        .info-text {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        
        .collapsible-content {
            transition: max-height 0.3s ease-out;
            overflow: hidden;
        }
        
        .collapsible-content.collapsed {
            max-height: 0;
        }
    </style>
</head>
<body>
    <div class="action-section">
        <div class="section-title" onclick="toggleSection('quick-actions')">Quick Actions</div>
        <div id="quick-actions" class="collapsible-content">
            <div class="quick-actions">
                <button onclick="insertLog()">📝 Log</button>
                <button onclick="deleteAllLogs()">🗑️ Clean</button>
                <button onclick="insertChoose()">➡️ Choose</button>
                <button onclick="insertConsolePlus()">⚡ Plus</button>
            </div>
        </div>
    </div>

    <div class="action-section">
        <div class="section-title" onclick="toggleSection('add-snippet')">Add Snippet</div>
        <div id="add-snippet" class="collapsible-content collapsed">
            <div class="form-group">
                <label for="snippet-name">Name:</label>
                <input type="text" id="snippet-name" placeholder="React Component">
            </div>
            <div class="form-group">
                <label for="snippet-prefix">Prefix:</label>
                <input type="text" id="snippet-prefix" placeholder="rfc">
            </div>
            <div class="form-group">
                <label for="snippet-language">Language:</label>
                <select id="snippet-language">
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="vue">Vue</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <div class="form-group">
                <label for="snippet-description">Description:</label>
                <input type="text" id="snippet-description" placeholder="Brief description">
            </div>
            <div class="form-group">
                <label for="snippet-body">Code:</label>
                <textarea id="snippet-body" placeholder="Enter your code here..."></textarea>
                <div class="info-text">Use dollar1, dollar2, etc. for tab stops</div>
            </div>
            <button onclick="addSnippet()">➕ Add</button>
        </div>
    </div>

    <div class="action-section">
        <div class="section-title" onclick="toggleSection('import-export')">Import/Export</div>
        <div id="import-export" class="collapsible-content collapsed">
            <div class="form-group">
                <button onclick="importSnippets()">📥 Import</button>
                <div class="info-text">Import from JSON file</div>
            </div>
            <div class="form-group">
                <label for="export-language">Export:</label>
                <select id="export-language">
                    <option value="all">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="vue">Vue</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <button onclick="exportSnippets()">📤 Export</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function toggleSection(sectionId) {
            const content = document.getElementById(sectionId);
            const title = content.previousElementSibling;
            
            content.classList.toggle('collapsed');
            title.classList.toggle('collapsed');
        }

        function insertLog() {
            vscode.postMessage({
                type: 'quickInsert',
                data: { command: 'extension.insertLogStatement' }
            });
        }

        function deleteAllLogs() {
            vscode.postMessage({
                type: 'quickInsert',
                data: { command: 'extension.deleteAllLogStatements' }
            });
        }

        function insertChoose() {
            vscode.postMessage({
                type: 'quickInsert',
                data: { command: 'extension.insertLogChoose' }
            });
        }

        function insertConsolePlus() {
            vscode.postMessage({
                type: 'quickInsert',
                data: { command: 'extension.insertConsolePlus' }
            });
        }

        function addSnippet() {
            const name = document.getElementById('snippet-name').value;
            const prefix = document.getElementById('snippet-prefix').value;
            const language = document.getElementById('snippet-language').value;
            const description = document.getElementById('snippet-description').value;
            const body = document.getElementById('snippet-body').value;

            if (!name || !prefix || !body) {
                alert('Please fill in Name, Prefix and Code fields');
                return;
            }

            vscode.postMessage({
                type: 'addSnippet',
                data: { name, prefix, language, description, body }
            });

            document.getElementById('snippet-name').value = '';
            document.getElementById('snippet-prefix').value = '';
            document.getElementById('snippet-description').value = '';
            document.getElementById('snippet-body').value = '';
        }

        function importSnippets() {
            vscode.postMessage({
                type: 'importSnippets'
            });
        }

        function exportSnippets() {
            const language = document.getElementById('export-language').value;
            vscode.postMessage({
                type: 'exportSnippets',
                data: { language }
            });
        }
    </script>
</body>
</html>`;
    
    return htmlContent;
  }

  /**
   * 处理添加代码片段
   */
  private async handleAddSnippet(data: any) {
    try {
      const { name, prefix, language, description, body } = data;
      
      const snippetFiles: { [key: string]: string } = {
        'javascript': 'snippets-js.code-snippets',
        'typescript': 'snippets-ts.code-snippets',
        'vue': 'snippets-vue.code-snippets',
        'html': 'snippets-html.code-snippets'
      };

      const fileName = snippetFiles[language];
      if (!fileName) {
        vscode.window.showErrorMessage('Invalid language selected');
        return;
      }

      const snippetPath = path.join(this.context.extensionPath, 'snippets', fileName);
      
      // 读取现有代码片段
      let snippets: any = {};
      if (fs.existsSync(snippetPath)) {
        const content = fs.readFileSync(snippetPath, 'utf8');
        snippets = JSON.parse(content);
      }

      // 添加新代码片段
      const bodyArray = body.split('\n');
      snippets[name] = {
        prefix: prefix,
        body: bodyArray,
        description: description || name
      };

      // 写回文件
      fs.writeFileSync(snippetPath, JSON.stringify(snippets, null, 2), 'utf8');
      
      vscode.window.showInformationMessage(`🌈 Snippet "${name}" added successfully!`);
      
      // 刷新视图
      vscode.commands.executeCommand('leanSnippet.refreshSnippets');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add snippet: ${error}`);
    }
  }

  /**
   * 处理导入代码片段
   */
  private async handleImportSnippets() {
    try {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          'JSON files': ['json'],
          'Code Snippets': ['code-snippets']
        }
      });

      if (!fileUri || fileUri.length === 0) {
        return;
      }

      const content = fs.readFileSync(fileUri[0].fsPath, 'utf8');
      const importedSnippets = JSON.parse(content);

      // 选择目标语言
      const language = await vscode.window.showQuickPick([
        'javascript',
        'typescript',
        'vue',
        'html'
      ], {
        placeHolder: 'Select target language for imported snippets'
      });

      if (!language) {
        return;
      }

      const snippetFiles: { [key: string]: string } = {
        'javascript': 'snippets-js.code-snippets',
        'typescript': 'snippets-ts.code-snippets',
        'vue': 'snippets-vue.code-snippets',
        'html': 'snippets-html.code-snippets'
      };

      const fileName = snippetFiles[language];
      const snippetPath = path.join(this.context.extensionPath, 'snippets', fileName);
      
      // 读取现有代码片段
      let existingSnippets: any = {};
      if (fs.existsSync(snippetPath)) {
        const existingContent = fs.readFileSync(snippetPath, 'utf8');
        existingSnippets = JSON.parse(existingContent);
      }

      // 合并代码片段
      const mergedSnippets = { ...existingSnippets, ...importedSnippets };
      
      // 写回文件
      fs.writeFileSync(snippetPath, JSON.stringify(mergedSnippets, null, 2), 'utf8');
      
      const importedCount = Object.keys(importedSnippets).length;
      vscode.window.showInformationMessage(`🌈 Imported ${importedCount} snippets successfully!`);
      
      // 刷新视图
      vscode.commands.executeCommand('leanSnippet.refreshSnippets');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import snippets: ${error}`);
    }
  }

  /**
   * 处理导出代码片段
   */
  private async handleExportSnippets(data: any) {
    try {
      const { language } = data;
      
      let snippetsToExport: any = {};
      
      if (language === 'all') {
        // 导出所有语言的代码片段
        const languages = ['javascript', 'typescript', 'vue', 'html'];
        const snippetFiles: { [key: string]: string } = {
          'javascript': 'snippets-js.code-snippets',
          'typescript': 'snippets-ts.code-snippets',
          'vue': 'snippets-vue.code-snippets',
          'html': 'snippets-html.code-snippets'
        };

        for (const lang of languages) {
          const fileName = snippetFiles[lang];
          const snippetPath = path.join(this.context.extensionPath, 'snippets', fileName);
          
          if (fs.existsSync(snippetPath)) {
            const content = fs.readFileSync(snippetPath, 'utf8');
            const snippets = JSON.parse(content);
            snippetsToExport[lang] = snippets;
          }
        }
      } else {
        // 导出指定语言的代码片段
        const snippetFiles: { [key: string]: string } = {
          'javascript': 'snippets-js.code-snippets',
          'typescript': 'snippets-ts.code-snippets',
          'vue': 'snippets-vue.code-snippets',
          'html': 'snippets-html.code-snippets'
        };

        const fileName = snippetFiles[language];
        const snippetPath = path.join(this.context.extensionPath, 'snippets', fileName);
        
        if (fs.existsSync(snippetPath)) {
          const content = fs.readFileSync(snippetPath, 'utf8');
          snippetsToExport = JSON.parse(content);
        }
      }

      // 选择保存位置
      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(`lean-snippets-${language}-${new Date().getTime()}.json`),
        filters: {
          'JSON files': ['json']
        }
      });

      if (!saveUri) {
        return;
      }

      // 保存文件
      fs.writeFileSync(saveUri.fsPath, JSON.stringify(snippetsToExport, null, 2), 'utf8');
      
      vscode.window.showInformationMessage(`🌈 Snippets exported successfully to ${path.basename(saveUri.fsPath)}!`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export snippets: ${error}`);
    }
  }

  /**
   * 处理快速操作
   */
  private async handleQuickInsert(data: any) {
    try {
      await vscode.commands.executeCommand(data.command);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
    }
  }
}

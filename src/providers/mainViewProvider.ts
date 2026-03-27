import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { Logger } from "../utils/logger";

const PROFILE_PATH_REGEX = /(.*[/\\]profiles[/\\][^/\\]+)[/\\]/;
const GLOBAL_STORAGE_REGEX = /[/\\]globalStorage[/\\].*$/;

interface Keybinding {
  command: string;
  key: string;
  mac?: string;
  title: string;
  when?: string; // 快捷键触发条件
}

/**
 * 主视图WebView提供程序
 */
export class MainViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "leanSnippetMainView";

  private _view?: vscode.WebviewView;
  private readonly keybindings: Map<string, Keybinding> = new Map();

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
  ) {
    this.loadKeybindings();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    Logger.info("MainViewProvider 初始化");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, "assets"),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    Logger.debug("Webview HTML 已设置");

    // 处理来自webview的消息
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case "addSnippet":
            this.handleAddSnippet(message.data);
            break;
          case "importSnippets":
            this.handleImportSnippets();
            break;
          case "exportSnippets":
            this.handleExportSnippets(message.data);
            break;
          case "quickInsert":
            this.handleQuickInsert(message.data);
            break;
          case "updateKeybinding":
            this.handleUpdateKeybinding(message.data);
            break;
          case "resetKeybinding":
            this.handleResetKeybinding(message.data);
            break;
          case "getKeybindings":
            this.sendKeybindings();
            break;
          case "getSnippets":
            this.sendSnippets();
            break;
          case "deleteSnippet":
            this.handleDeleteSnippet(message.data);
            break;
          case "showWarning":
            vscode.window.showWarningMessage(message.data.message);
            break;
          default:
            break;
        }
      },
      undefined,
      this.context.subscriptions,
    );

    // 延迟发送数据，确保webview已加载
    setTimeout(() => {
      this.sendKeybindings();
      this.sendSnippets();
    }, 300);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const htmlPath = path.join(
      this.context.extensionPath,
      "src",
      "webview",
      "main.html",
    );
    let html = fs.readFileSync(htmlPath, "utf8");

    // 替换路径变量以支持VSCode Webview的安全策略
    const nonce = this.getNonce();

    // 添加CSP和nonce
    html = html.replace(
      '<meta charset="UTF-8">',
      `<meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">`,
    );

    // 为所有script标签添加nonce
    html = html.replace(/<script>/g, `<script nonce="${nonce}">`);

    return html;
  }

  private getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private loadKeybindings() {
    const defaultKeybindings: Keybinding[] = [
      {
        command: "extension.insertLogStatement",
        title: "插入日志语句",
        key: "Shift+Ctrl+L",
        mac: "Shift+Cmd+L",
        when: "editorTextFocus",
      },
      {
        command: "extension.deleteAllLogStatements",
        title: "删除所有日志",
        key: "Shift+Ctrl+D",
        mac: "Shift+Cmd+D",
      },
      {
        command: "extension.insertLogChoose",
        title: "选择插入内容",
        key: "Shift+Ctrl+/",
        mac: "Shift+Cmd+/",
        when: "editorTextFocus",
      },
    ];

    const config = vscode.workspace.getConfiguration();
    defaultKeybindings.forEach((kb) => {
      const userKeybinding = config.get(
        `leanSnippet.keybindings.${kb.command}`,
      );
      if (userKeybinding) {
        kb.key = userKeybinding as string;
      }
      this.keybindings.set(kb.command, kb);
    });
  }

  private sendKeybindings() {
    if (!this._view) {
      Logger.warn("Webview 未准备好，无法发送快捷键数据");
      return;
    }

    const isMac = process.platform === "darwin";
    const keybindingsList = Array.from(this.keybindings.values()).map((kb) => ({
      command: kb.command,
      title: kb.title,
      key: isMac && kb.mac ? kb.mac : kb.key,
    }));

    Logger.debug(`发送 ${keybindingsList.length} 个快捷键配置到 Webview`);

    this._view.webview.postMessage({
      type: "keybindings",
      data: keybindingsList,
    });
  }

  private async handleUpdateKeybinding(data: any) {
    const { command, keybinding } = data;
    Logger.info(`更新快捷键: ${command} => ${keybinding}`);

    try {
      // 保存到配置中（用于界面显示）
      const config = vscode.workspace.getConfiguration();
      await config.update(
        `leanSnippet.keybindings.${command}`,
        keybinding,
        vscode.ConfigurationTarget.Global,
      );

      // 更新内存中的快捷键
      const kb = this.keybindings.get(command);
      if (kb) {
        kb.key = keybinding;
        this.keybindings.set(command, kb);
      }

      // 更新VSCode的keybindings.json
      await this.updateVSCodeKeybindings(command, keybinding);

      this.sendKeybindings();

      // 提示用户需要重新加载窗口，并提供测试说明
      const result = await vscode.window.showInformationMessage(
        `快捷键已更新为 ${keybinding}！\n\n⚠️ 重要提示：\n1. 必须重新加载窗口才能生效\n2. 在代码编辑器中按快捷键（不是侧边栏）\n3. 确保没有其他扩展占用该快捷键`,
        "立即重新加载",
        "查看配置文件",
        "稍后",
      );

      if (result === "立即重新加载") {
        await vscode.commands.executeCommand("workbench.action.reloadWindow");
      } else if (result === "查看配置文件") {
        await vscode.commands.executeCommand(
          "workbench.action.openGlobalKeybindingsFile",
        );
      }

      Logger.success(`快捷键更新成功: ${command} => ${keybinding}`);
    } catch (error: any) {
      if (error?.name === "Canceled" || error?.message === "Canceled") {
        Logger.debug("快捷键更新操作被取消（窗口重载或用户取消）");
        return;
      }
      Logger.error("更新快捷键失败:", error);
      vscode.window.showErrorMessage(`更新快捷键失败: ${error}`);
    }
  }

  /**
   * 获取正确的keybindings.json路径（支持VSCode Profile）
   */
  private getKeybindingsPath(): string {
    const globalStoragePath = this.context.globalStorageUri.fsPath;

    let keybindingsPath: string;

    // 检查是否使用了profile
    if (globalStoragePath.includes("profiles")) {
      // 使用了profile，从globalStoragePath提取profile路径
      const match = globalStoragePath.match(PROFILE_PATH_REGEX);
      if (match) {
        keybindingsPath = path.join(match[1], "keybindings.json");
      } else {
        throw new Error("无法解析 profile 路径");
      }
    } else {
      // 没有使用profile，使用标准路径
      const userPath = globalStoragePath.replace(GLOBAL_STORAGE_REGEX, "");
      keybindingsPath = path.join(userPath, "keybindings.json");
    }

    return keybindingsPath;
  }

  /**
   * 检查快捷键冲突
   */
  private checkKeybindingConflicts(
    keybinding: string,
    excludeCommand?: string,
  ) {
    const conflicts: any[] = [];

    try {
      const keybindingsPath = this.getKeybindingsPath();

      // 读取现有的keybindings.json
      if (fs.existsSync(keybindingsPath)) {
        const content = fs.readFileSync(keybindingsPath, "utf8");
        const jsonContent = content
          .replace(/\/\/.*/g, "")
          .replace(/\/\*[\s\S]*?\*\//g, "");
        const keybindings = JSON.parse(jsonContent);

        // 检查冲突（排除自身和负绑定）
        for (const kb of keybindings) {
          if (
            kb.key === keybinding &&
            kb.command !== excludeCommand &&
            !kb.command.startsWith("-")
          ) {
            conflicts.push({ command: kb.command, keybinding: kb.key });
          }
        }

        Logger.debug(`检测到 ${conflicts.length} 个快捷键冲突`);
      }
    } catch (error) {
      Logger.warn("检查快捷键冲突失败:", error);
    }

    return conflicts;
  }

  /**
   * 查找所有与指定快捷键冲突的内置/扩展命令
   */
  private findConflictingDefaultCommands(
    keybinding: string,
    excludeCommand: string,
  ): string[] {
    const conflicts: string[] = [];
    const normalizedKey = keybinding.toLowerCase();

    // 检查所有已安装扩展的贡献快捷键
    for (const ext of vscode.extensions.all) {
      const contribs = ext.packageJSON?.contributes?.keybindings;
      if (!Array.isArray(contribs)) continue;
      for (const kb of contribs) {
        const extKey = (kb.key || "").toLowerCase();
        if (
          extKey === normalizedKey &&
          kb.command !== excludeCommand &&
          !kb.command.startsWith("-")
        ) {
          if (!conflicts.includes(kb.command)) {
            conflicts.push(kb.command);
          }
        }
      }
    }

    // 已知的VSCode内置默认快捷键映射
    const builtinDefaults: Record<string, string[]> = {
      "ctrl+.": ["editor.action.quickFix"],
      "ctrl+shift+l": ["editor.action.selectHighlights"],
      "ctrl+shift+d": ["workbench.view.debug"],
      "ctrl+shift+j": ["workbench.action.search.toggleQueryDetails"],
      "ctrl+shift+/": ["editor.action.blockComment"],
    };

    const builtinConflicts = builtinDefaults[normalizedKey] || [];
    for (const cmd of builtinConflicts) {
      if (cmd !== excludeCommand && !conflicts.includes(cmd)) {
        conflicts.push(cmd);
      }
    }

    if (conflicts.length > 0) {
      Logger.debug(
        `发现 ${conflicts.length} 个默认/扩展快捷键冲突: ${conflicts.join(", ")}`,
      );
    }

    return conflicts;
  }

  /**
   * 更新VSCode的keybindings.json文件
   */
  private async updateVSCodeKeybindings(command: string, keybinding: string) {
    try {
      // 格式化快捷键为VSCode标准格式 (小写)
      const formattedKeybinding = keybinding.toLowerCase();
      Logger.debug(
        `原始快捷键: ${keybinding}, 格式化后: ${formattedKeybinding}`,
      );

      // 检查快捷键冲突（排除当前命令自身）
      const conflicts = await this.checkKeybindingConflicts(
        formattedKeybinding,
        command,
      );
      if (conflicts.length > 0) {
        const conflictMsg = conflicts.map((c) => `  • ${c.command}`).join("\n");
        const result = await vscode.window.showWarningMessage(
          `快捷键 ${keybinding} 与以下命令冲突：\n${conflictMsg}\n\n是否继续？这将覆盖现有快捷键。`,
          "继续",
          "取消",
        );

        if (result !== "继续") {
          Logger.info("用户取消了快捷键更新");
          return;
        }
      }

      // 获取正确的keybindings.json文件路径（支持Profile）
      const keybindingsPath = this.getKeybindingsPath();

      Logger.debug(`keybindings.json 路径: ${keybindingsPath}`);
      Logger.debug(`文件是否存在: ${fs.existsSync(keybindingsPath)}`);

      let keybindings: any[] = [];

      // 读取现有的keybindings.json
      if (fs.existsSync(keybindingsPath)) {
        try {
          const content = fs.readFileSync(keybindingsPath, "utf8");
          // 移除注释（简单处理）
          const jsonContent = content
            .replace(/\/\/.*/g, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");
          keybindings = JSON.parse(jsonContent);
          Logger.debug(`读取到 ${keybindings.length} 个现有快捷键配置`);
        } catch (parseError) {
          Logger.warn("解析keybindings.json失败，将创建新配置:", parseError);
          keybindings = [];
        }
      } else {
        Logger.info("keybindings.json 不存在，将创建新文件");
      }

      Logger.debug("当前配置数组内容:", JSON.stringify(keybindings, null, 2));

      // 查找并更新或添加配置
      const existingIndex = keybindings.findIndex(
        (kb: any) => kb.command === command,
      );
      Logger.debug(`查找 ${command} 的索引: ${existingIndex}`);

      // 获取when条件（如果有）
      const keybindingInfo = this.keybindings.get(command);
      const newBinding: any = {
        key: formattedKeybinding,
        command,
      };

      // 如果有when条件，添加到配置中
      if (keybindingInfo?.when) {
        newBinding.when = keybindingInfo.when;
        Logger.debug(`添加 when 条件: ${keybindingInfo.when}`);
      }

      if (existingIndex >= 0) {
        Logger.debug(`更新现有配置，索引: ${existingIndex}`);
        Logger.debug(
          "原配置:",
          JSON.stringify(keybindings[existingIndex], null, 2),
        );
        keybindings[existingIndex] = newBinding;
        Logger.debug(
          "新配置:",
          JSON.stringify(keybindings[existingIndex], null, 2),
        );
      } else {
        Logger.debug("添加新配置");
        keybindings.push(newBinding);
        Logger.debug(`添加后数组长度: ${keybindings.length}`);
      }

      // 查找并添加负绑定以禁用冲突的内置/扩展快捷键
      const conflictingCommands = this.findConflictingDefaultCommands(
        formattedKeybinding,
        command,
      );
      for (const conflictCmd of conflictingCommands) {
        const negativeCommand = `-${conflictCmd}`;
        const negativeExists = keybindings.some(
          (kb: any) =>
            kb.command === negativeCommand && kb.key === formattedKeybinding,
        );
        if (!negativeExists) {
          keybindings.push({
            key: formattedKeybinding,
            command: negativeCommand,
          });
          Logger.debug(`添加负绑定: ${negativeCommand} (禁用冲突的默认快捷键)`);
        }
      }

      Logger.debug("更新后配置数组:", JSON.stringify(keybindings, null, 2));

      // 写回文件
      const newContent = JSON.stringify(keybindings, null, 2);

      Logger.debug("准备写入的配置:", JSON.stringify(newBinding, null, 2));
      Logger.debug(`总共 ${keybindings.length} 个快捷键配置`);

      // 确保目录存在
      const dir = path.dirname(keybindingsPath);
      Logger.debug(`目录路径: ${dir}, 是否存在: ${fs.existsSync(dir)}`);

      if (!fs.existsSync(dir)) {
        Logger.info(`创建目录: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }

      Logger.debug("开始写入文件...");
      fs.writeFileSync(keybindingsPath, newContent, "utf8");
      Logger.success(`成功写入keybindings.json: ${keybindingsPath}`);

      // 验证写入是否成功
      const verifyContent = fs.readFileSync(keybindingsPath, "utf8");
      Logger.debug(`写入后文件内容长度: ${verifyContent.length} 字符`);

      // 验证配置是否在文件中
      const verifyKeybindings = JSON.parse(verifyContent);
      const savedConfig = verifyKeybindings.find(
        (kb: any) => kb.command === command,
      );
      if (savedConfig) {
        Logger.success(
          "✅ 验证成功！文件中找到配置:",
          JSON.stringify(savedConfig, null, 2),
        );
      } else {
        Logger.error(`❌ 验证失败！文件中未找到 ${command} 的配置`);
      }

      // 自动打开文件让用户确认
      setTimeout(async () => {
        await vscode.commands.executeCommand(
          "workbench.action.openGlobalKeybindingsFile",
        );

        // 提供详细的说明
        const savedKeyInfo = savedConfig
          ? `\n\n已保存的配置：\n${JSON.stringify(savedConfig, null, 2)}`
          : "\n\n⚠️ 警告：在文件中未找到该配置！";

        vscode.window.showInformationMessage(
          `快捷键配置已写入！${savedKeyInfo}\n\n请检查打开的 keybindings.json 文件。`,
        );
      }, 500);
    } catch (error) {
      Logger.error("更新keybindings.json失败:", error);

      // 如果自动更新失败，提供手动方式
      const result = await vscode.window.showWarningMessage(
        "自动更新快捷键失败。是否手动配置？",
        "打开配置文件",
        "取消",
      );

      if (result === "打开配置文件") {
        await vscode.commands.executeCommand(
          "workbench.action.openGlobalKeybindingsFile",
        );

        // 复制配置到剪贴板（使用小写格式）
        const keybindingInfo = this.keybindings.get(command);
        let configText = `{ "key": "${keybinding.toLowerCase()}", "command": "${command}"`;
        if (keybindingInfo?.when) {
          configText += `, "when": "${keybindingInfo.when}"`;
        }
        configText += " }";

        await vscode.env.clipboard.writeText(configText);

        vscode.window.showInformationMessage(
          "配置已复制到剪贴板，请在打开的文件中粘贴！",
        );
      }

      throw error;
    }
  }

  private async handleResetKeybinding(data: any) {
    const { command } = data;
    Logger.info(`重置快捷键: ${command}`);

    try {
      // 从配置中删除
      const config = vscode.workspace.getConfiguration();
      await config.update(
        `leanSnippet.keybindings.${command}`,
        undefined,
        vscode.ConfigurationTarget.Global,
      );

      // 重新加载默认快捷键
      this.loadKeybindings();
      this.sendKeybindings();

      // 提示用户手动删除keybindings.json中的配置
      await vscode.commands.executeCommand(
        "workbench.action.openGlobalKeybindingsFile",
      );

      setTimeout(() => {
        vscode.window.showInformationMessage(
          `快捷键已重置！\n如需完全生效，请在打开的 keybindings.json 中删除 "${command}" 的自定义配置。`,
        );
      }, 500);

      Logger.success(`快捷键已重置: ${command}`);
    } catch (error) {
      Logger.error("重置快捷键失败:", error);
      vscode.window.showErrorMessage(`重置快捷键失败: ${error}`);
    }
  }

  private static readonly SNIPPET_FILE_MAP: { [key: string]: string } = {
    javascript: "snippets-js.code-snippets",
    typescript: "snippets-ts.code-snippets",
    vue: "snippets-vue.code-snippets",
    html: "snippets-html.code-snippets",
  };

  private getSnippetFileName(language: string): string {
    return (
      MainViewProvider.SNIPPET_FILE_MAP[language] ||
      `snippets-${language.toLowerCase()}.code-snippets`
    );
  }

  private sendSnippets() {
    if (!this._view) {
      Logger.warn("Webview 未准备好，无法发送片段数据");
      return;
    }

    const allSnippets: any[] = [];
    const snippetsDir = path.join(this.context.extensionPath, "snippets");

    if (!fs.existsSync(snippetsDir)) {
      this._view.webview.postMessage({ type: "snippets", data: [] });
      return;
    }

    const files = fs
      .readdirSync(snippetsDir)
      .filter((f: string) => f.endsWith(".code-snippets"));

    for (const fileName of files) {
      const match = fileName.match(/^snippets-(.+)\.code-snippets$/);
      const language = match ? match[1] : fileName;
      const langKey =
        Object.entries(MainViewProvider.SNIPPET_FILE_MAP).find(
          ([, v]) => v === fileName,
        )?.[0] || language;

      const snippetPath = path.join(snippetsDir, fileName);
      try {
        const content = fs.readFileSync(snippetPath, "utf8");
        const snippets = JSON.parse(content);
        for (const [name, snippet] of Object.entries<any>(snippets)) {
          allSnippets.push({
            name,
            prefix: snippet.prefix,
            description: snippet.description || "",
            language: langKey,
            bodyPreview: Array.isArray(snippet.body)
              ? snippet.body.join("\n")
              : snippet.body,
          });
        }
      } catch (error) {
        Logger.warn(`读取 ${fileName} 失败:`, error);
      }
    }

    Logger.debug(`发送 ${allSnippets.length} 个代码片段到 Webview`);
    this._view.webview.postMessage({ type: "snippets", data: allSnippets });
  }

  private async handleDeleteSnippet(data: any) {
    const { name, language } = data;
    Logger.info(`删除代码片段: ${name} (${language})`);

    const confirm = await vscode.window.showWarningMessage(
      `确定要删除片段 "${name}" 吗？`,
      { modal: true },
      "删除",
    );
    if (confirm !== "删除") {
      Logger.debug("用户取消删除");
      return;
    }

    try {
      const fileName = this.getSnippetFileName(language);
      const snippetPath = path.join(
        this.context.extensionPath,
        "snippets",
        fileName,
      );
      if (!fs.existsSync(snippetPath)) return;

      const content = fs.readFileSync(snippetPath, "utf8");
      const snippets = JSON.parse(content);

      if (snippets[name]) {
        delete snippets[name];
        fs.writeFileSync(
          snippetPath,
          JSON.stringify(snippets, null, 2),
          "utf8",
        );
        Logger.success(`代码片段 "${name}" 已删除`);
        vscode.window.showInformationMessage(`代码片段 "${name}" 已删除！`);
        this.sendSnippets();
      }
    } catch (error) {
      Logger.error("删除代码片段失败:", error);
      vscode.window.showErrorMessage(`删除代码片段失败: ${error}`);
    }
  }

  private handleAddSnippet(data: any) {
    try {
      const { name, prefix, language, description, body } = data;
      Logger.info(`添加代码片段: ${name} (${language})`);

      const lang = language.toLowerCase().trim();
      if (!lang) {
        Logger.error("语言不能为空");
        vscode.window.showErrorMessage("请输入或选择语言");
        return;
      }

      const fileName = this.getSnippetFileName(lang);
      const snippetPath = path.join(
        this.context.extensionPath,
        "snippets",
        fileName,
      );

      let snippets: any = {};
      if (fs.existsSync(snippetPath)) {
        const content = fs.readFileSync(snippetPath, "utf8");
        snippets = JSON.parse(content);
      }

      const bodyArray = body.split("\n");
      snippets[name] = {
        prefix,
        body: bodyArray,
        description: description || name,
      };

      fs.writeFileSync(snippetPath, JSON.stringify(snippets, null, 2), "utf8");
      Logger.success(`代码片段 "${name}" 添加成功`);

      vscode.window.showInformationMessage(`代码片段 "${name}" 添加成功！`);

      this.sendSnippets();
      vscode.commands.executeCommand("leanSnippet.refreshSnippets");
    } catch (error) {
      Logger.error("添加代码片段失败:", error);
      vscode.window.showErrorMessage(`添加代码片段失败: ${error}`);
    }
  }

  private async handleImportSnippets() {
    try {
      Logger.info("开始导入代码片段");

      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          "JSON files": ["json"],
          "Code Snippets": ["code-snippets"],
        },
      });

      if (!fileUri || fileUri.length === 0) {
        Logger.debug("用户取消导入");
        return;
      }

      const content = fs.readFileSync(fileUri[0].fsPath, "utf8");
      const importedSnippets = JSON.parse(content);
      Logger.debug(`读取到 ${Object.keys(importedSnippets).length} 个代码片段`);

      const language = await vscode.window.showQuickPick(
        ["javascript", "typescript", "vue", "html"],
        {
          placeHolder: "选择目标语言",
        },
      );

      if (!language) {
        Logger.debug("用户未选择目标语言");
        return;
      }

      const snippetFiles: { [key: string]: string } = {
        javascript: "snippets-js.code-snippets",
        typescript: "snippets-ts.code-snippets",
        vue: "snippets-vue.code-snippets",
        html: "snippets-html.code-snippets",
      };

      const fileName = snippetFiles[language];
      const snippetPath = path.join(
        this.context.extensionPath,
        "snippets",
        fileName,
      );

      let existingSnippets: any = {};
      if (fs.existsSync(snippetPath)) {
        const existingContent = fs.readFileSync(snippetPath, "utf8");
        existingSnippets = JSON.parse(existingContent);
      }

      const mergedSnippets = { ...existingSnippets, ...importedSnippets };

      fs.writeFileSync(
        snippetPath,
        JSON.stringify(mergedSnippets, null, 2),
        "utf8",
      );

      const importedCount = Object.keys(importedSnippets).length;
      Logger.success(`导入 ${importedCount} 个代码片段到 ${language}`);

      vscode.window.showInformationMessage(
        `导入 ${importedCount} 个代码片段成功！`,
      );

      vscode.commands.executeCommand("leanSnippet.refreshSnippets");
    } catch (error) {
      Logger.error("导入代码片段失败:", error);
      vscode.window.showErrorMessage(`导入代码片段失败: ${error}`);
    }
  }

  private async handleExportSnippets(data: any) {
    try {
      const { language } = data;
      Logger.info(`开始导出代码片段: ${language}`);

      let snippetsToExport: any = {};

      if (language === "all") {
        const languages = ["javascript", "typescript", "vue", "html"];
        const snippetFiles: { [key: string]: string } = {
          javascript: "snippets-js.code-snippets",
          typescript: "snippets-ts.code-snippets",
          vue: "snippets-vue.code-snippets",
          html: "snippets-html.code-snippets",
        };

        for (const lang of languages) {
          const fileName = snippetFiles[lang];
          const snippetPath = path.join(
            this.context.extensionPath,
            "snippets",
            fileName,
          );

          if (fs.existsSync(snippetPath)) {
            const content = fs.readFileSync(snippetPath, "utf8");
            const snippets = JSON.parse(content);
            snippetsToExport[lang] = snippets;
          }
        }
      } else {
        const snippetFiles: { [key: string]: string } = {
          javascript: "snippets-js.code-snippets",
          typescript: "snippets-ts.code-snippets",
          vue: "snippets-vue.code-snippets",
          html: "snippets-html.code-snippets",
        };

        const fileName = snippetFiles[language];
        const snippetPath = path.join(
          this.context.extensionPath,
          "snippets",
          fileName,
        );

        if (fs.existsSync(snippetPath)) {
          const content = fs.readFileSync(snippetPath, "utf8");
          snippetsToExport = JSON.parse(content);
        }
      }

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(
          `lean-snippets-${language}-${Date.now()}.json`,
        ),
        filters: {
          "JSON files": ["json"],
        },
      });

      if (!saveUri) {
        return;
      }

      fs.writeFileSync(
        saveUri.fsPath,
        JSON.stringify(snippetsToExport, null, 2),
        "utf8",
      );
      Logger.success(`导出代码片段到: ${saveUri.fsPath}`);

      vscode.window.showInformationMessage(
        `代码片段导出成功到 ${path.basename(saveUri.fsPath)}！`,
      );
    } catch (error) {
      Logger.error("导出代码片段失败:", error);
      vscode.window.showErrorMessage(`导出代码片段失败: ${error}`);
    }
  }

  private async handleQuickInsert(data: any) {
    try {
      Logger.debug(`执行快捷命令: ${data.command}`);
      await vscode.commands.executeCommand(data.command);
    } catch (error) {
      Logger.error(`执行命令失败 (${data.command}):`, error);
      vscode.window.showErrorMessage(`执行命令失败: ${error}`);
    }
  }
}

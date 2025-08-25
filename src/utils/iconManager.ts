import * as vscode from 'vscode';
import * as path from 'path';

/**
 * 图标配置管理器
 */
export class IconManager {
  private extensionPath: string;

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }

  /**
   * 获取语言图标
   */
  getLanguageIcon(language: string): vscode.Uri {
    const iconMap: { [key: string]: string } = {
      'JavaScript': 'javascript.svg',
      'TypeScript': 'typescript.svg',
      'Vue': 'vue.svg',
      'HTML': 'html.svg'
    };

    const iconFile = iconMap[language] || 'snippet.svg';
    return vscode.Uri.file(path.join(this.extensionPath, 'assets', 'icons', iconFile));
  }

  /**
   * 获取主题感知的代码片段图标
   */
  getSnippetIcon(): { light: vscode.Uri; dark: vscode.Uri } {
    return {
      light: vscode.Uri.file(path.join(this.extensionPath, 'assets', 'icons', 'snippet-light.svg')),
      dark: vscode.Uri.file(path.join(this.extensionPath, 'assets', 'icons', 'snippet-dark.svg'))
    };
  }

  /**
   * 获取操作图标
   */
  getActionIcon(action: string): vscode.Uri {
    const iconMap: { [key: string]: string } = {
      'add': 'add.svg',
      'import': 'import.svg',
      'export': 'export.svg',
      'file': 'file.svg'
    };

    const iconFile = iconMap[action] || 'snippet.svg';
    return vscode.Uri.file(path.join(this.extensionPath, 'assets', 'icons', iconFile));
  }

  /**
   * 获取VS Code内置图标（作为后备）
   */
  getThemeIcon(iconId: string, color?: vscode.ThemeColor): vscode.ThemeIcon {
    return new vscode.ThemeIcon(iconId, color);
  }
}

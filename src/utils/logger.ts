/**
 * 统一的日志工具类
 *
 * 使用示例：
 * ```typescript
 * import { Logger } from './utils/logger';
 *
 * Logger.log('普通日志');           // [Lean Snippet] 普通日志
 * Logger.info('信息');              // [Lean Snippet] 📘 信息
 * Logger.warn('警告');              // [Lean Snippet] ⚠️ 警告
 * Logger.error('错误');             // [Lean Snippet] ❌ 错误
 * Logger.debug('调试信息');         // [Lean Snippet] 🔍 调试信息
 * Logger.success('成功');           // [Lean Snippet] ✅ 成功
 * ```
 */
export class Logger {
  private static prefix = "[Lean Snippet]";

  static log(...args: any[]) {
    console.log(Logger.prefix, ...args);
  }

  static info(...args: any[]) {
    console.info(Logger.prefix, "📘", ...args);
  }

  static warn(...args: any[]) {
    console.warn(Logger.prefix, "⚠️", ...args);
  }

  static error(...args: any[]) {
    console.error(Logger.prefix, "❌", ...args);
  }

  static debug(...args: any[]) {
    console.debug(Logger.prefix, "🔍", ...args);
  }

  static success(...args: any[]) {
    console.log(Logger.prefix, "✅", ...args);
  }
}

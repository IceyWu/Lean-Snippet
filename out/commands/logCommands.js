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
exports.registerInsertLogStatement = registerInsertLogStatement;
exports.registerInsertLogChoose = registerInsertLogChoose;
exports.registerInsertConsolePlus = registerInsertConsolePlus;
exports.registerSurpriseCommand = registerSurpriseCommand;
const vscode = __importStar(require("vscode"));
const textUtils_1 = require("../utils/textUtils");
/**
 * 注册插入log语句命令
 * @param context - 扩展上下文
 */
function registerInsertLogStatement(context) {
    const insertLogStatement = vscode.commands.registerCommand('extension.insertLogStatement', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const randomEmoji = (0, textUtils_1.getRandomEmoji)();
        if (text) {
            vscode.commands
                .executeCommand('editor.action.insertLineAfter')
                .then(() => {
                const logToInsert = `console.log('${randomEmoji}-----${text}-----', ${text});`;
                (0, textUtils_1.insertText)(logToInsert);
            });
        }
        else {
            (0, textUtils_1.insertText)('console.log();');
        }
    });
    context.subscriptions.push(insertLogStatement);
}
/**
 * 注册插入选择内容命令
 * @param context - 扩展上下文
 */
function registerInsertLogChoose(context) {
    const insertLogChoose = vscode.commands.registerCommand('extension.insertLogChoose', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const randomEmoji = (0, textUtils_1.getRandomEmoji)();
        if (text) {
            vscode.commands
                .executeCommand('editor.action.insertLineAfter')
                .then(() => {
                const logToInsert = `console.log('${randomEmoji}${text}------------------------------>');`;
                (0, textUtils_1.insertText)(logToInsert);
            });
        }
        else {
            (0, textUtils_1.insertText)(`console.log('${randomEmoji}------------------------------>');`);
        }
    });
    context.subscriptions.push(insertLogChoose);
}
/**
 * 注册consolePlus命令
 * @param context - 扩展上下文
 */
function registerInsertConsolePlus(context) {
    const insertConsolePlus = vscode.commands.registerCommand('extension.insertConsolePlus', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text) {
            vscode.commands
                .executeCommand('editor.action.insertLineAfter')
                .then(() => {
                const logToInsert = `consolePlus.log('${text}', ${text});`;
                (0, textUtils_1.insertText)(logToInsert);
            });
        }
        else {
            (0, textUtils_1.insertText)('consolePlus.log();');
        }
    });
    context.subscriptions.push(insertConsolePlus);
}
/**
 * 注册惊喜命令
 * @param context - 扩展上下文
 */
function registerSurpriseCommand(context) {
    const surprise = vscode.commands.registerCommand('extension.surprise', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const content = `// 🌈thanks for AnNan!! 🎇🎇🎇🎇🎇🎇`;
        (0, textUtils_1.insertText)(content);
    });
    context.subscriptions.push(surprise);
}
//# sourceMappingURL=logCommands.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
let translationObj;
function getTranslationFile() {
    var _a;
    (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.forEach(folder => {
        fs.readdir(folder.uri.fsPath + '/src', (err, files) => {
            if (files.includes("translations.json")) {
                let json = require(folder.uri.fsPath + "/src/translations.json");
                translationObj = json['en'];
            }
        });
    });
}
function activate(context) {
    getTranslationFile();
    const provider1 = vscode.languages.registerCompletionItemProvider('svelte', {
        provideCompletionItems(document, position, token, context) {
            const snippetCompletion = new vscode.CompletionItem('$t');
            snippetCompletion.insertText = new vscode.SnippetString('{\\$t("${1:}")}');
            snippetCompletion.documentation = new vscode.MarkdownString("svelte i18n");
            snippetCompletion.commitCharacters = ['t'];
            snippetCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
            return [
                snippetCompletion,
            ];
        }
    });
    const provider2 = vscode.languages.registerCompletionItemProvider('svelte', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (linePrefix.endsWith('{$t("')) {
                return Object.keys(translationObj).map((value) => {
                    return new vscode.CompletionItem(value, vscode.CompletionItemKind.Property);
                });
            }
            if (linePrefix.includes('{$t("') && linePrefix.endsWith('.')) {
                let objId = { ...translationObj };
                let objPath = linePrefix.split('"')[1];
                objPath.split('.').forEach(idPart => {
                    if (idPart) {
                        objId = objId[idPart];
                    }
                });
                if (typeof objId === 'object') {
                    return Object.keys(objId).map((value) => {
                        return new vscode.CompletionItem(value, vscode.CompletionItemKind.Property);
                    });
                }
            }
            return undefined;
        }
    }, '.' // triggered whenever a '.' is being typed
    );
    context.subscriptions.push(provider1, provider2);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
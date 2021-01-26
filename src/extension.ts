import * as vscode from 'vscode';
import * as fs from 'fs';

let translationObj: any;

function getTranslationFile(){
	vscode.workspace.workspaceFolders?.forEach(folder => {
		fs.readdir(folder.uri.fsPath+'/src', (err, files)=>{
			if (files.includes("translations.json")) {
				let json = require(folder.uri.fsPath + "/src/translations.json")
				translationObj = json['en']
			}
		})
	});
}

export function activate(context: vscode.ExtensionContext) {
	
	getTranslationFile()

	const provider1 = vscode.languages.registerCompletionItemProvider('svelte', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

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

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'svelte',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (linePrefix.endsWith('{$t("')) {
					return Object.keys(translationObj).map((value)=>{
						return new vscode.CompletionItem(value, vscode.CompletionItemKind.Property)
					});
				}
				if (linePrefix.includes('{$t("') && linePrefix.endsWith('.')) {
					let objId = {...translationObj}
					let objPath = linePrefix.split('"')[1]
					objPath.split('.').forEach(idPart => {
						if (idPart) {
							objId = objId[idPart]
						}
					});
					if (typeof objId === 'object') {
						return Object.keys(objId).map((value)=>{
							return new vscode.CompletionItem(value, vscode.CompletionItemKind.Property)
						});
					}
				}
				return undefined;
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
	context.subscriptions.push(provider1, provider2);
}

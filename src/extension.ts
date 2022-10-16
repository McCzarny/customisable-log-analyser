// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { IssueView, IssueManager } from './issueView';
import * as logAnalyser from './logAnalyser';
import * as highlightManager from './highlightManager';


const issueManager = new IssueManager();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "Flexible Log Analyzer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fllogan.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Flexible Log Analyzer!');
	});

	const fllogan = new IssueView(context);

	context.subscriptions.push(disposable);

	let runscriptsWithCurrent = vscode.commands.registerCommand('fllogan.runscripts.current', () => {
		issueManager.showStatus("Checking the current file...");
		logAnalyser.runWithTheCurrentFile(issueManager).then(() => {
			highlightManager.updateDecorations(issueManager.getRootNodes());
			issueManager.hideStatus();
		});
	});
	context.subscriptions.push(runscriptsWithCurrent);
	let runscriptsWithWorkspace = vscode.commands.registerCommand('fllogan.runscripts.workspace', () => {
		issueManager.showStatus("Checking the workspace...");
		logAnalyser.runWithWorkspace(issueManager).then(() => {
			highlightManager.updateDecorations(issueManager.getRootNodes());
			issueManager.hideStatus();
		});
	});
	context.subscriptions.push(runscriptsWithWorkspace);

	
	let clearIssues = vscode.commands.registerCommand('fllogan.clear', () => {
		issueManager.clearIssues();
	});

	context.subscriptions.push(clearIssues);

	activateDecorators(context);
}

function activateDecorators(context: vscode.ExtensionContext) {
	if (vscode.window.activeTextEditor) {
		highlightManager.updateDecorations(issueManager.getRootNodes());
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			highlightManager.updateDecorations(issueManager.getRootNodes());
		}
	}, null, context.subscriptions);

// 	vscode.workspace.onDidChangeTextDocument(event => {
		
// 	}, null, context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {}

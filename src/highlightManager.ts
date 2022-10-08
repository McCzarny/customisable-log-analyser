import * as vscode from 'vscode';
import { TreeNode } from './treeNode';
import path = require('path');



const infoDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: '#B0D6DD',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    light: {
        // this color will be used in light color themes
        borderColor: '#779EA5'
    },
    dark: {
        // this color will be used in dark color themes
        borderColor: '#B0D6DD'
    }
});

const warningDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'yellow',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    backgroundColor: '#AAAA0022',
    light: {
        // this color will be used in light color themes
        borderColor: '#8B8000'
    },
    dark: {
        // this color will be used in dark color themes
        borderColor: '#F4CE50'
    }
});

const errorDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'red',
    overviewRulerLane: vscode.OverviewRulerLane.Left,
    backgroundColor: '#AA000022',
    light: {
        // this color will be used in light color themes
        borderColor: '#641808'
    },
    dark: {
        // this color will be used in dark color themes
        borderColor: '#E26B52'
    }
});

function getFileReferences(entry: TreeNode, file: string): TreeNode[] {
    let results: TreeNode[] = [];
    const resolvedPath = path.resolve(file);

    if ("fileReference" in entry) {
        entry.fileReference.forEach(fileReference => {
            const resolvedReferencePath = path.resolve(fileReference.filePath);
          
            console.debug("fileReference: " + resolvedReferencePath + " vs " + resolvedPath);
            if (resolvedPath.toLocaleLowerCase() === resolvedReferencePath.toLocaleLowerCase()) { // TODO: Do on windows only
                results.push(fileReference);
            } 
        });
    }

    return results;
}

export function updateDecorations(nodes: TreeNode[]) {
    console.debug("Updating decorations");
    let activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        return;
    }
    console.debug("There is an active editor");

    const currentFilePath = activeEditor.document.fileName;
    const infoDecorations: vscode.DecorationOptions[] = [];
    const warningDecorations: vscode.DecorationOptions[] = [];
    const errorDecorations: vscode.DecorationOptions[] = [];

    nodes.forEach(node => {
        console.debug("node");

        if ("entries" in node) {
            node.entries.forEach(entry => {
                console.debug("entry");

                getFileReferences(entry, currentFilePath).forEach(fileReference => {
                    console.debug("fileReference");

                    if ("line" in fileReference) {
                        const decoration = { 
                            range: new vscode.Range(fileReference.line, 0, fileReference.line, Number.MAX_VALUE), 
                            hoverMessage: new vscode.MarkdownString(`### ${entry.title}` + (entry.description ? "\n" + entry.description : ""))
                        };
                        switch(node.name) {
                            case 'warning':
                                warningDecorations.push(decoration); break;
                            case 'error':
                                errorDecorations.push(decoration); break;
                            default:
                                infoDecorations.push(decoration); break;
                        }
                        
                    }
                });
            });
        }
    });

    activeEditor.setDecorations(infoDecorationType, infoDecorations);
    activeEditor.setDecorations(warningDecorationType, warningDecorations);
    activeEditor.setDecorations(errorDecorationType, errorDecorations);
}
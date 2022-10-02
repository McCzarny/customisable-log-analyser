import * as vscode from 'vscode';

interface FileReference {
  uri: string[]
  filePath: string
  line: number
}

interface Entry {
  uri: string[]
  title: string
  description: string
  fileReference: FileReference[]
}

interface EntryGroup {
  name: string
  icon: string
  uri: string[]
  entries: Entry[]
}

export type TreeNode = Entry | EntryGroup | FileReference;

export function isLeafNode(element: TreeNode): boolean {
  return !('filePath' in element);
}

export function getLabel(element: TreeNode): string {
  if ('name' in element) {
    return element.name;
  }

  if ('title' in element) {
    return element.title;
  }

  if ('filePath' in element) {
    return element.filePath;
  }

  return '<Unknown>';
}

export function getTooltip(element: TreeNode): string | undefined {
  if ('description' in element) {
    return element.description;
  }

  return undefined;
}

export function getIcon(element: TreeNode): string {
  if ('icon' in element) {
    return element.icon;
  }

  return '';
}

export function getAction(element: TreeNode): vscode.Command | undefined {
  if ('filePath' in element && 'line' in element) {
    console.debug(vscode.Uri.file(element.filePath));
    return {
      title: 'Go to log entry',
      command: 'vscode.open',
      arguments: [
        vscode.Uri.file(element.filePath),
        <vscode.TextDocumentShowOptions>{
          selection: new vscode.Range(element.line - 1, 0, element.line - 1, 0),
        },
      ],
    };
  }

  return undefined;
}

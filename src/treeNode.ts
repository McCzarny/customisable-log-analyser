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

export function createLevel(name: string) : TreeNode {
     let level = {name: name, icon: '' ,uri: [name], entries: []} as EntryGroup;
     console.debug("Created level: " + JSON.stringify(level, null, 4));
     return level;
}

export function createEntry(parent: TreeNode, title: string, description: string, fileReference: string) : TreeNode {
    const uri: string[] = [...parent.uri, title];
    const fileReferenceEntry = {uri: [...uri, fileReference], filePath: fileReference, line: 5} as FileReference;

    const entry = {uri: uri, title: title, description: description, fileReference: [fileReferenceEntry]} as Entry;

    if ("entries" in parent) {
        console.debug("Adding: " + entry + " to " + parent);
        parent.entries.push(entry);
    } else {
        console.debug("There is no entries in " + JSON.stringify(parent, null, 4));
    }

    return entry;
}

export function getOrAddEntry(parent: TreeNode, title: string, description: string, fileReference: string) : TreeNode {
    if("entries" in parent) {
        for (const node of parent.entries) {
            if ('title' in node && node.title === title) {
                return node;
            }
        }
    }

    return createEntry(parent, title, description, fileReference);
}

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

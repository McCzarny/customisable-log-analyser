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
  icon?: string
  uri: string[]
  entries: Entry[]
}

class Status {
  constructor(status: string) {
    this.name = status;
  }

  uri: string[] = ["status"];
  name: string = "Status";
}

export type TreeNode = Entry | EntryGroup | FileReference | Status;

export function createLevel(name: string) : TreeNode {
    let icon = null;

    switch(name) {
      case 'info':
        icon = 'extensions-info-message'; break;
      case 'warning':
        icon = 'extensions-warning-message'; break;
      case 'error':
        icon = 'error'; break;
    }
     let level = {name: name, icon: icon ,uri: [name], entries: []} as EntryGroup;
     console.debug("Created level: " + JSON.stringify(level, null, 4));
     return level;
}

function createFileReference(parentUri: string[], fileReference: string) : FileReference {
    let fileNumber = 0;
    let numberReferencePattern = /(.*):(\d+)$/g;
    const matches = fileReference.matchAll(numberReferencePattern).next();
    if (!matches.done) {
        fileReference = matches.value[1];
        fileNumber = parseInt(matches.value[2]);
    }

    return {uri: [...parentUri, fileReference, fileNumber], filePath: fileReference, line: Math.max(fileNumber - 1 , 0)} as FileReference;
}

export function createEntry(parent: TreeNode, title: string, description: string, fileReference: string) : TreeNode {
    const uri: string[] = [...parent.uri, title];
    const fileReferenceEntry = createFileReference(uri, fileReference);

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
                const fileReferenceEntry = createFileReference(node.uri, fileReference);
                node.fileReference.push(fileReferenceEntry);

                return node;
            }
        }
    }

    return createEntry(parent, title, description, fileReference);
}

export function isLeafNode(element: TreeNode): boolean {
  return !('filePath' in element) && element.uri[0] !== "status";
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

export function getIcon(element: TreeNode): string | undefined {
  if ('icon' in element) {
    return element.icon;
  }

  return undefined;
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
          selection: new vscode.Range(element.line, 0, element.line, 0),
        },
      ],
    };
  }

  return undefined;
}

export function getStatus(status: string): TreeNode {
  return new Status(status);
}
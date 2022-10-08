import * as vscode from 'vscode';
import path = require('path');
import cp = require('child_process');
import { IssueManager } from './issueView';

function getRootDir(): string | undefined {
  let analysersDirectory = vscode.workspace
    .getConfiguration('customisable-log-analyser')
    .get<string>('scripsDirectory');
  console.debug(analysersDirectory);

  if (!analysersDirectory) {
    console.debug('Not able to get scripsDirectory.');
    return undefined;
  }

  if (
    !path.isAbsolute(analysersDirectory) &&
    vscode.workspace.workspaceFolders
  ) {
    analysersDirectory = path.join(
      vscode.workspace.workspaceFolders[0].uri.fsPath,
      analysersDirectory,
    );
  }
  console.debug(analysersDirectory);

  return analysersDirectory;
}

export async function listAnalysers() {
  const analysersDirectory = getRootDir();
  if (analysersDirectory) {
    for (const [name, type] of await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(analysersDirectory),
    )) {
      if (type === vscode.FileType.File) {
        console.debug(name);
      }
    }
  }
}

function processIssues(issueManager: IssueManager, issues: any[]) {
    issues.forEach(issue => {
        const description = "description" in issue ? issue.description : undefined;

        if ("level" in issue && "title" in issue && "fileReference" in issue) {
            issueManager.addIssue(issue.level, issue.title, issue.description, issue.fileReference);
        }
    });
}

export async function runWithTheCurrentFile(issueManager : IssueManager) {
  const analysersDirectory = getRootDir();
  if (analysersDirectory) {
    for (const [name, type] of await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(analysersDirectory),
    )) {
      if (type === vscode.FileType.File) {
        console.debug(name);
        const fileUri =
          vscode.window.activeTextEditor?.document.uri.fsPath || 'None';
        cp.exec(
          `python ${name} ${fileUri}`,
          {
            cwd: analysersDirectory,
          },
          function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            const obj = JSON.parse(stdout);

            if ("issues" in obj) {
                processIssues(issueManager, obj.issues);
            }

            if (error !== null) {
              console.log('exec error: ' + error);
            }
          },
        );
      }
    }
  }
}

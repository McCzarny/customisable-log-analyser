import * as vscode from 'vscode'
import path = require('path')
import cp = require('child_process')
import { IssueManager } from './issueView'
import { promises } from 'stream'

function getRootDir(): string | undefined {
  let analysersDirectory = vscode.workspace
    .getConfiguration('customisable-log-analyser')
    .get<string>('scripsDirectory')
  console.debug(analysersDirectory)

  if (!analysersDirectory) {
    console.debug('Not able to get scripsDirectory.')
    return undefined
  }

  if (
    !path.isAbsolute(analysersDirectory) &&
    vscode.workspace.workspaceFolders
  ) {
    analysersDirectory = path.join(
      vscode.workspace.workspaceFolders[0].uri.fsPath,
      analysersDirectory,
    )
  }
  console.debug(analysersDirectory)

  return analysersDirectory
}

export async function listAnalysers() {
  const analysersDirectory = getRootDir()
  if (analysersDirectory) {
    for (const [name, type] of await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(analysersDirectory),
    )) {
      if (type === vscode.FileType.File) {
        console.debug(name)
      }
    }
  }
}

function processIssues(issueManager: IssueManager, issues: any[]) {
  issues.forEach((issue) => {
    const description = 'description' in issue ? issue.description : undefined;

    if ('level' in issue && 'title' in issue && 'fileReference' in issue) {
      issueManager.addIssue(
        issue.level,
        issue.title,
        description,
        issue.fileReference,
      )
    }
  })
}

function execAnalysis(name: string, fileUri: string, analysersDirectory: string, issueManager: IssueManager) : Promise<void> {
  console.debug(name)
  const cmder = async () => {
    return new Promise<void>((resolve, reject) => {
   cp.exec(
    `python ${name} ${fileUri}`,
    {
      cwd: analysersDirectory,
    },
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout)
      console.log('stderr: ' + stderr)
      const obj = JSON.parse(stdout)

      if ('issues' in obj) {
        processIssues(issueManager, obj.issues)
      }

      if (error !== null) {
        console.log('exec error: ' + error)
        reject(error);
        return;
      }
      resolve();
    },
  )})};

  return cmder();
}

export async function runWithTheCurrentFile(issueManager: IssueManager) {
  console.debug("runWithTheCurrentFile");
  const analysersDirectory = getRootDir();
  const fileUri = vscode.window.activeTextEditor?.document.uri.fsPath;
  if (analysersDirectory && fileUri) {
    let promises : Promise<void>[] = [];
    for (const [name, type] of await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(analysersDirectory),
    )) {
      console.debug(name);
      if (type === vscode.FileType.File) {
        promises.push(execAnalysis(name, fileUri, analysersDirectory, issueManager));
      }
    }
    console.debug("waiting for all promises...");
    await Promise.all(promises);
  }
  console.debug("runWithTheCurrentFile done");
}

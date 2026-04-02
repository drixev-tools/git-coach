import * as vscode from 'vscode';

export const tipContentMap = new Map<string, string>();

export const tipContentProvider = new (class
  implements vscode.TextDocumentContentProvider
{
  provideTextDocumentContent(uri: vscode.Uri): string {
    return tipContentMap.get(uri.path) ?? "";
  }
})();
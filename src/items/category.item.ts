import * as vscode from "vscode";

export class CategoryItem<T = vscode.TreeItem> extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly children: T[],
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
  ) {
    super(label, collapsibleState);
    this.contextValue = "categoryItem";
  }

  iconPath = new vscode.ThemeIcon("folder");
}

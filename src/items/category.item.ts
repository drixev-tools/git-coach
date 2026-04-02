import * as vscode from "vscode";
import { GitTip } from "./tip.item";

export class CategoryItem extends vscode.TreeItem {
  constructor(
    public readonly category: string,
    public readonly tips: GitTip[],
  ) {
    super(category, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = "tipCategory";
  }

  iconPath = new vscode.ThemeIcon("folder");
}

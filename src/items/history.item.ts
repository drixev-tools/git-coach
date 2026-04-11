import * as vscode from "vscode";
import { GitCommand } from "../commands/gitExecutor";

export class HistoryItem extends vscode.TreeItem {
  public readonly gitCommand: GitCommand;

  constructor(
    gitCommand: GitCommand,
    public readonly index: number,
  ) {
    super(gitCommand.command, vscode.TreeItemCollapsibleState.None);
    this.gitCommand = gitCommand;
    this.tooltip = gitCommand.description;
    this.description = gitCommand.description;
    this.contextValue = "historyItem";
    this.command = {
      title: gitCommand.command,
      command: "gitWorkflow.copyCommand",
      arguments: [this],
    };
  }

  iconPath = new vscode.ThemeIcon("history");
}

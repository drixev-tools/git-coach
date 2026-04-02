import * as vscode from "vscode";
import { GitCommand } from "../gitCommandExecutor";
import { HistoryItem } from "../items/history.item";
import i18next from "i18next";

export class CommandHistoryProvider implements vscode.TreeDataProvider<HistoryItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    HistoryItem | undefined | null | void
  > = new vscode.EventEmitter<HistoryItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    HistoryItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    vscode.commands.registerCommand("gitWorkflow.refreshHistory", () => {
      this.refresh();
    });

    vscode.commands.registerCommand(
      "gitWorkflow.copyCommand",
      (item: HistoryItem) => {
        if (item.gitCommand) {
          vscode.env.clipboard.writeText(item.gitCommand.command);
          vscode.window.showInformationMessage(
            `${i18next.t("messages.copied")}: ${item.gitCommand.command}`,
          );
        }
      },
    );

    vscode.commands.registerCommand("gitWorkflow.clearHistory", async () => {
      const confirm = await vscode.window.showWarningMessage(
        i18next.t("messages.clearAllhistory"),
        i18next.t("messages.clear"),
        i18next.t("messages.cancel"),
      );

      if (confirm === i18next.t("messages.clear")) {
        this.context.globalState.update("commandHistory", []);
        this.refresh();
        vscode.window.showInformationMessage(
          i18next.t("messages.clearedHistory"),
        );
      }
    });

    vscode.commands.registerCommand(
      "gitWorkflow.explainCommand",
      (item: HistoryItem) => {
        const cmd = item.gitCommand;
        let message = `${i18next.t("messages.command")}: ${cmd.command}\n\n${i18next.t("messages.description")}: ${cmd.description}`;

        if (cmd.explanation) {
          message += `\n\nExplanation:\n${cmd.explanation}`;
        }

        const buttons = cmd.documentationUrl
          ? [
              i18next.t("messages.openDocumentation"),
              i18next.t("messages.copyCommand"),
              i18next.t("messages.close"),
            ]
          : [i18next.t("messages.copyCommand"), i18next.t("messages.close")];

        vscode.window
          .showInformationMessage(message, ...buttons)
          .then((selection) => {
            if (
              selection === i18next.t("messages.openDocumentation") &&
              cmd.documentationUrl
            ) {
              vscode.env.openExternal(vscode.Uri.parse(cmd.documentationUrl));
            } else if (selection === i18next.t("messages.copyCommand")) {
              vscode.env.clipboard.writeText(cmd.command);
              vscode.window.showInformationMessage(`${i18next.t("messages.copied")}: ${cmd.command}`);
            }
          });
      },
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HistoryItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: HistoryItem): Thenable<HistoryItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const history = this.context.globalState.get<GitCommand[]>(
      "commandHistory",
      [],
    );

    if (history.length === 0) {
      return Promise.resolve([]);
    }

    const items = history.map((cmd, index) => new HistoryItem(cmd, index));
    return Promise.resolve(items);
  }

  async showHistoryQuickPick() {
    const history = this.context.globalState.get<GitCommand[]>(
      "commandHistory",
      [],
    );

    if (history.length === 0) {
      vscode.window.showInformationMessage("No command history available");
      return;
    }

    const items = history.map((cmd, index) => ({
      label: cmd.command,
      description: cmd.description,
      detail: `Command #${index + 1}`,
      command: cmd,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a command to copy",
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (selected) {
      const action = await vscode.window.showQuickPick(
        [
          { label: "Copy Command", value: "copy" },
          { label: "Show Details", value: "details" },
        ],
        {
          placeHolder: "What would you like to do?",
        },
      );

      if (action?.value === "copy") {
        vscode.env.clipboard.writeText(selected.command.command);
        vscode.window.showInformationMessage(
          `Copied: ${selected.command.command}`,
        );
      } else if (action?.value === "details") {
        vscode.window.showInformationMessage(selected.command.command, {
          modal: true,
          detail: selected.description,
        });
      }
    }
  }
}

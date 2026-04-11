import * as vscode from "vscode";
import {
  WorkflowTreeProvider,
  WorkflowItem,
} from "./providers/workflowTree.provider";
import { CommandHistoryProvider } from "./providers/commandHistory.provider";
import { GitCommandExecutor } from "./commands/gitExecutor";
import { GitValidator } from "./utils/gitValidator";
import { GitTipsProvider } from "./providers/gitTips.provider";
import { TipItem } from "./items/tip.item";
import {
  tipContentMap,
  tipContentProvider,
} from "./providers/tipContent.provider";
import i18next from "i18next";
import { initI18n } from "./utils/i18n";
import executeWorkflow from "./workflows/executeWorkflow";
import {
  CommandSubscription,
  ViewCommandSubscription,
} from "./items/commandSubscription.item";
import registerGitCommands from "./commands/register";
import registerViewCommands from "./views/register";

export async function activate(context: vscode.ExtensionContext) {
  const language = vscode.env.language;
  await initI18n(language);

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      "git-tip",
      tipContentProvider,
    ),
  );
  try {
    await GitValidator.checkGitInstalled();
  } catch (error: any) {
    vscode.window
      .showWarningMessage(`Git Coach: ${error.message}`, "Learn more")
      .then((selection) => {
        if (selection === "Learn more") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://git-scm.com/downloads"),
          );
        }
      });
  }

  const commandExecutor = new GitCommandExecutor(context);
  const workflowTreeProvider = new WorkflowTreeProvider();
  const historyProvider = new CommandHistoryProvider(context);
  const tipsProvider = new GitTipsProvider();

  vscode.window.registerTreeDataProvider(
    "gitWorkflowExplorer",
    workflowTreeProvider,
  );
  vscode.window.registerTreeDataProvider("gitCommandHistory", historyProvider);

  vscode.window.registerTreeDataProvider("gitTipsExplorer", tipsProvider);

  const viewSubscriptions: ViewCommandSubscription[] = [
    {
      command: "gitWorkflow.showWorkflows",
      callback: () => {
        vscode.window
          .showQuickPick(
            [
              {
                label: i18next.t("gitWorkflow.showWorkflows.feature.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.feature.description",
                ),
                workflow: "feature",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.commit.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.commit.description",
                ),
                workflow: "commit",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.commitPush.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.commitPush.description",
                ),
                workflow: "commitPush",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.pullRebase.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.pullRebase.description",
                ),
                workflow: "pullRebase",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.merge.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.merge.description",
                ),
                workflow: "merge",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.stashOnly.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.stashOnly.description",
                ),
                workflow: "stashOnly",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.stash.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.stash.description",
                ),
                workflow: "stash",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.hotfix.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.hotfix.description",
                ),
                workflow: "hotfix",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.release.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.release.description",
                ),
                workflow: "release",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.undo.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.undo.description",
                ),
                workflow: "undo",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.cherryPick.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.cherryPick.description",
                ),
                workflow: "cherryPick",
              },
              {
                label: i18next.t("gitWorkflow.showWorkflows.revert.label"),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.revert.description",
                ),
                workflow: "revert",
              },
              {
                label: i18next.t(
                  "gitWorkflow.showWorkflows.interactiveRebase.label",
                ),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.interactiveRebase.description",
                ),
                workflow: "interactiveRebase",
              },
              {
                label: i18next.t(
                  "gitWorkflow.showWorkflows.createSwitchBranch.label",
                ),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.createSwitchBranch.description",
                ),
                workflow: "createSwitchBranch",
              },
              {
                label: i18next.t(
                  "gitWorkflow.showWorkflows.switchBranch.label",
                ),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.switchBranch.description",
                ),
                workflow: "switchBranch",
              },
              {
                label: i18next.t(
                  "gitWorkflow.showWorkflows.syncFromBranch.label",
                ),
                description: i18next.t(
                  "gitWorkflow.showWorkflows.syncFromBranch.description",
                ),
                workflow: "syncFromBranch",
              },
            ],
            {
              placeHolder: i18next.t("gitWorkflow.showWorkflows.placeholder"),
            },
          )
          .then((selection) => {
            if (selection) {
              executeWorkflow(selection.workflow, commandExecutor);
            }
          });
      },
    },
    {
      command: "gitWorkflow.showHistory",
      callback: () => {
        historyProvider.showHistoryQuickPick();
      },
    },
    {
      command: "gitWorkflow.showTips",
      callback: () => {
        vscode.commands.executeCommand(
          "git-workflow-assistant.gitTipsExplorer.focus",
        );
      },
    },
  ];

  registerViewCommands(context, viewSubscriptions);

  const subscriptions: CommandSubscription[] = [
    {
      command: "gitWorkflow.featureBranch",
      workflowType: "feature",
    },
    {
      command: "gitWorkflow.hotfix",
      workflowType: "hotfix",
    },
    {
      command: "gitWorkflow.release",
      workflowType: "release",
    },
    {
      command: "gitWorkflow.commit",
      workflowType: "commit",
    },
    {
      command: "gitWorkflow.commitAndPush",
      workflowType: "commitPush",
    },
    {
      command: "gitWorkflow.stashAndSwitch",
      workflowType: "stash",
    },
    {
      command: "gitWorkflow.mergeBranch",
      workflowType: "merge",
    },
    {
      command: "gitWorkflow.undoCommit",
      workflowType: "undo",
    },
    {
      command: "gitWorkflow.cherryPick",
      workflowType: "cherryPick",
    },
    {
      command: "gitWorkflow.revert",
      workflowType: "revert",
    },
    {
      command: "gitWorkflow.interactiveRebase",
      workflowType: "interactiveRebase",
    },
    {
      command: "gitWorkflow.createSwitchBranch",
      workflowType: "createSwitchBranch",
    },
    {
      command: "gitWorkflow.switchBranch",
      workflowType: "switchBranch",
    },
    {
      command: "gitWorkflow.syncFromBranch",
      workflowType: "syncFromBranch",
    },
    {
      command: "gitWorkflow.init",
      workflowType: "init",
    },
    {
      command: "gitWorkflow.clone",
      workflowType: "clone",
    },
    {
      command: "gitWorkflow.updateRemote",
      workflowType: "updateRemote",
    },
    {
      command: "gitWorkflow.amendLastCommit",
      workflowType: "amendLastCommit",
    },
    {
      command: "gitWorkflow.applyStash",
      workflowType: "applyStash",
    },
    {
      command: "gitWorkflow.popStash",
      workflowType: "popStash",
    },
    {
      command: "gitWorkflow.createAndPushTag",
      workflowType: "createAndPushTag",
    },
    {
      command: "gitWorkflow.deleteTag",
      workflowType: "deleteTag",
    },
  ];

  registerGitCommands(context, commandExecutor, subscriptions);

  const menuSubscriptions: ViewCommandSubscription[] = [
    {
      command: "gitWorkflow.showTipDetails",
      callback: (item: TipItem) => {
        const config = vscode.workspace.getConfiguration("gitWorkflow");
        const showTips = config.get<boolean>("showTips", true);
        if (!showTips) {
          vscode.window.showInformationMessage(
            i18next.t("showTipDetails.tipsDisabled"),
          );
          return;
        }

        const tip = item.tip;
        let content = `${tip.title}\n${"─".repeat(tip.title.length)}\n\n${tip.details}`;
        if (tip.documentationUrl) {
          content += `\n\n ${i18next.t("showTipDetails.documentation")}: ${tip.documentationUrl}`;
        }

        const key = tip.title.replace(/\s+/g, "-");
        tipContentMap.set(key, content);
        const uri = vscode.Uri.parse(`git-tip:${key}`);
        vscode.workspace.openTextDocument(uri).then((doc) =>
          vscode.window.showTextDocument(doc, {
            preview: true,
            preserveFocus: false,
          }),
        );
      },
    },
    {
      command: "gitWorkflow.showDocumentation",
      callback: (item: WorkflowItem) => {
        const config = vscode.workspace.getConfiguration("gitWorkflow");
        const baseUrl = config.get<string>(
          "gitDocumentationBaseUrl",
          "https://git-scm.com/docs",
        );

        const docMap: { [key: string]: string } = {
          feature: `${baseUrl}/git-checkout`,
          commit: `${baseUrl}/git-commit`,
          commitPush: `${baseUrl}/git-commit`,
          pullRebase: `${baseUrl}/git-rebase`,
          merge: `${baseUrl}/git-merge`,
          stashOnly: `${baseUrl}/git-stash`,
          stash: `${baseUrl}/git-stash`,
          hotfix: `${baseUrl}/git-checkout`,
          release: `${baseUrl}/git-tag`,
          undo: `${baseUrl}/git-reset`,
          cherryPick: `${baseUrl}/git-cherry-pick`,
          revert: `${baseUrl}/git-revert`,
          interactiveRebase: `${baseUrl}/git-rebase`,
          createSwitchBranch: `${baseUrl}/git-checkout`,
          switchBranch: `${baseUrl}/git-checkout`,
        };

        const url = docMap[item.workflowType] || baseUrl;
        vscode.env.openExternal(vscode.Uri.parse(url));
      },
    },
    {
      command: "gitWorkflow.executeWorkflow",
      callback: (item: WorkflowItem) => {
        executeWorkflow(item.workflowType, commandExecutor);
      },
    },
  ];

  registerViewCommands(context, menuSubscriptions);
}

export function deactivate() {}

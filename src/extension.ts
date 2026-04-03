import * as vscode from "vscode";
import {
  WorkflowTreeProvider,
  WorkflowItem,
} from "./providers/workflowTree.provider";
import { CommandHistoryProvider } from "./providers/commandHistory.provider";
import { GitCommandExecutor } from "./gitCommandExecutor";
import { GitValidator } from "./utils/gitValidator";
import { GitTipsProvider } from "./providers/gitTips.provider";
import { TipItem } from "./items/tip.item";
import {
  executeCherryPickWorkflow,
  executeCommitPushWorkflow,
  executeCreateSwitchBranchWorkflow,
  executeFeatureBranchWorkflow,
  executeHotfixWorkflow,
  executeInteractiveRebaseWorkflow,
  executeMergeWorkflow,
  executePullRebaseWorkflow,
  executeReleaseWorkflow,
  executeRevertWorkflow,
  executeStashWorkflow,
  executeSwitchBranchWorkflow,
  executeSyncFromBranchWorkflow,
  executeUndoWorkflow,
  executeInitializeRepositoryWorkflow,
  executeCloneRepositoryWorkflow,
  executeUpdateRemoteUrlWorkflow,
  executeAmmedLastCommitWorkflow,
  executeApplyStashWorkflow,
  executePopStashWorkflow,
  executeCreateAndPushTagWorkflow,
  executeDeleteTagWorkflow,
} from "./workflows";
import {
  tipContentMap,
  tipContentProvider,
} from "./providers/tipContent.provider";
import i18next from "i18next";
import { initI18n } from "./utils/i18n";

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
      .showWarningMessage(
        `Git Workflow Assistant: ${error.message}`,
        "Learn more",
      )
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

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.showWorkflows", () => {
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
              label: i18next.t("gitWorkflow.showWorkflows.switchBranch.label"),
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
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.featureBranch", () =>
      executeWorkflow("feature", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.hotfix", () =>
      executeWorkflow("hotfix", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.release", () =>
      executeWorkflow("release", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.commit", () =>
      executeWorkflow("commit", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.commitAndPush", () =>
      executeWorkflow("commitPush", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.pullRebase", () =>
      executeWorkflow("pullRebase", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.stashOnly", () =>
      executeWorkflow("stashOnly", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.stashAndSwitch", () =>
      executeWorkflow("stash", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.mergeBranch", () =>
      executeWorkflow("merge", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.undoCommit", () =>
      executeWorkflow("undo", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.cherryPick", () =>
      executeWorkflow("cherryPick", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.revert", () =>
      executeWorkflow("revert", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.interactiveRebase", () =>
      executeWorkflow("interactiveRebase", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.createSwitchBranch", () =>
      executeWorkflow("createSwitchBranch", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.switchBranch", () =>
      executeWorkflow("switchBranch", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.syncFromBranch", () =>
      executeWorkflow("syncFromBranch", commandExecutor),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.showHistory", () => {
      historyProvider.showHistoryQuickPick();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.init", () => {
      vscode.commands.executeCommand("init", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.clone", () => {
      vscode.commands.executeCommand("clone", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.updateRemote", () => {
      vscode.commands.executeCommand("updateRemote", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.amendLastCommit", () => {
      vscode.commands.executeCommand("amendLastCommit", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.applyStash", () => {
      vscode.commands.executeCommand("applyStash", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.popStash", () => {
      vscode.commands.executeCommand("popStash", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.createAndPushTag", () => {
      vscode.commands.executeCommand("createAndPushTag", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.deleteTag", () => {
      vscode.commands.executeCommand("deleteTag", commandExecutor);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gitWorkflow.showTips", () => {
      vscode.commands.executeCommand(
        "git-workflow-assistant.gitTipsExplorer.focus",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "gitWorkflow.showTipDetails",
      (item: TipItem) => {
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
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "gitWorkflow.showDocumentation",
      (item: WorkflowItem) => {
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
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "gitWorkflow.executeWorkflow",
      (item: WorkflowItem) => {
        executeWorkflow(item.workflowType, commandExecutor);
      },
    ),
  );
}

export function deactivate() {}

async function executeWorkflow(
  workflowType: string,
  executor: GitCommandExecutor,
) {
  try {
    await GitValidator.checkGitInstalled();
  } catch (error: any) {
    vscode.window
      .showErrorMessage(
        i18next.t("message.cannotExecuteWorkflow", {
          errorMessage: error.message,
        }),
        "Learn more",
      )
      .then((selection) => {
        if (selection === "Learn more") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://git-scm.com/downloads"),
          );
        }
      });
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(i18next.t("messages.noWorkSpaceOpen"));
    return;
  }

  try {
    await GitValidator.checkGitRepository(workspaceFolder.uri.fsPath);
  } catch (error: any) {
    vscode.window
      .showErrorMessage(
        `Cannot execute workflow: ${error.message}`,
        i18next.t("messages.initializeRepository"),
      )
      .then((selection) => {
        if (selection === i18next.t("messages.initializeRepository")) {
          vscode.commands.executeCommand("git.init");
        }
      });
    return;
  }

  switch (workflowType) {
    case "feature":
      await executeFeatureBranchWorkflow(executor);
      break;
    case "hotfix":
      await executeHotfixWorkflow(executor);
      break;
    case "release":
      await executeReleaseWorkflow(executor);
      break;
    case "commitPush":
      await executeCommitPushWorkflow(executor);
      break;
    case "pullRebase":
      await executePullRebaseWorkflow(executor);
      break;
    case "stash":
      await executeStashWorkflow(executor);
      break;
    case "merge":
      await executeMergeWorkflow(executor);
      break;
    case "undo":
      await executeUndoWorkflow(executor);
      break;
    case "cherryPick":
      await executeCherryPickWorkflow(executor);
      break;
    case "revert":
      await executeRevertWorkflow(executor);
      break;
    case "interactiveRebase":
      await executeInteractiveRebaseWorkflow(executor);
      break;
    case "createSwitchBranch":
      await executeCreateSwitchBranchWorkflow(executor);
      break;
    case "switchBranch":
      await executeSwitchBranchWorkflow(executor);
      break;
    case "syncFromBranch":
      await executeSyncFromBranchWorkflow(executor);
      break;
    case "init":
      await executeInitializeRepositoryWorkflow(executor);
      break;
    case "clone":
      await executeCloneRepositoryWorkflow(executor);
      break;
    case "updateRemote":
      await executeUpdateRemoteUrlWorkflow(executor);
      break;
    case "amendLastCommit":
      await executeAmmedLastCommitWorkflow(executor);
      break;
    case "applyStash":
      await executeApplyStashWorkflow(executor);
      break;
    case "popStash":
      await executePopStashWorkflow(executor);
      break;
    case "createAndPushTag":
      await executeCreateAndPushTagWorkflow(executor);
      break;
    case "deleteTag":
      await executeDeleteTagWorkflow(executor);
      break;
    default:
      vscode.window.showErrorMessage(
        i18next.t("messages.unknownWorkflow", { workflowType }),
      );
  }
}

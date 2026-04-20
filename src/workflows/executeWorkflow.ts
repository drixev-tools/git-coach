import vscode from "vscode";
import { GitCommandExecutor } from "../commands/gitExecutor";
import { GitValidator } from "../utils/gitValidator";
import i18next from "i18next";
import {
  executeFeatureBranchWorkflow,
  executeHotfixWorkflow,
  executeReleaseWorkflow,
  executeCommitPushWorkflow,
  executePullRebaseWorkflow,
  executeStashWorkflow,
  executeMergeWorkflow,
  executeUndoWorkflow,
  executeCherryPickWorkflow,
  executeRevertWorkflow,
  executeInteractiveRebaseWorkflow,
  executeCreateSwitchBranchWorkflow,
  executeSwitchBranchWorkflow,
  executeSyncFromBranchWorkflow,
  executeInitializeRepositoryWorkflow,
  executeCloneRepositoryWorkflow,
  executeUpdateRemoteUrlWorkflow,
  executeAmendLastCommitWorkflow,
  executeApplyStashWorkflow,
  executePopStashWorkflow,
  executeCreateAndPushTagWorkflow,
  executeDeleteTagWorkflow,
} from "./workflows";

export default async function executeWorkflow(
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
    if (workflowType !== "init") {
      await GitValidator.checkGitRepository(workspaceFolder.uri.fsPath);
    }
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
      await executeAmendLastCommitWorkflow(executor);
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

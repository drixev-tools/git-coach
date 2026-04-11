import vscode from "vscode";
import { GitCommandExecutor } from "./gitExecutor";
import executeWorkflow from "../workflows/executeWorkflow";
import { CommandSubscription } from "../items/commandSubscription.item";

export default async function registerGitCommands(
  context: vscode.ExtensionContext,
  executor: GitCommandExecutor,
  subscriptions: CommandSubscription[],
) {
  subscriptions.forEach(({ workflowType, command }) => {
    if (!workflowType) return;

    context.subscriptions.push(
      vscode.commands.registerCommand(command, () => {
        executeWorkflow(workflowType, executor);
      }),
    );
  });
}

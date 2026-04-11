import vscode from "vscode";
import { ViewCommandSubscription } from "../items/commandSubscription.item";

export default async function registerViewCommands(
  context: vscode.ExtensionContext,
  commands: ViewCommandSubscription[],
) {
  commands.forEach(({ command, callback }) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, callback),
    );
  });
}

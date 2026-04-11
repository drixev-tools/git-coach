import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { ErrorHelper } from "../utils/errorHelper";
import i18next from "i18next";

const execAsync = promisify(exec);

export interface GitCommand {
  command: string;
  description: string;
  documentationUrl?: string;
  explanation?: string;
}

export class GitCommandExecutor {
  private outputChannel: vscode.OutputChannel;
  private commandHistory: GitCommand[] = [];
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel("Git Coach");
    this.commandHistory = context.globalState.get("commandHistory", []);
  }

  async executeCommandSequence(
    commands: GitCommand[],
    workflowName: string,
    workflowCommand?: string,
  ) {
    const config = vscode.workspace.getConfiguration("gitWorkflow");
    const confirmBefore = config.get<boolean>("confirmBeforeExecute", true);

    if (confirmBefore) {
      const preview = this.generateCommandPreview(commands, workflowName);
      const proceed = await vscode.window.showInformationMessage(
        `Execute ${workflowName}?`,
        {
          modal: true,
          detail: preview,
        },
        "Execute",
        "Show Details",
        "Cancel",
      );

      if (proceed === "Show Details") {
        this.outputChannel.clear();
        this.outputChannel.appendLine(`=== ${workflowName} ===\n`);
        this.outputChannel.appendLine(preview);
        this.outputChannel.show();

        const confirm = await vscode.window.showInformationMessage(
          "Ready to execute?",
          "Execute",
          "Cancel",
        );

        if (confirm !== "Execute") return;
      } else if (proceed !== "Execute") {
        return;
      }
    }

    this.outputChannel.clear();
    this.outputChannel.show(true);
    this.outputChannel.appendLine(
      `╔═══════════════════════════════════════════════════════╗`,
    );
    this.outputChannel.appendLine(`║  ${workflowName.padEnd(52)} ║`);
    this.outputChannel.appendLine(
      `╚═══════════════════════════════════════════════════════╝\n`,
    );

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder open");
      return;
    }

    let success = true;

    //special logic for interactive rebase command
    if (workflowCommand === "interactiveRebase" && commands[0]) {
      const cmd = commands[0];
      const terminal = vscode.window.createTerminal("Interactive Rebase");
      terminal.show();

      this.addToHistory(cmd);

      terminal.sendText(cmd.command);
      return;
    }

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      if (!cmd) {
        continue;
      }

      this.outputChannel.appendLine(`\n${"=".repeat(60)}`);
      this.outputChannel.appendLine(
        `[${i + 1}/${commands.length}] ${cmd.description}`,
      );
      this.outputChannel.appendLine(`${"=".repeat(60)}`);
      this.outputChannel.appendLine(`📝 Command: ${cmd.command}`);

      try {
        const { stdout, stderr } = await execAsync(cmd.command, {
          cwd: workspaceFolder.uri.fsPath,
        });

        if (stdout) {
          this.outputChannel.appendLine(`✅ Output:\n${stdout}`);
        }

        if (
          stderr &&
          !stderr.includes("Switched to") &&
          !stderr.includes("Already on")
        ) {
          this.outputChannel.appendLine(`⚠️  Warnings:\n${stderr}`);
        }

        this.addToHistory(cmd);
      } catch (error: any) {
        const errorInfo = ErrorHelper.parseGitError(error);
        const formattedError = ErrorHelper.formatErrorForDisplay(errorInfo);

        this.outputChannel.appendLine(`❌ Error: ${errorInfo.message}`);
        this.outputChannel.appendLine(formattedError);

        if (error.message) {
          this.outputChannel.appendLine(
            `\n📋 Original Error: ${error.message}`,
          );
        }
        if (error.stdout) {
          this.outputChannel.appendLine(`Output: ${error.stdout}`);
        }
        if (error.stderr) {
          this.outputChannel.appendLine(`Error Details: ${error.stderr}`);
        }

        success = false;

        const errorDialog = vscode.window.showErrorMessage(
          `Command failed: ${cmd.command}\n${errorInfo.message}`,
          "Show Suggestions",
          "Continue Anyway",
          "Stop Workflow",
          "Retry",
        );

        const retry = await errorDialog;

        if (retry === "Show Suggestions") {
          this.outputChannel.show(true);
          const action = await vscode.window.showInformationMessage(
            "Error suggestions are shown in the output channel. What would you like to do?",
            "Continue Anyway",
            "Stop Workflow",
            "Retry",
          );
          if (action === "Stop Workflow") {
            break;
          } else if (action === "Retry") {
            i--; // Retry the same command
          }
        } else if (retry === "Stop Workflow") {
          break;
        } else if (retry === "Retry") {
          i--; // Retry the same command
        }
      }
    }

    if (success) {
      this.outputChannel.appendLine(
        `✅ ${workflowName} completed successfully!`,
      );
      vscode.window.showInformationMessage(`✅ ${workflowName} completed!`);
    } else {
      this.outputChannel.appendLine(
        `⚠️  ${workflowName} completed with errors`,
      );
    }
  }

  private generateCommandPreview(
    commands: GitCommand[],
    workflowName: string,
  ): string {
    let preview = `${workflowName}\n\n`;
    preview += `The following commands will be executed:\n\n`;

    commands.forEach((cmd, index) => {
      preview += `${index + 1}. ${cmd.description}\n`;
      preview += `   $ ${cmd.command}\n\n`;
    });

    return preview;
  }

  private addToHistory(command: GitCommand) {
    const config = vscode.workspace.getConfiguration("gitWorkflow");
    const saveHistory = config.get<boolean>("saveCommandHistory", true);

    if (!saveHistory) return;

    this.commandHistory.unshift({
      ...command,
      description: `${command.description} (${new Date().toLocaleString()})`,
    });

    if (this.commandHistory.length > 50) {
      this.commandHistory = this.commandHistory.slice(0, 50);
    }

    this.context.globalState.update("commandHistory", this.commandHistory);
    vscode.commands.executeCommand("gitWorkflow.refreshHistory");
  }

  getCommandHistory(): GitCommand[] {
    return this.commandHistory;
  }

  async getCurrentBranch(): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync("git branch --show-current", {
        cwd: workspaceFolder.uri.fsPath,
      });
      return stdout.trim();
    } catch (error) {
      throw new Error("Failed to get current branch");
    }
  }

  async getBranches(): Promise<string[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync(
        'git branch --format="%(refname:short)"',
        {
          cwd: workspaceFolder.uri.fsPath,
        },
      );
      return stdout
        .trim()
        .split("\n")
        .filter((b: string | any[]) => b.length > 0);
    } catch (error) {
      throw new Error("Failed to get branches");
    }
  }

  async getRemoteBranches(): Promise<string[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync(
        'git branch -r --format="%(refname:short)"',
        {
          cwd: workspaceFolder.uri.fsPath,
        },
      );
      return stdout
        .trim()
        .split("\n")
        .filter((b: string) => b.length > 0 && !b.includes("HEAD"))
        .map((b: string) => b.trim());
    } catch (error) {
      throw new Error("Failed to get remote branches");
    }
  }

  async getCommits(
    limit: number = 20,
  ): Promise<Array<{ hash: string; message: string; fullLine: string }>> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync(`git log --oneline -n ${limit}`, {
        cwd: workspaceFolder.uri.fsPath,
      });
      const lines = stdout
        .trim()
        .split("\n")
        .filter((l: string) => l.length > 0);
      return lines
        .map((line: string) => {
          const parts = line.split(" ", 2);
          return {
            hash: parts[0] || "",
            message: parts[1] || "",
            fullLine: line,
          };
        })
        .filter((c) => c.hash.length > 0);
    } catch (error) {
      throw new Error("Failed to get commits");
    }
  }

  async executeCustomCommand(command: string, description?: string) {
    await this.executeCommandSequence(
      [
        {
          command,
          description: description || "Custom command",
        },
      ],
      "Custom Git Command",
    );
  }

  async getStashList(): Promise<Array<{ id: string; message: string }>> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync("git stash list", {
        cwd: workspaceFolder.uri.fsPath,
      });
      const lines = stdout
        .trim()
        .split("\n")
        .filter((l: string) => l.length > 0);

      return lines.map((line: string) => {
        const match = line.match(/^stash@{(\d+)}:\s*(.+)$/);
        if (match) {
          return {
            id: `stash@{${match[1]}}`,
            message: match[2] || "Unrecognized stash message",
          };
        }
        return { id: line, message: line };
      });
    } catch (error) {
      throw new Error("Failed to get stash list");
    }
  }

  async getCurrentRemote(): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync("git remote", {
        cwd: workspaceFolder.uri.fsPath,
      });
      return stdout.trim();
    } catch (error) {
      throw new Error("Failed to get current remote");
    }
  }

  async getTags(): Promise<string[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error("No workspace folder open");
    }

    try {
      const { stdout } = await execAsync(
        'git tag --list --format="%(refname:short)"',
        {
          cwd: workspaceFolder.uri.fsPath,
        },
      );
      return stdout
        .trim()
        .split("\n")
        .filter((t: string) => t.length > 0);
    } catch (error) {
      throw new Error("Failed to get tags");
    }
  }
}

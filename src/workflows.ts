import * as vscode from "vscode";
import { GitCommandExecutor } from "./gitCommandExecutor";
import { GitValidator } from "./utils/gitValidator";

async function executeFeatureBranchWorkflow(executor: GitCommandExecutor) {
  const branchName = await vscode.window.showInputBox({
    prompt: "Enter feature branch name",
    placeHolder: "e.g., add-login-page",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Branch name is required";
      }
      const validation = GitValidator.validateBranchName(value);
      return validation.isValid
        ? null
        : validation.errorMessage || "Invalid branch name";
    },
  });

  if (!branchName) return;

  const baseBranch = await vscode.window.showInputBox({
    prompt: "Base branch (leave empty for current branch)",
    placeHolder: "e.g., main, develop",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return null;
      }
      const validation = GitValidator.validateBranchName(value);
      return validation.isValid
        ? null
        : validation.errorMessage || "Invalid branch name";
    },
  });

  const commands = [];

  if (baseBranch) {
    commands.push({
      command: `git checkout ${baseBranch}`,
      description: `Switch to base branch '${baseBranch}'`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Switches to the specified branch, updating your working directory to match that branch.",
    });
    commands.push({
      command: `git pull origin ${baseBranch}`,
      description: `Update base branch with latest changes`,
      documentationUrl: "https://git-scm.com/docs/git-pull",
      explanation:
        "Fetches and merges changes from the remote repository into the current branch.",
    });
  }

  commands.push({
    command: `git checkout -b feature/${branchName}`,
    description: `Create and switch to new feature branch`,
    documentationUrl: "https://git-scm.com/docs/git-checkout",
    explanation:
      "Creates a new branch and switches to it in one command. The -b flag creates the branch if it doesn't exist.",
  });

  await executor.executeCommandSequence(commands, "Feature Branch Workflow");
}

async function executeHotfixWorkflow(executor: GitCommandExecutor) {
  const version = await vscode.window.showInputBox({
    prompt: "Enter hotfix version",
    placeHolder: "e.g., 1.2.1",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Version is required";
      }
      const validation = GitValidator.validateVersionTag(value);
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid version format";
      }
      return null;
    },
  });

  if (!version) return;

  const versionValidation = GitValidator.validateVersionTag(version);
  if (versionValidation.errorMessage) {
    await vscode.window.showWarningMessage(versionValidation.errorMessage);
  }

  const commands = [
    {
      command: "git checkout main",
      description: "Switch to main/production branch",
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Switches to the main branch, which typically represents production code.",
    },
    {
      command: "git pull origin main",
      description: "Get latest production code",
      documentationUrl: "https://git-scm.com/docs/git-pull",
      explanation:
        "Fetches and merges the latest changes from the remote main branch.",
    },
    {
      command: `git checkout -b hotfix/${version}`,
      description: `Create hotfix branch for version ${version}`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation: "Creates a new hotfix branch for urgent production fixes.",
    },
  ];

  await executor.executeCommandSequence(commands, "Hotfix Workflow");
}

async function executeReleaseWorkflow(executor: GitCommandExecutor) {
  const version = await vscode.window.showInputBox({
    prompt: "Enter release version",
    placeHolder: "e.g., 2.0.0",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Version is required";
      }
      const validation = GitValidator.validateVersionTag(value);
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid version format";
      }
      return null;
    },
  });

  if (!version) return;

  const versionValidation = GitValidator.validateVersionTag(version);
  if (versionValidation.errorMessage) {
    await vscode.window.showWarningMessage(versionValidation.errorMessage);
  }

  const commands = [
    {
      command: "git checkout develop",
      description: "Switch to develop branch",
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Switches to the develop branch, which typically contains integration code.",
    },
    {
      command: "git pull origin develop",
      description: "Update develop with latest changes",
      documentationUrl: "https://git-scm.com/docs/git-pull",
      explanation:
        "Fetches and merges the latest changes from the remote develop branch.",
    },
    {
      command: `git checkout -b release/${version}`,
      description: `Create release branch for version ${version}`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation: "Creates a new release branch for preparing a new version.",
    },
    {
      command: `git tag -a v${version} -m "Release version ${version}"`,
      description: "Create version tag",
      documentationUrl: "https://git-scm.com/docs/git-tag",
      explanation:
        "Creates an annotated tag with a message, marking a specific point in history as a release.",
    },
  ];

  await executor.executeCommandSequence(commands, "Release Workflow");
}

async function executeCommitWorkflow(executor: GitCommandExecutor) {
  const message = await vscode.window.showInputBox({
    prompt: "Enter commit message",
    placeHolder: "e.g., feat: add user authentication",
    validateInput: (value) => {
      const validation = GitValidator.validateCommitMessage(value || "");
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid commit message";
      }
      return null;
    },
  });

  if (!message) return;

  const messageValidation = GitValidator.validateCommitMessage(message);
  if (messageValidation.errorMessage) {
    await vscode.window.showWarningMessage(messageValidation.errorMessage);
  }

  const commands = [
    {
      command: "git add .",
      description: "Stage all changes",
      documentationUrl: "https://git-scm.com/docs/git-add",
      explanation:
        "Stages all modified and new files in the current directory and subdirectories for commit.",
    },
    {
      command: `git commit -m "${message}"`,
      description: "Commit with message",
      documentationUrl: "https://git-scm.com/docs/git-commit",
      explanation:
        "Creates a new commit with the staged changes and the provided message.",
    },
  ];

  await executor.executeCommandSequence(commands, "Commit Workflow");
}

async function executeCommitPushWorkflow(executor: GitCommandExecutor) {
  const message = await vscode.window.showInputBox({
    prompt: "Enter commit message",
    placeHolder: "e.g., feat: add user authentication",
    validateInput: (value) => {
      const validation = GitValidator.validateCommitMessage(value || "");
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid commit message";
      }
      return null;
    },
  });

  if (!message) return;

  const messageValidation = GitValidator.validateCommitMessage(message);
  if (messageValidation.errorMessage) {
    await vscode.window.showWarningMessage(messageValidation.errorMessage);
  }

  const branch = await executor.getCurrentBranch();

  const commands = [
    {
      command: "git add .",
      description: "Stage all changes",
      documentationUrl: "https://git-scm.com/docs/git-add",
      explanation:
        "Stages all modified and new files in the current directory and subdirectories for commit.",
    },
    {
      command: `git commit -m "${message}"`,
      description: "Commit with message",
      documentationUrl: "https://git-scm.com/docs/git-commit",
      explanation:
        "Creates a new commit with the staged changes and the provided message.",
    },
    {
      command: `git push origin ${branch}`,
      description: `Push to remote branch '${branch}'`,
      documentationUrl: "https://git-scm.com/docs/git-push",
      explanation:
        "Uploads local commits to the remote repository, updating the remote branch.",
    },
  ];

  await executor.executeCommandSequence(commands, "Commit & Push Workflow");
}

async function executePullRebaseWorkflow(executor: GitCommandExecutor) {
  const branch = await executor.getCurrentBranch();

  const commands = [
    {
      command: "git fetch origin",
      description: "Fetch latest changes from remote",
      documentationUrl: "https://git-scm.com/docs/git-fetch",
      explanation:
        "Downloads objects and refs from the remote repository without merging.",
    },
    {
      command: `git rebase origin/${branch}`,
      description: `Rebase current branch on top of origin/${branch}`,
      documentationUrl: "https://git-scm.com/docs/git-rebase",
      explanation:
        "Reapplies your local commits on top of the remote branch, creating a linear history.",
    },
  ];

  await executor.executeCommandSequence(commands, "Pull Rebase Workflow");
}

async function executeStashOnlyWorkflow(executor: GitCommandExecutor) {
  const stashMessage = await vscode.window.showInputBox({
    prompt: "Enter stash message (optional)",
    placeHolder: "e.g., WIP: working on feature X",
  });

  if (!stashMessage) return;

  const untrackedMessage = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Include untracked files in stash?",
  });

  const commands = [
    {
      command: stashMessage
        ? `git stash save ${untrackedMessage == "Yes" ? "-u" : ""} "${stashMessage}"`
        : `git stash ${untrackedMessage == "Yes" ? "-u" : ""}`,
      description: "Stash current changes",
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Temporarily saves uncommitted changes so you can switch branches cleanly.",
    },
  ];

  await executor.executeCommandSequence(commands, "Stash Workflow");
}

async function executeStashWorkflow(executor: GitCommandExecutor) {
  const branches = await executor.getBranches();

  const targetBranch = await vscode.window.showQuickPick(branches, {
    placeHolder: "Select branch to switch to",
  });

  if (!targetBranch) return;

  const stashMessage = await vscode.window.showInputBox({
    prompt: "Enter stash message (optional)",
    placeHolder: "e.g., WIP: working on feature X",
  });

  const commands = [
    {
      command: stashMessage ? `git stash save "${stashMessage}"` : "git stash",
      description: "Stash current changes",
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Temporarily saves uncommitted changes so you can switch branches cleanly.",
    },
    {
      command: `git checkout ${targetBranch}`,
      description: `Switch to branch '${targetBranch}'`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Switches to the specified branch, updating your working directory.",
    },
  ];

  const applyStash = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Apply stash on new branch?",
  });

  if (applyStash === "Yes") {
    commands.push({
      command: "git stash pop",
      description: "Apply and remove stash",
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Applies the most recent stash and removes it from the stash list.",
    });
  }

  await executor.executeCommandSequence(commands, "Stash & Switch Workflow");
}

async function executeMergeWorkflow(executor: GitCommandExecutor) {
  const branches = await executor.getBranches();
  const currentBranch = await executor.getCurrentBranch();

  const sourceBranch = await vscode.window.showQuickPick(
    branches.filter((b) => b !== currentBranch),
    {
      placeHolder: `Select branch to merge into ${currentBranch}`,
    },
  );

  if (!sourceBranch) return;

  const strategy = await vscode.window.showQuickPick(
    [
      { label: "Regular Merge", value: "" },
      { label: "No Fast-Forward", value: "--no-ff" },
      { label: "Squash", value: "--squash" },
    ],
    {
      placeHolder: "Select merge strategy",
    },
  );

  if (!strategy) return;

  const commands = [
    {
      command: `git merge ${strategy.value} ${sourceBranch}`,
      description: `Merge '${sourceBranch}' into '${currentBranch}' using ${strategy.label}`,
      documentationUrl: "https://git-scm.com/docs/git-merge",
      explanation: `Merges the specified branch into the current branch. ${strategy.value ? `Strategy: ${strategy.label}` : "Uses default merge strategy."}`,
    },
  ];

  await executor.executeCommandSequence(commands, "Merge Workflow");
}

async function executeUndoWorkflow(executor: GitCommandExecutor) {
  const option = await vscode.window.showQuickPick(
    [
      {
        label: "Soft Reset",
        description: "Keep changes staged",
        value: "--soft",
      },
      {
        label: "Mixed Reset",
        description: "Keep changes unstaged",
        value: "--mixed",
      },
      {
        label: "Hard Reset",
        description: "Discard all changes (DANGEROUS)",
        value: "--hard",
      },
    ],
    {
      placeHolder: "How do you want to undo the last commit?",
    },
  );

  if (!option) return;

  const commands = [
    {
      command: `git reset ${option.value} HEAD~1`,
      description: `${option.label}: undo last commit`,
      documentationUrl: "https://git-scm.com/docs/git-reset",
      explanation: `Undoes the last commit. ${option.value === "--soft" ? "Keeps changes staged." : option.value === "--mixed" ? "Keeps changes but unstages them." : "Discards all changes (DANGEROUS)."}`,
    },
  ];

  await executor.executeCommandSequence(commands, "Undo Commit Workflow");
}

async function executeCherryPickWorkflow(executor: GitCommandExecutor) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  try {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    const { stdout } = await execAsync("git log --oneline -20", {
      cwd: workspaceFolder.uri.fsPath,
    });

    const commits = stdout
      .trim()
      .split("\n")
      .filter((line: string) => line.length > 0);

    if (commits.length === 0) {
      vscode.window.showInformationMessage("No commits found");
      return;
    }

    interface CommitItem {
      label: string;
      description: string;
      detail: string;
      hash: string;
    }

    const commitItems: CommitItem[] = commits.map((line: string) => {
      const [hash, ...messageParts] = line.split(" ");
      const message = messageParts.join(" ");
      return {
        label: hash,
        description: message,
        detail: line,
        hash: hash,
      };
    });

    const selected = await vscode.window.showQuickPick<CommitItem>(
      commitItems,
      {
        placeHolder: "Select a commit to cherry-pick",
        matchOnDescription: true,
      },
    );

    if (!selected) return;

    const commands = [
      {
        command: `git cherry-pick ${selected.hash}`,
        description: `Cherry-pick commit ${selected.hash}: ${selected.description}`,
        documentationUrl: "https://git-scm.com/docs/git-cherry-pick",
        explanation:
          "Cherry-pick applies the changes from a specific commit to the current branch without merging the entire branch history.",
      },
    ];

    await executor.executeCommandSequence(commands, "Cherry-Pick Workflow");
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to get commits: ${error.message}`);
  }
}

async function executeRevertWorkflow(executor: GitCommandExecutor) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  try {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    const { stdout } = await execAsync("git log --oneline -20", {
      cwd: workspaceFolder.uri.fsPath,
    });

    const commits = stdout
      .trim()
      .split("\n")
      .filter((line: string) => line.length > 0);

    if (commits.length === 0) {
      vscode.window.showInformationMessage("No commits found");
      return;
    }

    interface CommitItem {
      label: string;
      description: string;
      detail: string;
      hash: string;
    }

    const commitItems: CommitItem[] = commits.map((line: string) => {
      const [hash, ...messageParts] = line.split(" ");
      const message = messageParts.join(" ");
      return {
        label: hash,
        description: message,
        detail: line,
        hash: hash,
      };
    });

    const selected = await vscode.window.showQuickPick<CommitItem>(
      commitItems,
      {
        placeHolder: "Select a commit to revert",
        matchOnDescription: true,
      },
    );

    if (!selected) return;

    const commands = [
      {
        command: `git revert ${selected.hash}`,
        description: `Revert commit ${selected.hash}: ${selected.description}`,
        documentationUrl: "https://git-scm.com/docs/git-revert",
        explanation:
          "Revert creates a new commit that undoes the changes from the selected commit, preserving history.",
      },
    ];

    await executor.executeCommandSequence(commands, "Revert Commit Workflow");
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to get commits: ${error.message}`);
  }
}

async function executeInteractiveRebaseWorkflow(executor: GitCommandExecutor) {
  const option = await vscode.window.showQuickPick(
    [
      {
        label: "Rebase last N commits",
        value: "count",
        description: "Rebase a specific number of commits",
      },
      {
        label: "Rebase onto branch",
        value: "branch",
        description: "Rebase current branch onto another branch",
      },
    ],
    {
      placeHolder: "Choose rebase option",
    },
  );

  if (!option) return;

  let base: string;

  if (option.value === "count") {
    const countInput = await vscode.window.showInputBox({
      prompt: "Number of commits to rebase",
      placeHolder: "e.g., 3",
      validateInput: (value) => {
        const num = parseInt(value || "0", 10);
        if (isNaN(num) || num < 1) {
          return "Please enter a valid number greater than 0";
        }
        return null;
      },
    });

    if (!countInput) return;
    base = `HEAD~${countInput}`;
  } else {
    const branches = await executor.getBranches();
    const currentBranch = await executor.getCurrentBranch();

    const selectedBranch = await vscode.window.showQuickPick(
      branches.filter((b) => b !== currentBranch),
      {
        placeHolder: "Select base branch for rebase",
      },
    );

    if (!selectedBranch) return;
    base = selectedBranch;
  }

  const commands = [
    {
      command: `git rebase -i ${base}`,
      description: `Interactive rebase starting from ${base}`,
      documentationUrl: "https://git-scm.com/docs/git-rebase",
      explanation:
        "Interactive rebase opens an editor where you can reorder, edit, squash, or drop commits. The editor will open automatically.",
    },
  ];

  await vscode.window.showInformationMessage(
    "Interactive rebase will open your default editor. After making changes, save and close the editor to continue.",
    "Continue",
  );

  await executor.executeCommandSequence(
    commands,
    "Interactive Rebase Workflow",
  );
}

async function executeCreateSwitchBranchWorkflow(executor: GitCommandExecutor) {
  const branchName = await vscode.window.showInputBox({
    prompt: "Enter branch name",
    placeHolder: "e.g., my-feature-branch",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Branch name is required";
      }
      const validation = GitValidator.validateBranchName(value);
      return validation.isValid
        ? null
        : validation.errorMessage || "Invalid branch name";
    },
  });

  if (!branchName) return;

  const commands = [
    {
      command: `git checkout -b ${branchName}`,
      description: `Create and switch to branch '${branchName}'`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Creates a new branch and immediately switches to it. This is a shortcut for creating a branch and then checking it out.",
    },
  ];

  await executor.executeCommandSequence(
    commands,
    "Create & Switch Branch Workflow",
  );
}

async function executeSyncFromBranchWorkflow(executor: GitCommandExecutor) {
  const currentBranch = await executor.getCurrentBranch();

  await executor.executeCommandSequence(
    [
      {
        command: "git fetch origin",
        description: "Fetch latest remote state",
        documentationUrl: "https://git-scm.com/docs/git-fetch",
        explanation: "Downloads all remote refs without merging anything.",
      },
    ],
    "Fetch",
  );

  const remoteBranches = await executor.getRemoteBranches();
  const localBranches = await executor.getBranches();
  const allBranches = [
    ...remoteBranches,
    ...localBranches.filter(
      (b) => !remoteBranches.includes(`origin/${b}`) && b !== currentBranch,
    ),
  ];

  const sourceBranch = await vscode.window.showQuickPick(allBranches, {
    placeHolder: `Select branch to sync into '${currentBranch}'`,
  });

  if (!sourceBranch) return;

  const strategy = await vscode.window.showQuickPick(
    [
      {
        label: "Rebase",
        description:
          "Linear history — replays your commits on top of the selected branch",
        value: "rebase",
      },
      {
        label: "Merge",
        description: "Preserves history — creates a merge commit",
        value: "merge",
      },
    ],
    { placeHolder: "Select strategy" },
  );

  if (!strategy) return;

  const command =
    strategy.value === "rebase"
      ? `git rebase ${sourceBranch}`
      : `git merge ${sourceBranch}`;

  const commands = [
    {
      command,
      description: `${strategy.label} '${sourceBranch}' into '${currentBranch}'`,
      documentationUrl:
        strategy.value === "rebase"
          ? "https://git-scm.com/docs/git-rebase"
          : "https://git-scm.com/docs/git-merge",
      explanation:
        strategy.value === "rebase"
          ? "Replays your local commits on top of the selected branch, creating a linear history."
          : "Merges the selected branch into your current branch, preserving the full history.",
    },
  ];

  await executor.executeCommandSequence(commands, "Sync From Branch Workflow");
}

async function executeSwitchBranchWorkflow(executor: GitCommandExecutor) {
  const branches = await executor.getBranches();

  const branchName = await vscode.window.showQuickPick(branches, {
    placeHolder: "Select branch to switch to",
  });

  if (!branchName) return;

  const commands = [
    {
      command: `git checkout ${branchName}`,
      description: `Switch to branch '${branchName}'`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "This is the standard command to switch to an existing branch. If you have uncommitted changes, Git may prompt you to stash or commit them before switching.",
    },
  ];

  await executor.executeCommandSequence(commands, "Switch Branch Workflow");
}

export {
    executeFeatureBranchWorkflow,
    executeHotfixWorkflow,
    executeReleaseWorkflow,
    executeCommitWorkflow,
    executeCommitPushWorkflow,
    executePullRebaseWorkflow,
    executeStashOnlyWorkflow,
    executeStashWorkflow,
    executeMergeWorkflow,
    executeUndoWorkflow,
    executeCherryPickWorkflow,
    executeRevertWorkflow,
    executeInteractiveRebaseWorkflow,
    executeCreateSwitchBranchWorkflow,
    executeSyncFromBranchWorkflow,
    executeSwitchBranchWorkflow
}
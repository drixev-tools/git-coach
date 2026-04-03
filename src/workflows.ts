import * as vscode from "vscode";
import { GitCommandExecutor } from "./gitCommandExecutor";
import { GitValidator } from "./utils/gitValidator";
import i18next from "i18next";

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

  const pushMessage = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: `Do you want to push to remote branch '${branch}' after committing?`,
  });

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

  if (pushMessage === "Yes") {
    commands.push({
      command: `git push origin ${branch}`,
      description: `Push to remote branch '${branch}'`,
      documentationUrl: "https://git-scm.com/docs/git-push",
      explanation:
        "Uploads local commits to the remote repository, updating the remote branch.",
    });
  }

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

async function executeStashWorkflow(executor: GitCommandExecutor) {
  const untrackedMessage = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Include untracked files in stash?",
  });

  const switchBranchMessage = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Do you want to switch to any branch?",
  });

  let targetBranch = undefined;

  if (switchBranchMessage === "Yes") {
    const branches = await executor.getBranches();

    targetBranch = await vscode.window.showQuickPick(branches, {
      placeHolder: "Select branch to switch to",
    });

    if (!targetBranch) return;
  }

  const stashMessage = await vscode.window.showInputBox({
    prompt: "Enter stash message (optional)",
    placeHolder: "e.g., WIP: working on feature X",
  });

  const stashUntrackerdFilesFlag = untrackedMessage === "Yes" ? "-u" : "";

  const commands = [
    {
      command: stashMessage
        ? `git stash push ${stashUntrackerdFilesFlag} -m "${stashMessage}"`
        : `git stash ${stashUntrackerdFilesFlag}`,
      description: "Stash current changes",
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Temporarily saves uncommitted changes so you can switch branches cleanly.",
    },
  ];

  if (targetBranch) {
    commands.push({
      command: `git checkout ${targetBranch}`,
      description: `Switch to branch '${targetBranch}'`,
      documentationUrl: "https://git-scm.com/docs/git-checkout",
      explanation:
        "Switches to the specified branch, updating your working directory.",
    });

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

  const command = {
    command: `git rebase -i ${base}`,
    description: `Interactive rebase starting from ${base}`,
    documentationUrl: "https://git-scm.com/docs/git-rebase",
    explanation:
      "Interactive rebase will open your default editor. After making changes, save and close the editor to continue.",
  };

  const proceed = await vscode.window.showInformationMessage(
    command.explanation,
    "Continue",
    "Cancel",
  );

  if (proceed !== "Continue") return;

  await executor.executeCommandSequence([command], "Interactive Rebase Workflow", "interactiveRebase");
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

async function executeInitializeRepositoryWorkflow(
  executor: GitCommandExecutor,
) {
  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Select folder to initialize Git repository in",
  });

  if (!folderUri || folderUri.length === 0) {
    vscode.window.showErrorMessage("No folder selected");
    return;
  }

  if (!folderUri[0]?.fsPath) {
    vscode.window.showErrorMessage("Invalid folder selected");
    return;
  }

  const commands = [
    {
      command: `git init "${folderUri[0].fsPath}"`,
      description: "Initialize new Git repository",
      documentationUrl: "https://git-scm.com/docs/git-init",
      explanation:
        "Creates a new Git repository in the selected folder. This is the first step to start version controlling your project with Git.",
    },
  ];

  await executor.executeCommandSequence(
    commands,
    "Initialize Repository Workflow",
  );
}

async function executeCloneRepositoryWorkflow(executor: GitCommandExecutor) {
  const repoUrl = await vscode.window.showInputBox({
    prompt: "Enter the url of the remote repository",
    placeHolder: "e.g., https://github.com/[user]/repo.git",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Remote url is required";
      }
    },
  });

  if (!repoUrl) {
    vscode.window.showErrorMessage("Repository URL is required");
    return;
  }

  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Select folder to clone repository into",
  });

  if (!folderUri || folderUri.length === 0) {
    vscode.window.showErrorMessage("No folder selected");
    return;
  }

  if (!folderUri[0]?.fsPath) {
    vscode.window.showErrorMessage("Invalid folder selected");
    return;
  }

  const commands = [
    {
      command: `git clone "${repoUrl}" "${folderUri[0].fsPath}"`,
      description: "Clone Git repository",
      documentationUrl: "https://git-scm.com/docs/git-clone",
      explanation:
        "Clones an existing Git repository from the provided URL into the selected folder. This is the first step to start working on an existing project with Git.",
    },
  ];

  await executor.executeCommandSequence(commands, "Clone Repository Workflow");
}

async function executeUpdateRemoteUrlWorkflow(executor: GitCommandExecutor) {
  const currentRemote = await executor.getCurrentRemote();

  let remoteName: string = "origin";

  if (!currentRemote) {
    vscode.window.showErrorMessage(
      "No remote repository found. Please add a remote before updating the URL.",
    );

    const remoteNameInput = await vscode.window.showInputBox({
      prompt: "Enter remote name to add",
      placeHolder: "e.g., origin",
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return "Remote name is required";
        }
        return null;
      },
    });

    if (!remoteNameInput) return;
    remoteName = remoteNameInput;
  }

  const remoteUrl = await vscode.window.showInputBox({
    prompt: "Enter the url of the remote repository",
    placeHolder: "e.g., https://github.com/[user]/repo.git",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Remote url is required";
      }
    },
  });

  if (!remoteUrl) return;

  const commands = [];

  if (!currentRemote) {
    commands.push({
      command: `git remote add ${remoteName} "${remoteUrl}"`,
      description: `Add new remote '${remoteName}' with URL`,
      documentationUrl: "https://git-scm.com/docs/git-remote",
      explanation: `Adds a new remote repository with the specified name and URL. This is useful for connecting your local repository to a remote server for pushing and pulling changes.`,
    });
  } else {
    commands.push({
      command: `git remote set-url origin "${remoteUrl}"`,
      description: "Update remote URL",
      documentationUrl: "https://git-scm.com/docs/git-remote",
      explanation:
        "Updates the URL of the 'origin' remote to the new value. This is useful if the remote repository has moved or if you want to switch between HTTPS and SSH URLs.",
    });
  }

  await executor.executeCommandSequence(
    commands,
    "Add or Update Remote URL Workflow",
  );
}

async function executeAmmedLastCommitWorkflow(executor: GitCommandExecutor) {
  const lastCommit = await executor.getCommits(1);

  if (!lastCommit.length) {
    vscode.window.showInformationMessage("No commits found to amend");
    return;
  }

  const message = await vscode.window.showInputBox({
    prompt: "Enter new commit message",
    placeHolder: "e.g., fix: correct typo in README",
    value: lastCommit[0]?.message || "",
    validateInput: (value) => {
      const validation = GitValidator.validateCommitMessage(value || "");
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid commit message";
      }
      return null;
    },
  });

  if (!message) {
    vscode.window.showInformationMessage(
      "A message is required to amend the last commit",
    );
    return;
  }

  const messageValidation = GitValidator.validateCommitMessage(message);
  if (messageValidation.errorMessage) {
    await vscode.window.showWarningMessage(messageValidation.errorMessage);
  }

  const commands = [
    {
      command: `git commit --amend -m "${message}"`,
      description: "Amend last commit with new message",
      documentationUrl: "https://git-scm.com/docs/git-commit",
      explanation:
        "Replaces the most recent commit with a new one that has the same changes but a different message. This is useful for correcting typos or improving commit messages before pushing.",
    },
  ];

  await executor.executeCommandSequence(commands, "Amend Last Commit Workflow");
}

async function executeApplyStashWorkflow(executor: GitCommandExecutor) {
  const stashes = await executor.getStashList();

  if (stashes.length === 0) {
    vscode.window.showInformationMessage("No stashes found");
    return;
  }

  interface StashItem {
    label: string;
    description: string;
    detail: string;
    hash: string;
  }

  const mappedStashes: StashItem[] = stashes.map((s) => ({
    label: s.id,
    description: s.message,
    detail: "",
    hash: s.id,
  }));

  const selected = await vscode.window.showQuickPick(mappedStashes, {
    placeHolder: "Select a stash to apply",
    matchOnDescription: true,
  });

  if (!selected) return;

  const commands = [
    {
      command: `git stash apply ${selected.hash}`,
      description: `Apply stash ${selected.hash}: ${selected.description}`,
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Applies the changes from the selected stash to your working directory without removing it from the stash list.",
    },
  ];

  await executor.executeCommandSequence(commands, "Apply Stash Workflow");
}

async function executePopStashWorkflow(executor: GitCommandExecutor) {
  const stashes = await executor.getStashList();

  const lastStash = stashes[0];

  if (stashes.length === 0 || !lastStash) {
    vscode.window.showInformationMessage("No stashes found");
    return;
  }

  const commands = [
    {
      command: `git stash pop ${lastStash.id}`,
      description: `Pop stash ${lastStash.id}: ${lastStash.message}`,
      documentationUrl: "https://git-scm.com/docs/git-stash",
      explanation:
        "Applies the changes from the selected stash to your working directory and removes it from the stash list.",
    },
  ];

  await executor.executeCommandSequence(commands, "Pop Stash Workflow");
}

async function executeCreateAndPushTagWorkflow(executor: GitCommandExecutor) {
  const tagName = await vscode.window.showInputBox({
    prompt: "Enter tag name",
    placeHolder: "e.g., v1.0.0",
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "Tag name is required";
      }
      const validation = GitValidator.validateVersionTag(value);
      if (!validation.isValid) {
        return validation.errorMessage || "Invalid tag format";
      }
      return null;
    },
  });

  if (!tagName) return;

  const pushTag = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: `Do you want to push the tag '${tagName}' to remote?`,
  });

  const commands = [
    {
      command: `git tag -a ${tagName} -m "Tagging version ${tagName}"`,
      description: `Create annotated tag '${tagName}'`,
      documentationUrl: "https://git-scm.com/docs/git-tag",
      explanation:
        "Creates an annotated tag with the specified name and message, marking a specific point in history as important (e.g., a release).",
    },
  ];

  if (pushTag === "Yes") {
    commands.push({
      command: `git push origin ${tagName}`,
      description: `Push tag '${tagName}' to remote`,
      documentationUrl: "https://git-scm.com/docs/git-push",
      explanation:
        "Uploads the specified tag to the remote repository, making it available to others.",
    });
  }

  await executor.executeCommandSequence(commands, "Create & Push Tag Workflow");
}

async function executeDeleteTagWorkflow(executor: GitCommandExecutor) {
  const tags = await executor.getTags();

  if (tags.length === 0) {
    vscode.window.showInformationMessage("No tags found");
    return;
  }

  const selectedTag = await vscode.window.showQuickPick(tags, {
    placeHolder: "Select a tag to delete",
  });

  if (!selectedTag) return;

  const deleteRemote = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: `Do you want to delete the tag '${selectedTag}' from remote as well?`,
  });

  const commands = [
    {
      command: `git tag -d ${selectedTag}`,
      description: `Delete local tag '${selectedTag}'`,
      documentationUrl: "https://git-scm.com/docs/git-tag",
      explanation:
        "Deletes the specified tag from your local repository. This does not affect the remote repository.",
    },
  ];

  if (deleteRemote === "Yes") {
    commands.push({
      command: `git push origin --delete ${selectedTag}`,
      description: `Delete remote tag '${selectedTag}'`,
      documentationUrl: "https://git-scm.com/docs/git-push",
      explanation:
        "Deletes the specified tag from the remote repository, making it unavailable to others.",
    });
  }

  await executor.executeCommandSequence(commands, "Delete Tag Workflow");
}

export {
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
  executeSyncFromBranchWorkflow,
  executeSwitchBranchWorkflow,
  executeInitializeRepositoryWorkflow,
  executeCloneRepositoryWorkflow,
  executeUpdateRemoteUrlWorkflow,
  executeAmmedLastCommitWorkflow,
  executeApplyStashWorkflow,
  executePopStashWorkflow,
  executeCreateAndPushTagWorkflow,
  executeDeleteTagWorkflow,
};

import * as vscode from "vscode";
import { CategoryItem } from "../items/category.item";

export class WorkflowItem extends vscode.TreeItem {
  public readonly detailedDescription: string | undefined;

  constructor(
    public readonly label: string,
    public readonly workflowType: string,
    public readonly description: string,
    detailedDescription?: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None,
  ) {
    super(label, collapsibleState);
    this.detailedDescription = detailedDescription;
    this.description = description;
    this.tooltip = detailedDescription || description;
    this.contextValue = "workflowItem";
    this.command = {
      command: "gitWorkflow.executeWorkflow",
      title: "Execute Workflow",
      arguments: [this],
    };
  }

  iconPath = new vscode.ThemeIcon("git-branch");
}

type TreeNode = CategoryItem<WorkflowItem> | WorkflowItem;

export class WorkflowTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeNode | undefined | null | void
  > = new vscode.EventEmitter<TreeNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeNode | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): Thenable<TreeNode[]> {
    if (!element) {
      // Root return categories
      return Promise.resolve([
        new CategoryItem("Setup", [
          new WorkflowItem(
            "Intialize Repository",
            "init",
            "Initialize a new Git repository",
            "Sets up a new Git repository in the current directory. " +
              "This is the first step to start tracking your project with Git.",
          ),
          new WorkflowItem(
            "Clone Repository",
            "clone",
            "Clone an existing repository",
            "Clones an existing Git repository from a remote URL. " +
              "This is the first step to start working on an existing project.",
          ),
          new WorkflowItem(
            "Update remote URL",
            "updateRemote",
            "Update the remote URL of your repository",
          ),
        ]),
        new CategoryItem("Branching", [
          new WorkflowItem(
            "Feature Branch",
            "feature",
            "Create a new feature branch",
            "Creates a new feature branch from a base branch (typically main or develop). " +
              "This workflow switches to the base branch, pulls latest changes, then creates and switches to the new feature branch. " +
              "Use this when starting work on a new feature.",
          ),
          new WorkflowItem(
            "Create & Switch Branch",
            "createSwitchBranch",
            "Create and switch to new branch",
            "Quickly creates a new branch and switches to it. Simpler than the feature branch workflow " +
              "when you don't need to update from a base branch first.",
          ),
          new WorkflowItem(
            "Switch Branch",
            "switchBranch",
            "Switch to any branch",
            "Quickly switching to any branch. Simpler than the feature branch workflow " +
              "when you don't need to update from a base branch first.",
          ),
          new WorkflowItem(
            "Pull",
            "pull",
            "Pull latest changes from remote",
            "Fetches and merges the latest changes from the remote repository into the current branch.",
          ),
        ]),
        new CategoryItem("Committing", [
          new WorkflowItem(
            "Commit & Push",
            "commitPush",
            "Stage, commit, and push changes",
            "Stages all changes, creates a commit with your message, and pushes to the remote repository. " +
              "This is the most common workflow for saving and sharing your work.",
          ),
          new WorkflowItem(
            "Amend Last Commit",
            "amendLastCommit",
            "Ammend last commit with or without changes the message",
            "Amends the last commit. You can choose to amend with or without changes, and optionally edit the commit message. " +
              "Use this to quickly fix the last commit or update its message. Be cautious when amending commits that have been pushed.",
          ),
        ]),
        new CategoryItem("Merging", [
          new WorkflowItem(
            "Merge Branch",
            "merge",
            "Merge another branch into current",
            "Merges another branch into your current branch. You can choose different merge strategies: " +
              "regular merge, no fast-forward (creates merge commit), or squash (combines all commits into one).",
          ),
          new WorkflowItem(
            "Pull Rebase",
            "pullRebase",
            "Pull changes with rebase",
            "Fetches the latest changes from the remote and rebases your local commits on top. " +
              "This keeps a linear history and avoids merge commits. Use this to update your branch with latest changes.",
          ),
          new WorkflowItem(
            "Cherry-Pick",
            "cherryPick",
            "Apply a specific commit to current branch",
            "Applies the changes from a specific commit to your current branch without merging the entire branch. " +
              "Useful when you need just one commit from another branch.",
          ),
        ]),
        new CategoryItem("Stashing", [
          new WorkflowItem(
            "Stash & Switch",
            "stash",
            "Stash changes and switch branch",
            "Saves your uncommitted changes temporarily and switches to another branch. " +
              "You can optionally apply the stashed changes to the new branch. Useful when you need to switch tasks quickly.",
          ),
          new WorkflowItem(
            "Apply Stash",
            "applyStash",
            "Apply stashed changes to current branch",
          ),
          new WorkflowItem(
            "Pop Stash",
            "popStash",
            "Apply stashed changes and remove from stash list",
          ),
        ]),
        new CategoryItem("Rebasing", [
          new WorkflowItem(
            "Interactive Rebase",
            "interactiveRebase",
            "Rebase with commit editing",
            "Opens an interactive editor to reorder, edit, squash, or drop commits. " +
              "Powerful tool for cleaning up your commit history before pushing. Only use on local commits!",
          ),
        ]),
        new CategoryItem("Hotfixes & Releases", [
          new WorkflowItem(
            "Hotfix",
            "hotfix",
            "Create a hotfix branch",
            "Creates a hotfix branch from the main/production branch for urgent fixes. " +
              "This workflow ensures you start from the latest production code.",
          ),
          new WorkflowItem(
            "Release",
            "release",
            "Prepare a new release",
            "Creates a release branch from develop and tags it with a version number. " +
              "Use this when preparing a new version for deployment.",
          ),
        ]),
        new CategoryItem("Undo & History", [
          new WorkflowItem(
            "Undo Commit",
            "undo",
            "Undo the last commit",
            "Undoes the last commit with different options: soft (keeps changes staged), " +
              "mixed (keeps changes unstaged), or hard (discards all changes). Use with caution!",
          ),
          new WorkflowItem(
            "Revert Commit",
            "revert",
            "Revert a specific commit",
            "Creates a new commit that undoes the changes from a specific commit. " +
              "This is safer than deleting commits as it preserves history. Use for reverting commits that have been pushed.",
          ),
        ]),
        new CategoryItem("Tags", [
          new WorkflowItem(
            "Create Tag",
            "createAndPushTag",
            "Create a new tag and push it to remote",
            "Creates a new Git tag at the current commit. " +
              "Tags are useful for marking release points (e.g., v1.0) or important milestones in your history.",
          ),
          new WorkflowItem(
            "Delete Tag",
            "deleteTag",
            "Delete an existing tag",
            "Deletes a Git tag from the local repository. " +
              "Use this to clean up tags that are no longer needed. Be cautious when deleting tags that have been pushed.",
          ),
        ]),
      ]);
    }

    if (element instanceof CategoryItem) {
      // return the category's children based on the category label
      return Promise.resolve(element.children);
    }

    return Promise.resolve([]);
  }
}

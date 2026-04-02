import * as vscode from 'vscode';

export class WorkflowItem extends vscode.TreeItem {
    public readonly detailedDescription: string | undefined;

    constructor(
        public readonly label: string,
        public readonly workflowType: string,
        public readonly description: string,
        detailedDescription?: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(label, collapsibleState);
        this.detailedDescription = detailedDescription;
        this.description = description;
        this.tooltip = detailedDescription || description;
        this.contextValue = 'workflowItem';
        this.command = {
            command: 'gitWorkflow.executeWorkflow',
            title: 'Execute Workflow',
            arguments: [this]
        };
    }

    iconPath = new vscode.ThemeIcon('git-branch');
}

export class WorkflowTreeProvider implements vscode.TreeDataProvider<WorkflowItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkflowItem | undefined | null | void> = new vscode.EventEmitter<WorkflowItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkflowItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: WorkflowItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: WorkflowItem): Thenable<WorkflowItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const workflows: WorkflowItem[] = [
            new WorkflowItem(
                'Feature Branch',
                'feature',
                'Create a new feature branch',
                'Creates a new feature branch from a base branch (typically main or develop). ' +
                'This workflow switches to the base branch, pulls latest changes, then creates and switches to the new feature branch. ' +
                'Use this when starting work on a new feature.'
            ),
             new WorkflowItem(
                'Commit',
                'commit',
                'Commit yout changes',
                'Creates a commit with your message ' +
                'This is the most common workflow for saving your work.'
            ),
            new WorkflowItem(
                'Commit & Push',
                'commitPush',
                'Stage, commit, and push changes',
                'Stages all changes, creates a commit with your message, and pushes to the remote repository. ' +
                'This is the most common workflow for saving and sharing your work.'
            ),
            new WorkflowItem(
                'Pull Rebase',
                'pullRebase',
                'Pull changes with rebase',
                'Fetches the latest changes from the remote and rebases your local commits on top. ' +
                'This keeps a linear history and avoids merge commits. Use this to update your branch with latest changes.'
            ),
            new WorkflowItem(
                'Merge Branch',
                'merge',
                'Merge another branch into current',
                'Merges another branch into your current branch. You can choose different merge strategies: ' +
                'regular merge, no fast-forward (creates merge commit), or squash (combines all commits into one).'
            ),
             new WorkflowItem(
                'Stash',
                'stashOnly',
                'Stash your changes without switching',
                'Saves your uncommitted changes temporarily. ' +
                'You can optionally apply the stashed changes to the new branch. Useful when you need to switch tasks quickly.'
            ),
            new WorkflowItem(
                'Stash & Switch',
                'stash',
                'Stash changes and switch branch',
                'Saves your uncommitted changes temporarily and switches to another branch. ' +
                'You can optionally apply the stashed changes to the new branch. Useful when you need to switch tasks quickly.'
            ),
            new WorkflowItem(
                'Hotfix',
                'hotfix',
                'Create a hotfix branch',
                'Creates a hotfix branch from the main/production branch for urgent fixes. ' +
                'This workflow ensures you start from the latest production code.'
            ),
            new WorkflowItem(
                'Release',
                'release',
                'Prepare a new release',
                'Creates a release branch from develop and tags it with a version number. ' +
                'Use this when preparing a new version for deployment.'
            ),
            new WorkflowItem(
                'Undo Commit',
                'undo',
                'Undo the last commit',
                'Undoes the last commit with different options: soft (keeps changes staged), ' +
                'mixed (keeps changes unstaged), or hard (discards all changes). Use with caution!'
            ),
            new WorkflowItem(
                'Cherry-Pick',
                'cherryPick',
                'Apply a specific commit to current branch',
                'Applies the changes from a specific commit to your current branch without merging the entire branch. ' +
                'Useful when you need just one commit from another branch.'
            ),
            new WorkflowItem(
                'Revert Commit',
                'revert',
                'Revert a specific commit',
                'Creates a new commit that undoes the changes from a specific commit. ' +
                'This is safer than deleting commits as it preserves history. Use for reverting commits that have been pushed.'
            ),
            new WorkflowItem(
                'Interactive Rebase',
                'interactiveRebase',
                'Rebase with commit editing',
                'Opens an interactive editor to reorder, edit, squash, or drop commits. ' +
                'Powerful tool for cleaning up your commit history before pushing. Only use on local commits!'
            ),
            new WorkflowItem(
                'Create & Switch Branch',
                'createSwitchBranch',
                'Create and switch to new branch',
                'Quickly creates a new branch and switches to it. Simpler than the feature branch workflow ' +
                'when you don\'t need to update from a base branch first.'
            ),
             new WorkflowItem(
                'Switch Branch',
                'switchBranch',
                'Switch to any branch',
                'Quickly switching to any branch. Simpler than the feature branch workflow ' +
                'when you don\'t need to update from a base branch first.'
            )
        ];

        return Promise.resolve(workflows);
    }
}

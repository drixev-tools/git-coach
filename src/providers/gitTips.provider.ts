import * as vscode from 'vscode';
import { GitTip, TipItem } from '../items/tip.item';
import { CategoryItem } from '../items/category.item';

export class GitTipsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private tips: GitTip[] = [
        {
            category: 'Commits',
            title: 'Write Good Commit Messages',
            description: 'Best practices for commit messages',
            details: 'A good commit message should:\n\n' +
                '• Use imperative mood ("Add feature" not "Added feature")\n' +
                '• Keep the subject line under 72 characters\n' +
                '• Separate subject from body with a blank line\n' +
                '• Explain what and why, not how\n' +
                '• Reference issues or tickets when applicable\n\n' +
                'Example:\n' +
                'feat: add user authentication\n\n' +
                'Implement OAuth2 login flow with Google and GitHub providers.\n' +
                'This allows users to sign in without creating a new account.',
            documentationUrl: 'https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines'
        },
        {
            category: 'Commits',
            title: 'Atomic Commits',
            description: 'Make small, focused commits',
            details: 'An atomic commit is a commit that:\n\n' +
                '• Contains only related changes\n' +
                '• Can be applied or reverted independently\n' +
                '• Has a clear, single purpose\n' +
                '• Makes the codebase better after being applied\n\n' +
                'Benefits:\n' +
                '• Easier to review\n' +
                '• Easier to revert if needed\n' +
                '• Better git history\n' +
                '• Easier to debug issues'
        },
        {
            category: 'Branches',
            title: 'Branch Naming Conventions',
            description: 'Follow consistent naming patterns',
            details: 'Common branch naming patterns:\n\n' +
                '• feature/description - New features\n' +
                '• bugfix/description - Bug fixes\n' +
                '• hotfix/description - Urgent production fixes\n' +
                '• release/version - Release preparation\n' +
                '• refactor/description - Code refactoring\n\n' +
                'Tips:\n' +
                '• Use lowercase\n' +
                '• Use hyphens to separate words\n' +
                '• Be descriptive but concise\n' +
                '• Include ticket numbers if applicable'
        },
        {
            category: 'Branches',
            title: 'Keep Branches Up to Date',
            description: 'Regularly sync with main branch',
            details: 'To keep your branch current:\n\n' +
                '1. Fetch latest changes:\n' +
                '   git fetch origin\n\n' +
                '2. Rebase your branch:\n' +
                '   git rebase origin/main\n\n' +
                'Or merge:\n' +
                '   git merge origin/main\n\n' +
                'Benefits:\n' +
                '• Reduces merge conflicts\n' +
                '• Keeps history clean\n' +
                '• Easier code review\n' +
                '• Catches integration issues early'
        },
        {
            category: 'Merges',
            title: 'Merge vs Rebase',
            description: 'When to use each strategy',
            details: 'Merge:\n' +
                '• Preserves complete history\n' +
                '• Shows when branches diverged\n' +
                '• Safe for shared branches\n' +
                '• Creates merge commits\n\n' +
                'Rebase:\n' +
                '• Creates linear history\n' +
                '• Cleaner commit graph\n' +
                '• Rewrites commit history\n' +
                '• Use only on local branches\n\n' +
                'Best Practice:\n' +
                '• Merge for shared/public branches\n' +
                '• Rebase for local feature branches before merging'
        },
        {
            category: 'Merges',
            title: 'Resolving Merge Conflicts',
            description: 'How to handle conflicts',
            details: 'When conflicts occur:\n\n' +
                '1. Identify conflicted files:\n' +
                '   git status\n\n' +
                '2. Open files and look for conflict markers:\n' +
                '   <<<<<<< HEAD\n' +
                '   Your changes\n' +
                '   =======\n' +
                '   Incoming changes\n' +
                '   >>>>>>> branch-name\n\n' +
                '3. Resolve conflicts manually\n\n' +
                '4. Stage resolved files:\n' +
                '   git add <file>\n\n' +
                '5. Complete the merge:\n' +
                '   git commit\n\n' +
                'Or abort:\n' +
                '   git merge --abort'
        },
        {
            category: 'Workflow',
            title: 'Git Workflow Best Practices',
            description: 'Effective Git workflow patterns',
            details: 'Common workflows:\n\n' +
                'Git Flow:\n' +
                '• main - production code\n' +
                '• develop - integration branch\n' +
                '• feature/* - new features\n' +
                '• release/* - release preparation\n' +
                '• hotfix/* - urgent fixes\n\n' +
                'GitHub Flow:\n' +
                '• main - always deployable\n' +
                '• feature/* - short-lived branches\n' +
                '• Merge via pull requests\n\n' +
                'Choose based on:\n' +
                '• Team size\n' +
                '• Release frequency\n' +
                '• Project complexity'
        },
        {
            category: 'Workflow',
            title: 'Before Pushing',
            description: 'Checklist before pushing code',
            details: 'Before pushing your code:\n\n' +
                '✓ Review your changes: git diff\n' +
                '✓ Check status: git status\n' +
                '✓ Run tests\n' +
                '✓ Ensure commits are logical\n' +
                '✓ Write meaningful commit messages\n' +
                '✓ Pull latest changes first\n' +
                '✓ Resolve any conflicts\n\n' +
                'Commands:\n' +
                'git status\n' +
                'git log --oneline -5\n' +
                'git diff origin/main'
        },
        {
            category: 'Advanced',
            title: 'Interactive Rebase',
            description: 'Clean up your commit history',
            details: 'Interactive rebase lets you:\n\n' +
                '• Reword commit messages\n' +
                '• Combine (squash) commits\n' +
                '• Reorder commits\n' +
                '• Remove commits\n' +
                '• Edit commits\n\n' +
                'Usage:\n' +
                'git rebase -i HEAD~3\n\n' +
                'Commands in editor:\n' +
                '• pick - use commit\n' +
                '• reword - change message\n' +
                '• edit - modify commit\n' +
                '• squash - combine with previous\n' +
                '• drop - remove commit\n\n' +
                'Warning: Only rebase local commits!'
        },
        {
            category: 'Advanced',
            title: 'Stashing Changes',
            description: 'Temporarily save uncommitted work',
            details: 'Stash is useful when:\n\n' +
                '• You need to switch branches\n' +
                '• You want to pull latest changes\n' +
                '• You\'re not ready to commit\n\n' +
                'Commands:\n' +
                'git stash - Save changes\n' +
                'git stash save "message" - Save with message\n' +
                'git stash list - View stashes\n' +
                'git stash pop - Apply and remove\n' +
                'git stash apply - Apply but keep stash\n' +
                'git stash drop - Delete stash\n' +
                'git stash clear - Remove all stashes'
        }
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element instanceof CategoryItem) {
            const categoryTips = this.tips.filter(tip => tip.category === element.category);
            return Promise.resolve(categoryTips.map(tip => new TipItem(tip)));
        }

        if (element) {
            return Promise.resolve([]);
        }

        const categories = Array.from(new Set(this.tips.map(tip => tip.category)));
        const categoryItems = categories.map(category => {
            const categoryTips = this.tips.filter(tip => tip.category === category);
            return new CategoryItem(category, categoryTips);
        });

        return Promise.resolve(categoryItems);
    }
}

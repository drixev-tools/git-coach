export interface ErrorInfo {
    message: string;
    suggestions: string[];
    errorType: string;
}

export class ErrorHelper {
    static parseGitError(error: any): ErrorInfo {
        const errorMessage = typeof error === 'string' ? error : (error.message || error.stderr || String(error));
        const lowerMessage = errorMessage.toLowerCase();

        if (lowerMessage.includes('not a git repository') || lowerMessage.includes('not a git repo')) {
            return {
                message: 'Not a Git Repository',
                suggestions: [
                    'Initialize a Git repository: git init',
                    'Navigate to a folder that contains a Git repository',
                    'Check if you are in the correct directory'
                ],
                errorType: 'not_a_repository'
            };
        }

        if (lowerMessage.includes('branch already exists') || lowerMessage.includes('already exists')) {
            return {
                message: 'Branch Already Exists',
                suggestions: [
                    'Switch to the existing branch: git checkout <branch-name>',
                    'Delete the branch if you want to recreate it: git branch -d <branch-name>',
                    'Use a different branch name'
                ],
                errorType: 'branch_exists'
            };
        }

        if (lowerMessage.includes('merge conflict') || lowerMessage.includes('conflicts') || lowerMessage.includes('unmerged paths')) {
            return {
                message: 'Merge Conflicts Detected',
                suggestions: [
                    'View conflicts: git status',
                    'Resolve conflicts manually in the affected files',
                    'After resolving, stage files: git add <file>',
                    'Complete the merge: git commit',
                    'Abort the merge: git merge --abort'
                ],
                errorType: 'merge_conflict'
            };
        }

        if (lowerMessage.includes('your local changes') && lowerMessage.includes('would be overwritten')) {
            return {
                message: 'Local Changes Would Be Overwritten',
                suggestions: [
                    'Stash your changes: git stash',
                    'Commit your changes: git commit',
                    'Discard changes (careful!): git checkout -- <file>',
                    'Switch after stashing: git stash && git checkout <branch>'
                ],
                errorType: 'local_changes_conflict'
            };
        }

        if (lowerMessage.includes('nothing to commit') || lowerMessage.includes('no changes added to commit')) {
            return {
                message: 'Nothing to Commit',
                suggestions: [
                    'Check status: git status',
                    'Stage files first: git add <file> or git add .',
                    'Verify you have changes to commit'
                ],
                errorType: 'nothing_to_commit'
            };
        }

        if (lowerMessage.includes('authentication failed') || lowerMessage.includes('permission denied') || lowerMessage.includes('access denied')) {
            return {
                message: 'Authentication Failed',
                suggestions: [
                    'Check your Git credentials: git config --list',
                    'Update credentials: git config --global user.name "Your Name"',
                    'Set up SSH keys or use credential helper',
                    'Verify remote URL: git remote -v'
                ],
                errorType: 'authentication_failed'
            };
        }

        if (lowerMessage.includes('remote repository not found') || lowerMessage.includes('repository not found')) {
            return {
                message: 'Remote Repository Not Found',
                suggestions: [
                    'Check remote URL: git remote -v',
                    'Verify the repository exists and you have access',
                    'Update remote URL: git remote set-url origin <new-url>',
                    'Create the repository on your Git hosting service first'
                ],
                errorType: 'remote_not_found'
            };
        }

        if (lowerMessage.includes('cannot lock ref') || lowerMessage.includes('ref is at')) {
            return {
                message: 'Reference Lock Error',
                suggestions: [
                    'Another Git operation may be in progress',
                    'Wait a moment and try again',
                    'Check for other Git processes: git status',
                    'If stuck, remove lock file: rm .git/index.lock (use with caution)'
                ],
                errorType: 'ref_lock'
            };
        }

        if (lowerMessage.includes('fatal: not a valid object name') || lowerMessage.includes('bad revision')) {
            return {
                message: 'Invalid Reference',
                suggestions: [
                    'Check if the branch/commit exists: git branch -a',
                    'Verify commit hash is correct',
                    'Fetch latest changes: git fetch origin',
                    'List available branches: git branch'
                ],
                errorType: 'invalid_reference'
            };
        }

        if (lowerMessage.includes('cannot rebase') && lowerMessage.includes('uncommitted changes')) {
            return {
                message: 'Cannot Rebase with Uncommitted Changes',
                suggestions: [
                    'Stash changes: git stash',
                    'Commit changes: git commit',
                    'Discard changes: git reset --hard HEAD (careful!)',
                    'After stashing, retry the rebase'
                ],
                errorType: 'rebase_uncommitted'
            };
        }

        if (lowerMessage.includes('push rejected') || lowerMessage.includes('failed to push')) {
            return {
                message: 'Push Rejected',
                suggestions: [
                    'Pull latest changes first: git pull origin <branch>',
                    'Force push (use with caution): git push --force',
                    'Check if you have write permissions to the repository',
                    'Verify you are pushing to the correct branch'
                ],
                errorType: 'push_rejected'
            };
        }

        // Generic error fallback
        return {
            message: 'Git Operation Failed',
            suggestions: [
                'Check Git status: git status',
                'Review the error message above for details',
                'Verify you are in a Git repository: git rev-parse --git-dir',
                'Check Git configuration: git config --list',
                'Consult Git documentation for the specific command'
            ],
            errorType: 'generic'
        };
    }

    static getErrorSuggestions(errorType: string): string[] {
        const errorInfo = this.parseGitError({ message: '', errorType });
        return errorInfo.suggestions;
    }

    static formatErrorForDisplay(errorInfo: ErrorInfo): string {
        let formatted = `\n❌ ${errorInfo.message}\n`;
        formatted += `${'─'.repeat(60)}\n`;
        formatted += `\n💡 Suggestions:\n\n`;
        
        errorInfo.suggestions.forEach((suggestion, index) => {
            formatted += `  ${index + 1}. ${suggestion}\n`;
        });
        
        formatted += `\n${'─'.repeat(60)}\n`;
        
        return formatted;
    }
}

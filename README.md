# Git Coach for VS Code

Hi dude! What is this?

A powerful VS Code extension that makes Git workflows transparent and efficient by showing you the exact commands being executed for each workflow.

## Features

### Transparent Command Execution
- See exactly what Git commands will be executed before they run
- Understand what each command does with clear descriptions
- Learn Git while using the extension

### Pre-built Workflows
1. **Feature Branch** - Create feature branches with proper base branch setup
2. **Commit** - Stage, commit, and push in one workflow
3. **Commit & Push** - Stage, commit, and push in one workflow
4. **Pull Rebase** - Pull changes with rebase instead of merge
5. **Merge Branch** - Merge branches with different strategies
6. **Stash** - Stash changes only
7. **Stash & Switch** - Stash changes and switch branches seamlessly
8. **Hotfix** - Create hotfix branches from production
9. **Release** - Prepare release branches with tags
10. **Undo Commit** - Safely undo commits with different reset options
11. **cherry-pick** - Apply a specific commit
12. **Revert Commit** - Revert a specific commit
13. **Interactive Rebase** - Rebase with commit editing
14. **Create & Switch Branch** - Create and switch to new branch
15. **Change Branch** - Switch to another branch without stashing
16. **Sync from Branch** - Get latest changes from another branch into current

### Command History
- Track all executed Git commands
- Copy previous commands
- Review command descriptions and timestamps
- Clear history when needed

### Interactive UI
- Sidebar with clickable workflows
- Command palette integration
- Quick pick menus for selections
- Real-time output in dedicated channel

## Usage

### Accessing Workflows

#### Method 1: Sidebar
1. Click the Git Coach icon in the Activity Bar
2. Click on any workflow to execute it

#### Method 2: Command Palette
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Git Coach" or "glc: {command}"
3. Select your desired workflow

### Example: Feature Branch Workflow

1. Click "Feature Branch" in the sidebar
2. Enter your feature name (e.g., `add-login-page`)
3. Optionally specify a base branch (e.g., `develop`)
4. Review the commands that will be executed:
   ```
   1. Switch to base branch 'develop'
      $ git checkout develop
   
   2. Update base branch with latest changes
      $ git pull origin develop
   
   3. Create and switch to new feature branch
      $ git checkout -b feature/add-login-page
   ```
5. Click "Execute" to run the workflow

### Example: Commit & Push Workflow

1. Select "Commit & Push"
2. Enter your commit message
3. The extension will:
   - Stage all changes (`git add .`)
   - Commit with your message
   - Push to the current branch

### Command Preview

Before any workflow executes, you'll see:
- A numbered list of commands
- Description of what each command does
- Options to Execute, Show Details, or Cancel

## Learning Git

This extension is designed to help you learn Git by:

1. **Showing commands** - See the actual Git commands being used
2. **Explaining actions** - Each command has a clear description
3. **Building muscle memory** - Repeat workflows to learn patterns
4. **Command history** - Review what you've done

### Tips for Learning

- Pay attention to command descriptions
- Check the Output channel to see command results
- Review your command history regularly
- Try executing the commands manually in terminal after using the extension

## License

Copyright (c) 2026 drixev. All rights reserved.

This extension is free to install and use. You may not copy, modify, redistribute, or reverse engineer it. See [LICENSE.md](LICENSE.md) for full terms.

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Git Documentation](https://git-scm.com/doc)
- [Pro Git Book](https://git-scm.com/book/en/v2)

## Show Your Support

If you find this extension helpful:
- Star the repository
- Share with other developers
- Submit feedback and suggestions

---

**Happy Git-ing!**

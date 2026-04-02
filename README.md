# Git Workflow Assistant for VS Code

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

## Installation

### From Source

1. Clone this repository:
```bash
git clone <your-repo-url>
cd git-workflow-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Compile the extension:
```bash
npm run compile
```

4. Open in VS Code:
```bash
code .
```

5. Press `F5` to run the extension in development mode

### Package as VSIX

```bash
npm install -g vsce
vsce package
```

Then install the `.vsix` file in VS Code: Extensions → ... → Install from VSIX

## Usage

### Accessing Workflows

#### Method 1: Sidebar
1. Click the Git Workflows icon in the Activity Bar
2. Click on any workflow to execute it

#### Method 2: Command Palette
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Git Workflow"
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

## Configuration

Open Settings (`Ctrl+,`) and search for "Git Workflow":

### Available Settings

```json
{
  // Show commands before execution
  "gitWorkflow.autoShowCommands": true,
  
  // Confirm before executing workflows
  "gitWorkflow.confirmBeforeExecute": true,
  
  // Save executed commands to history
  "gitWorkflow.saveCommandHistory": true
}
```

## Workflow Details

### Feature Branch
```bash
git checkout <base-branch>      # Switch to base
git pull origin <base-branch>   # Update base
git checkout -b feature/<name>  # Create feature branch
```

### Commit & Push
```bash
git add .                       # Stage all changes
git commit -m "<message>"       # Commit
git push origin <branch>        # Push to remote
```

### Pull Rebase
```bash
git fetch origin                # Fetch updates
git rebase origin/<branch>      # Rebase on remote
```

### Merge Branch
```bash
git merge [--no-ff|--squash] <branch>  # Merge with strategy
```

### Stash & Switch
```bash
git stash save "<message>"      # Stash changes
git checkout <branch>           # Switch branch
git stash pop                   # Optional: apply stash
```

### Hotfix
```bash
git checkout main               # Switch to production
git pull origin main            # Update production
git checkout -b hotfix/<version>  # Create hotfix
```

### Release
```bash
git checkout develop            # Switch to develop
git pull origin develop         # Update develop
git checkout -b release/<version>  # Create release
git tag -a v<version> -m "..."  # Tag release
```

### Undo Commit
```bash
# Soft: keep changes staged
git reset --soft HEAD~1

# Mixed: keep changes unstaged
git reset --mixed HEAD~1

# Hard: discard all changes (DANGEROUS!)
git reset --hard HEAD~1
```

### Cherry Pick
```bash
git cherry-pick 12345 # HASH: 12345...
```

### Revert
```bash
git revert 12345 # HASH: 12345...
```

### Interactive Rebase
```bash
# Using HEAD
git rebase -i HEAD~3

# Using branch
git rebase -i branch-name
```

### Create and Switch
```bash
git checkout -b branch-name
```

### Switch branch Only
```bash
git checkout branch-name # change branch-name for your branch
```

### Sync From Branch
```bash
git fetch origin # Fetch all refs from remote
# Rebase Strategy
git rebase branch-name
# or Merge Strategy
git merge branch-name
```

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

## Development

### Project Structure

```
git-workflow-extension/
├── src/
│   ├── extension.ts                        # VS Code entry point
│   ├── gitCommandExecutor.ts               # Shell execution engine
│   ├── workflows.ts                        # Workflow definitions
│   ├── items/
│   │   ├── category.item.ts                # Category tree item
│   │   ├── history.item.ts                 # History tree item
│   │   └── tip.item.ts                     # Tip tree item
│   ├── providers/
│   │   ├── commandHistory.provider.ts      # Command History sidebar panel
│   │   ├── gitTips.provider.ts             # Git Tips sidebar panel
│   │   ├── tipContent.provider.ts          # Tip content webview
│   │   └── workflowTree.provider.ts        # Common Workflows sidebar panel
│   ├── utils/
│   │   ├── errorHelper.ts                  # Git error parser
│   │   ├── gitValidator.ts                 # Input & environment guards
│   │   └── i18n.ts                         # Internationalization helper
│   └── locales/
│       ├── en.json                         # English strings
│       └── es.json                         # Spanish strings
├── docs/                                   # Developer & user documentation
├── dist/                                   # Compiled JS output (generated)
├── images/                                 # Extension assets
├── package.json                            # Extension manifest
├── package.nls.json                        # NLS strings (English)
├── package.nls.es.json                     # NLS strings (Spanish)
├── tsconfig.json                           # TypeScript config
└── README.md                               # This file
```

### Building

```bash
npm run compile     # Compile TypeScript
npm run watch       # Watch mode for development
npm run lint        # Run ESLint
```

### Testing

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test workflows in the new window

## Contributing

Contributions are welcome! Here are ways to contribute:

1. **Add new workflows** - Submit PRs with useful Git workflows
2. **Improve descriptions** - Make command explanations clearer
3. **Report bugs** - Open issues for any problems
4. **Request features** - Suggest new workflow ideas

### Adding a New Workflow

1. Add command in `package.json`:
```json
{
  "command": "gitWorkflow.myWorkflow",
  "title": "Git Workflow: My Workflow"
}
```

2. Create workflow function in `extension.ts`:
```typescript
async function executeMyWorkflow(executor: GitCommandExecutor) {
  const commands = [
    {
      command: 'git ...',
      description: 'What this does'
    }
  ];
  await executor.executeCommandSequence(commands, 'My Workflow');
}
```

3. Add to workflow tree provider in `workflowTreeProvider.ts`

## License

Copyright (c) 2026 drixev. All rights reserved.

This extension is free to install and use. You may not copy, modify, redistribute, or reverse engineer it. See [LICENSE.md](LICENSE.md) for full terms.

## Troubleshooting

### Extension doesn't activate
- Make sure you have Git installed
- Open a folder with a Git repository

### Commands fail
- Check Git is in your PATH
- Verify you're in a Git repository
- Review error messages in Output channel

### Command history not saving
- Check `gitWorkflow.saveCommandHistory` setting
- Verify extension has storage permissions

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

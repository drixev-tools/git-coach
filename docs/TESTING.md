# Testing Guide for Git Workflow Assistant

This guide covers how to test the extension during development.

## Testing Checklist

### Pre-Testing Setup

- [ x] Git is installed and accessible (`git --version` works)
- [ x] You have a test Git repository (or create one)
- [ x] Extension compiles without errors (`npm run compile`)
- [ x] No linting errors (`npm run lint`)

### Basic Functionality Tests

#### 1. Extension Activation
- [x ] Extension activates when VS Code starts
- [ x] "Git Workflows" icon appears in Activity Bar
- [ x] No errors in Extension Host console (View → Output → Select "Extension Host")

#### 2. Sidebar Views
- [ x] "Common Workflows" view displays all 8 workflows
- [ x] "Command History" view is accessible
- [ x] Workflow items are clickable
- [ x] Icons display correctly

#### 3. Command Palette
- [ x] All commands appear when typing "Git Workflow"
- [ x] Commands are executable
- [ x] Command titles are clear

### Workflow Tests

For each workflow, test:

#### Feature Branch Workflow
- [ x] Opens input prompt for branch name
- [ x] Validates empty branch name
- [ x] Accepts valid branch name
- [ x] Shows command preview
- [ x] Executes commands successfully
- [ x] Creates feature branch correctly
- [ x] Shows output in channel

#### Commit & Push Workflow
- [ x] Prompts for commit message
- [ x] Validates empty message
- [ x] Stages all changes
- [ x] Creates commit
- [ x] Pushes to remote
- [ x] Handles push errors gracefully

#### Pull Rebase Workflow
- [ x] Fetches from remote
- [ x] Rebases current branch
- [ x] Handles conflicts (if any)
- [ x] Shows clear output

#### Merge Branch Workflow
- [x ] Lists available branches
- [ x] Allows selecting merge strategy
- [x ] Executes merge correctly
- [ x] Handles merge conflicts

#### Stash & Switch Workflow
- [ x] Prompts for stash message (optional)
- [ x] Lists available branches
- [ x] Stashes changes
- [ x] Switches branch
- [ x] Optionally applies stash

#### Hotfix Workflow
- [ x] Prompts for version
- [ x] Validates version input
- [ x] Switches to main
- [ x] Creates hotfix branch

#### Release Workflow
- [x ] Prompts for version
- [x ] Creates release branch
- [x ] Creates version tag
- [ x] Validates tag creation

#### Undo Commit Workflow
- [ ] Shows reset options
- [ ] Executes soft reset correctly
- [ ] Executes mixed reset correctly
- [ ] Warns about hard reset (destructive)

### Error Handling Tests

#### No Git Repository
- [ x] Shows error when not in Git repo
- [ x] Error message is clear and actionable
- [ x] Extension doesn't crash

#### Git Not Installed
- [ x] Handles missing Git gracefully
- [ x] Shows helpful error message
- [ x] Suggests installation

#### Command Failures
- [ x] Shows error in output channel
- [ ] Displays retry/continue/stop options
- [ ] Allows workflow continuation
- [ ] Allows workflow cancellation
- [ ] Retry works correctly

#### Invalid Inputs
- [ ] Rejects empty branch names
- [ ] Rejects empty commit messages
- [ ] Shows validation errors clearly

### Command History Tests

- [x ] Commands are saved to history
- [x ] History displays in sidebar
- [x ] History items are clickable
- [x ] Copy command works
- [ ] Clear history works
- [ x] History persists after reload
- [ ] History respects max limit (50 commands)

### Configuration Tests

#### Settings
- [ x] `autoShowCommands` setting works
- [ x] `confirmBeforeExecute` setting works
- [ x] `saveCommandHistory` setting works
- [ x] Settings changes take effect immediately

### Output Channel Tests

- [ x] Output channel opens automatically
- [ x] Commands are logged clearly
- [ x] Success messages display
- [ x] Error messages display
- [ x] Output is formatted nicely

## Testing Scenarios

### Scenario 1: Fresh Repository
1. Create a new Git repository
2. Test Feature Branch workflow
3. Make some changes
4. Test Commit & Push workflow
5. Verify commands in history

### Scenario 2: Existing Repository
1. Open an existing Git repository
2. Test all workflows
3. Verify no conflicts with existing branches
4. Check command history

### Scenario 3: Multiple Branches
1. Create several branches
2. Test Merge workflow
3. Test Stash & Switch workflow
4. Verify branch switching works

### Scenario 4: Error Recovery
1. Intentionally cause errors (e.g., merge conflicts)
2. Test error handling
3. Test retry functionality
4. Test workflow cancellation

### Scenario 5: Edge Cases
1. Test with empty repository
2. Test with no remote configured
3. Test with uncommitted changes
4. Test with detached HEAD state

## Debugging Tips

### View Extension Logs

1. **Extension Host Console**:
   - View → Output
   - Select "Extension Host" from dropdown
   - Look for console.log messages

2. **Developer Tools**:
   - Help → Toggle Developer Tools
   - Check Console tab for errors
   - Check Network tab if needed

3. **Output Channel**:
   - View → Output
   - Select "Git Workflow Assistant"
   - See all command execution logs

**Happy Testing!**

Remember: Manual testing is the primary method for VS Code extensions. Automated tests are helpful but not always necessary for UI-heavy extensions.

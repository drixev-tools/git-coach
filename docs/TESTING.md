# Testing Guide for Git Workflow Assistant

This guide covers how to test the extension during development.

## Quick Start Testing

### Method 1: Extension Development Host (Recommended)

1. **Compile the extension**:
   ```bash
   npm run compile
   ```

2. **Open the extension folder in VS Code**:
   ```bash
   code .
   ```

3. **Press F5** (or go to Run → Start Debugging)
   - This opens a new VS Code window called "Extension Development Host"
   - Your extension is loaded in this window

4. **Test in the new window**:
   - The extension should activate automatically
   - Look for the "Git Workflows" icon in the Activity Bar
   - Open a Git repository folder in the new window

### Method 2: Install VSIX Locally

1. **Build the VSIX package**:
   ```bash
   npm run vscode:prepublish
   npx @vscode/vsce package
   ```

2. **Install it**:
   ```bash
   code --install-extension git-workflow-assistant-1.0.0.vsix
   ```

3. **Reload VS Code** and test normally

## Testing Checklist

### Pre-Testing Setup

- [ ] Git is installed and accessible (`git --version` works)
- [ ] You have a test Git repository (or create one)
- [ ] Extension compiles without errors (`npm run compile`)
- [ ] No linting errors (`npm run lint`)

### Basic Functionality Tests

#### 1. Extension Activation
- [ ] Extension activates when VS Code starts
- [ ] "Git Workflows" icon appears in Activity Bar
- [ ] No errors in Extension Host console (View → Output → Select "Extension Host")

#### 2. Sidebar Views
- [ ] "Common Workflows" view displays all 8 workflows
- [ ] "Command History" view is accessible
- [ ] Workflow items are clickable
- [ ] Icons display correctly

#### 3. Command Palette
- [ ] All commands appear when typing "Git Workflow"
- [ ] Commands are executable
- [ ] Command titles are clear

### Workflow Tests

For each workflow, test:

#### Feature Branch Workflow
- [ ] Opens input prompt for branch name
- [ ] Validates empty branch name
- [ ] Accepts valid branch name
- [ ] Shows command preview
- [ ] Executes commands successfully
- [ ] Creates feature branch correctly
- [ ] Shows output in channel

#### Commit & Push Workflow
- [ ] Prompts for commit message
- [ ] Validates empty message
- [ ] Stages all changes
- [ ] Creates commit
- [ ] Pushes to remote
- [ ] Handles push errors gracefully

#### Pull Rebase Workflow
- [ ] Fetches from remote
- [ ] Rebases current branch
- [ ] Handles conflicts (if any)
- [ ] Shows clear output

#### Merge Branch Workflow
- [ ] Lists available branches
- [ ] Allows selecting merge strategy
- [ ] Executes merge correctly
- [ ] Handles merge conflicts

#### Stash & Switch Workflow
- [ ] Prompts for stash message (optional)
- [ ] Lists available branches
- [ ] Stashes changes
- [ ] Switches branch
- [ ] Optionally applies stash

#### Hotfix Workflow
- [ ] Prompts for version
- [ ] Validates version input
- [ ] Switches to main
- [ ] Creates hotfix branch

#### Release Workflow
- [ ] Prompts for version
- [ ] Creates release branch
- [ ] Creates version tag
- [ ] Validates tag creation

#### Undo Commit Workflow
- [ ] Shows reset options
- [ ] Executes soft reset correctly
- [ ] Executes mixed reset correctly
- [ ] Warns about hard reset (destructive)

### Error Handling Tests

#### No Git Repository
- [ ] Shows error when not in Git repo
- [ ] Error message is clear and actionable
- [ ] Extension doesn't crash

#### Git Not Installed
- [ ] Handles missing Git gracefully
- [ ] Shows helpful error message
- [ ] Suggests installation

#### Command Failures
- [ ] Shows error in output channel
- [ ] Displays retry/continue/stop options
- [ ] Allows workflow continuation
- [ ] Allows workflow cancellation
- [ ] Retry works correctly

#### Invalid Inputs
- [ ] Rejects empty branch names
- [ ] Rejects empty commit messages
- [ ] Shows validation errors clearly

### Command History Tests

- [ ] Commands are saved to history
- [ ] History displays in sidebar
- [ ] History items are clickable
- [ ] Copy command works
- [ ] Clear history works
- [ ] History persists after reload
- [ ] History respects max limit (50 commands)

### Configuration Tests

#### Settings
- [ ] `autoShowCommands` setting works
- [ ] `confirmBeforeExecute` setting works
- [ ] `saveCommandHistory` setting works
- [ ] Settings changes take effect immediately

### Output Channel Tests

- [ ] Output channel opens automatically
- [ ] Commands are logged clearly
- [ ] Success messages display
- [ ] Error messages display
- [ ] Output is formatted nicely

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

### Common Issues

#### Extension Doesn't Activate
- Check Extension Host console for errors
- Verify `package.json` has correct `main` entry
- Ensure TypeScript compiled successfully
- Check `activationEvents` in package.json

#### Commands Don't Appear
- Reload the window (Ctrl+R or Cmd+R)
- Check command registration in extension.ts
- Verify package.json commands section

#### Git Commands Fail
- Verify Git is in PATH
- Check you're in a Git repository
- Test commands manually in terminal
- Check output channel for error details

#### UI Doesn't Update
- Refresh tree views manually
- Check if refresh events are firing
- Verify tree data providers are registered

## Automated Testing (Optional)

### Setting Up Unit Tests

1. **Install test dependencies**:
   ```bash
   npm install --save-dev @vscode/test-electron mocha @types/mocha
   ```

2. **Create test folder**:
   ```bash
   mkdir src/test
   ```

3. **Create test file**: `src/test/extension.test.ts`
   ```typescript
   import * as assert from 'assert';
   import * as vscode from 'vscode';

   suite('Extension Tests', () => {
       test('Extension should be present', () => {
           assert.ok(vscode.extensions.getExtension('your-publisher.git-workflow-assistant'));
       });
   });
   ```

4. **Update package.json**:
   ```json
   {
     "scripts": {
       "test": "node ./out/test/runTest.js"
     },
     "devDependencies": {
       "@vscode/test-electron": "^2.x.x",
       "mocha": "^10.x.x",
       "@types/mocha": "^10.x.x"
     }
   }
   ```

5. **Create test runner**: `src/test/runTest.ts`
   ```typescript
   import * as path from 'path';
   import { runTests } from '@vscode/test-electron';

   async function main() {
       const extensionDevelopmentPath = path.resolve(__dirname, '../../');
       const extensionTestsPath = path.resolve(__dirname, './suite/index');

       await runTests({ extensionDevelopmentPath, extensionTestsPath });
   }

   main();
   ```

### Running Tests

```bash
npm test
```

## Performance Testing

- [ ] Extension activates quickly (< 1 second)
- [ ] Commands execute without noticeable delay
- [ ] Tree views load quickly
- [ ] No memory leaks after multiple operations
- [ ] Output channel doesn't slow down with many commands

## Cross-Platform Testing

Test on:
- [ ] Windows
- [ ] macOS
- [ ] Linux

Verify:
- [ ] Path handling works correctly
- [ ] Git commands work on all platforms
- [ ] UI displays correctly
- [ ] Keyboard shortcuts work

## User Acceptance Testing

Have someone else test:
- [ ] Is it intuitive?
- [ ] Are error messages clear?
- [ ] Does it help them learn Git?
- [ ] Are workflows useful?
- [ ] Any missing features?

## Regression Testing

Before each release:
- [ ] Run full test checklist
- [ ] Test all workflows
- [ ] Verify no breaking changes
- [ ] Check backward compatibility

## Continuous Testing

### Pre-Commit Checks
```bash
npm run lint      # Check code quality
npm run compile   # Verify compilation
```

### Before Publishing
```bash
npm run vscode:prepublish  # Prepare for production
npm test                    # Run all tests
vsce package                # Create VSIX
code --install-extension git-workflow-assistant-1.0.0.vsix  # Test locally
```

## Test Data

### Create Test Repository

```bash
# Create a test repo
mkdir test-repo
cd test-repo
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Create initial commit
echo "# Test Repo" > README.md
git add README.md
git commit -m "Initial commit"

# Create a branch
git checkout -b develop

# Open in VS Code
code .
```

## Quick Test Commands

```bash
# Compile and check for errors
npm run compile

# Lint code
npm run lint

# Watch mode (auto-compile on changes)
npm run watch

# Build VSIX
npm run vscode:prepublish && npx @vscode/vsce package
```

## Reporting Issues

When reporting test failures:
1. Include error message from Extension Host console
2. Include steps to reproduce
3. Include VS Code version
4. Include Git version
5. Include OS information
6. Include relevant output channel logs

---

**Happy Testing!**

Remember: Manual testing is the primary method for VS Code extensions. Automated tests are helpful but not always necessary for UI-heavy extensions.

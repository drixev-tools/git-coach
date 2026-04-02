# Installation & Development Guide

Complete guide for installing, developing, and publishing the Git Workflow Assistant extension.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Development Setup](#development-setup)
4. [Building & Testing](#building--testing)
5. [Publishing](#publishing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm** (comes with Node.js)
  - Verify: `npm --version`

- **Git** (v2.20 or higher)
  - Download: https://git-scm.com/
  - Verify: `git --version`

- **Visual Studio Code** (v1.80 or higher)
  - Download: https://code.visualstudio.com/
  - Verify: Help → About

### Optional Tools
- **vsce** (for packaging)
  ```bash
  npm install -g @vscode/vsce
  ```

- **TypeScript** (global install)
  ```bash
  npm install -g typescript
  ```

---

## Installation Methods

### Method 1: From Source (Development)

#### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/git-workflow-assistant.git
cd git-workflow-assistant
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Compile TypeScript
```bash
npm run compile
```

#### Step 4: Run Extension
1. Open folder in VS Code:
   ```bash
   code .
   ```

2. Press `F5` to launch Extension Development Host

3. A new VS Code window opens with the extension activated

4. Test workflows in the new window

### Method 2: Install from VSIX

#### Step 1: Download/Build VSIX
If you have a `.vsix` file:
```bash
# Or build it yourself:
npm run vscode:prepublish
vsce package
```

#### Step 2: Install in VS Code
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." menu → Install from VSIX
4. Select the `.vsix` file
5. Reload VS Code

### Method 3: Install from VS Code Marketplace (Future)
Once published:
1. Open Extensions (Ctrl+Shift+X)
2. Search "Git Workflow Assistant"
3. Click Install

---

## Development Setup

### Project Structure
```
git-workflow-assistant/
├── .vscode/
│   ├── launch.json          # Debug configuration
│   └── tasks.json           # Build tasks
├── src/
│   ├── extension.ts         # Main entry point
│   ├── gitCommandExecutor.ts   # Command execution
│   ├── workflowTreeProvider.ts # Sidebar view
│   └── commandHistoryProvider.ts # History management
├── out/                     # Compiled JavaScript (generated)
├── node_modules/            # Dependencies (generated)
├── .eslintrc.json          # Linting rules
├── .gitignore              # Git ignore patterns
├── .vscodeignore           # VS Code packaging ignore
├── CHANGELOG.md            # Version history
├── package.json            # Extension manifest
├── README.md               # Documentation
├── tsconfig.json           # TypeScript config
└── QUICKSTART.md           # Quick start guide
```

### Configure VS Code for Development

#### .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/test/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    }
  ]
}
```

#### .vscode/tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "compile",
      "group": "build",
      "presentation": {
        "reveal": "silent"
      },
      "problemMatcher": "$tsc"
    },
    {
      "type": "npm",
      "script": "watch",
      "group": "build",
      "isBackground": true,
      "presentation": {
        "reveal": "never"
      },
      "problemMatcher": "$tsc-watch"
    }
  ]
}
```

### Development Workflow

#### 1. Start Development
```bash
# Terminal 1: Watch mode (auto-compile on save)
npm run watch

# Terminal 2: Run tests
npm run test
```

#### 2. Debug Extension
1. Set breakpoints in TypeScript files
2. Press `F5` to start debugging
3. Extension Host window opens
4. Trigger your code
5. Debugger stops at breakpoints

#### 3. View Logs
- Extension Host Debug Console (in original window)
- Output Channel: "Git Workflow Assistant"
- Developer Tools: Help → Toggle Developer Tools

---

## Building & Testing

### Compile TypeScript
```bash
# One-time compile
npm run compile

# Watch mode (auto-compile)
npm run watch
```

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint -- --fix
```

### Run Tests (if configured)
```bash
npm test
```

### Build VSIX Package
```bash
# Prepare for production
npm run vscode:prepublish

# Create VSIX file
vsce package

# Output: git-workflow-assistant-1.0.0.vsix
```

### Test VSIX Locally
```bash
code --install-extension git-workflow-assistant-1.0.0.vsix
```

---

## Publishing

### Publish to VS Code Marketplace

#### Prerequisites
1. Create a Microsoft account (if needed)
2. Create an Azure DevOps organization
3. Generate a Personal Access Token (PAT)
   - Go to: https://dev.azure.com/
   - User Settings → Personal access tokens
   - Scopes: Marketplace (Manage)

#### Step 1: Login to vsce
```bash
vsce login <publisher-name>
# Enter your PAT when prompted
```

#### Step 2: Publish
```bash
# First time (creates publisher)
vsce publish

# Update version
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0

# Or specify version
vsce publish 1.2.3
```

#### Step 3: Verify
Visit: https://marketplace.visualstudio.com/items?itemName=<publisher>.<name>

### Publish to GitHub Releases

#### Create Release
```bash
# Tag version
git tag v1.0.0

# Push tag
git push origin v1.0.0
```

#### Upload VSIX
1. Go to GitHub repository
2. Releases → Create new release
3. Choose tag: v1.0.0
4. Upload: git-workflow-assistant-1.0.0.vsix
5. Publish release

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module 'vscode'"
**Solution:**
```bash
npm install
npm run compile
```

#### Issue: Extension doesn't activate
**Causes:**
- Not in a Git repository
- Git not in PATH

**Solution:**
```bash
# Check Git
git --version

# Open a Git repo
code /path/to/git/repo
```

#### Issue: TypeScript compilation errors
**Solution:**
```bash
# Clean build
rm -rf out/
npm run compile

# Update dependencies
npm update
```

#### Issue: "vsce: command not found"
**Solution:**
```bash
npm install -g @vscode/vsce
```

#### Issue: Extension Host doesn't start
**Solution:**
1. Close all VS Code windows
2. Delete `.vscode-test` folder
3. Run extension again (F5)

### Debug Tips

#### Enable Verbose Logging
In extension code:
```typescript
console.log('Debug:', variable);
```

View in: Extension Host Debug Console

#### Check Extension Activation
```typescript
export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated!');
    // ...
}
```

#### Test Git Commands
```bash
# Test in terminal first
cd /path/to/repo
git status
git branch
```

### Performance Issues

#### Slow Compilation
```bash
# Use incremental compilation
npm run watch
```

#### Large Package Size
```bash
# Check what's included
vsce ls

# Exclude files in .vscodeignore
```

---

## Development Best Practices

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Git Commits
```bash
# Good commit messages
git commit -m "feat: add stash workflow"
git commit -m "fix: handle merge conflicts"
git commit -m "docs: update README with examples"
```

### Version Numbering (Semantic Versioning)
- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features (backward compatible)
- **Patch (0.0.1)**: Bug fixes

### Testing Checklist
Before releasing:
- [ ] Test all workflows
- [ ] Test with no Git repo
- [ ] Test with uncommitted changes
- [ ] Test error scenarios
- [ ] Test command history
- [ ] Test settings changes
- [ ] Verify CHANGELOG updated
- [ ] Verify README accurate

---

## Continuous Integration

### GitHub Actions Example
Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Compile
      run: npm run compile
    
    - name: Lint
      run: npm run lint
    
    - name: Package
      run: |
        npm install -g @vscode/vsce
        vsce package
    
    - name: Upload VSIX
      uses: actions/upload-artifact@v3
      with:
        name: extension
        path: '*.vsix'
```

---

## Additional Resources

### Documentation
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)

### Tools
- [Yeoman VS Code Generator](https://github.com/microsoft/vscode-generator-code)
- [vsce CLI](https://github.com/microsoft/vscode-vsce)

### Community
- [VS Code Extension Development Discord](https://aka.ms/vscode-dev-community)
- [Stack Overflow: vscode-extensions](https://stackoverflow.com/questions/tagged/vscode-extensions)

---

## Next Steps

After setup:
1. Read [QUICKSTART.md](QUICKSTART.md) for usage guide
2. Read [WORKFLOW_EXAMPLES.md](WORKFLOW_EXAMPLES.md) for examples
3. Start developing features!
4. Submit pull requests

Happy developing!

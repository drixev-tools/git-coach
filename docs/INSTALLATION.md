# Installation & Development Guide

Complete guide for installing the Git Coach assistant extension.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Troubleshooting](#troubleshooting)

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
2. Search "Git Coach"
3. Click Install

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
#### Extension doesn't activate
- Make sure you have Git installed
- Open a folder with a Git repository

#### Command history not saving
- Check `gitWorkflow.saveCommandHistory` setting
- Verify extension has storage permissions

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
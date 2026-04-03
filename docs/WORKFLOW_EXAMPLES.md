# Workflow Examples & Use Cases

This document provides real-world examples of when and how to use each workflow in the Git Workflow Assistant.

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

Remember: These workflows are guides, not rules. Adapt them to your team's needs!

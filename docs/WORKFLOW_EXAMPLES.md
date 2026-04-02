# Workflow Examples & Use Cases

This document provides real-world examples of when and how to use each workflow in the Git Workflow Assistant.

## Table of Contents
1. [Feature Branch Workflow](#feature-branch-workflow)
2. [Commit & Push Workflow](#commit--push-workflow)
3. [Pull Rebase Workflow](#pull-rebase-workflow)
4. [Merge Branch Workflow](#merge-branch-workflow)
5. [Stash & Switch Workflow](#stash--switch-workflow)
6. [Hotfix Workflow](#hotfix-workflow)
7. [Release Workflow](#release-workflow)
8. [Undo Commit Workflow](#undo-commit-workflow)

---

## Feature Branch Workflow

### When to Use
- Starting work on a new feature
- Beginning a user story or task
- Need isolated development environment

### Example Scenario
You're assigned ticket #234 to add a user profile page.

```
Step 1: Click "Feature Branch"
Step 2: Enter name: "user-profile-page"
Step 3: Base branch: "develop"
```

**Commands Executed:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-page
```

**Result:** You're now on a clean feature branch based on latest develop code.

### GitFlow Variation
For teams using GitFlow:
- Base: `develop` for features
- Naming: `feature/TICKET-description`
- Examples: `feature/234-user-profile`, `feature/login-oauth`

---

## Commit & Push Workflow

### When to Use
- You've made changes and want to save them
- End of work session
- Want to share work with team
- Backing up work in progress

### Example Scenario
You've completed the user profile UI and want to commit.

```
Step 1: Click "Commit & Push"
Step 2: Enter message: "feat: add user profile page UI"
```

**Commands Executed:**
```bash
git add .
git commit -m "feat: add user profile page UI"
git push origin feature/user-profile-page
```

**Commit Message Tips:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## Pull Rebase Workflow

### When to Use
- Before starting work for the day
- Teammate pushed changes to your branch
- Want to update with latest changes
- Prefer linear history over merge commits

### Example Scenario
Your teammate pushed updates to the shared feature branch overnight.

```
Step 1: Click "Pull Rebase"
```

**Commands Executed:**
```bash
git fetch origin
git rebase origin/feature/user-profile-page
```

**Benefits:**
- No merge commits
- Linear history
- Cleaner git log
- Easier to review

**When NOT to Use:**
- Public/shared branch with many contributors
- Already pushed commits that others are using
- Prefer to see merge history

---

## Merge Branch Workflow

### When to Use
- Feature is complete, merge to develop
- Integrate another feature into yours
- Combine hotfix with main
- Prepare for release

### Example Scenario
Your user profile feature is complete and tested.

```
Step 1: Switch to develop branch manually
Step 2: Click "Merge Branch"
Step 3: Select: "feature/user-profile-page"
Step 4: Strategy: "No Fast-Forward"
```

**Commands Executed:**
```bash
git merge --no-ff feature/user-profile-page
```

### Merge Strategies

#### Regular Merge
```bash
git merge feature/xyz
```
- Fast-forward if possible
- Creates merge commit if needed
- **Use for:** Simple merges

#### No Fast-Forward (--no-ff)
```bash
git merge --no-ff feature/xyz
```
- Always creates merge commit
- Preserves feature branch history
- **Use for:** Completed features, releases

#### Squash (--squash)
```bash
git merge --squash feature/xyz
```
- Combines all commits into one
- Cleaner history
- **Use for:** Messy commit history, small features

---

## Stash & Switch Workflow

### When to Use
- Need to switch branches urgently
- Have uncommitted changes
- Want to try something quickly
- Context switching between tasks

### Example Scenario
Working on user profile, urgent bug reported on another branch.

```
Step 1: Click "Stash & Switch"
Step 2: Message: "WIP: user profile styling"
Step 3: Switch to: "bugfix/header-crash"
Step 4: Apply stash? "No"
```

**Commands Executed:**
```bash
git stash save "WIP: user profile styling"
git checkout bugfix/header-crash
```

**Later, return to work:**
```bash
git checkout feature/user-profile-page
git stash pop
```

### Stash Tips
- Always add descriptive messages
- Use `git stash list` to see all stashes
- `git stash pop` applies and removes
- `git stash apply` applies but keeps stash

---

## Hotfix Workflow

### When to Use
- Production bug discovered
- Critical fix needed immediately
- Must patch current release
- Can't wait for next release cycle

### Example Scenario
Production site down, database connection issue.

```
Step 1: Click "Hotfix"
Step 2: Version: "1.2.1"
```

**Commands Executed:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1
```

**Complete Hotfix Process:**
```bash
# Fix the bug, then:
git add .
git commit -m "fix: resolve database connection timeout"

# Merge to main
git checkout main
git merge --no-ff hotfix/1.2.1
git tag v1.2.1
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/1.2.1
git push origin develop

# Delete hotfix branch
git branch -d hotfix/1.2.1
```

---

## Release Workflow

### When to Use
- Sprint/iteration complete
- Ready to create release candidate
- Preparing for production deployment
- Need to tag version

### Example Scenario
Sprint 12 complete, preparing v2.0.0 release.

```
Step 1: Click "Release"
Step 2: Version: "2.0.0"
```

**Commands Executed:**
```bash
git checkout develop
git pull origin develop
git checkout -b release/2.0.0
git tag -a v2.0.0 -m "Release version 2.0.0"
```

**Complete Release Process:**
```bash
# Make release-specific changes (version bumps, changelog)
git add .
git commit -m "chore: prepare release 2.0.0"

# Merge to main
git checkout main
git merge --no-ff release/2.0.0
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/2.0.0
git push origin develop

# Delete release branch
git branch -d release/2.0.0
```

---

## Undo Commit Workflow

### When to Use
- Made a mistake in last commit
- Forgot to include files
- Wrong commit message
- Need to split commit
- Committed to wrong branch

### Example Scenario
Committed with wrong message, want to fix it.

```
Step 1: Click "Undo Commit"
Step 2: Select: "Soft Reset"
```

**Commands Executed:**
```bash
git reset --soft HEAD~1
```

### Reset Options Explained

#### Soft Reset
```bash
git reset --soft HEAD~1
```
- Undo commit
- **Keep changes staged**
- Ready to commit again
- **Use for:** Fixing commit message, adding forgotten files

#### Mixed Reset (default)
```bash
git reset --mixed HEAD~1
# or just: git reset HEAD~1
```
- Undo commit
- **Keep changes but unstaged**
- Can review and re-stage selectively
- **Use for:** Splitting commits, selective staging

#### Hard Reset (⚠️ DANGEROUS)
```bash
git reset --hard HEAD~1
```
- Undo commit
- **Discard ALL changes**
- Cannot be undone easily
- **Use for:** Completely abandoning changes (rare!)

### Safety Tips
- Never hard reset pushed commits
- Always double-check before hard reset
- Consider `git reflog` for recovery
- Use soft/mixed for safety

---

## Real-World Team Scenarios

### Scenario 1: Daily Feature Development
```
Morning:
1. Pull Rebase - Get latest changes
2. Feature Branch - Start new task

During day:
3. Commit & Push - Save progress regularly

End of day:
4. Commit & Push - Final save

Feature complete:
5. Switch to develop
6. Merge Branch (--no-ff)
```

### Scenario 2: Urgent Production Fix
```
1. Hotfix - Create hotfix branch
2. Fix bug
3. Commit & Push
4. Merge to main and develop
5. Deploy to production
```

### Scenario 3: Context Switching
```
Working on Feature A:
1. Stash & Switch - Save work, switch to Feature B

Work on Feature B:
2. Commit & Push

Return to Feature A:
3. Switch back
4. Apply stash
5. Continue work
```

---

## Best Practices

### Commit Often
- Small, focused commits
- Easier to review
- Easier to revert
- Better history

### Pull Before Push
- Avoid conflicts
- Stay synchronized
- Use rebase for clean history

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Production fixes
- `release/` - Release preparation
- Include ticket numbers

### Commit Messages
- Clear and descriptive
- Use conventional commits
- Explain WHY, not just WHAT

---

## Workflow Combinations

### The Perfect Day
```
1. Pull Rebase (start fresh)
2. Feature Branch (new task)
3. Work...
4. Commit & Push (lunch break)
5. Work...
6. Commit & Push (end of day)
```

### The Release Cycle
```
1. Feature Branches (development)
2. Merge to develop (completed features)
3. Release Branch (release prep)
4. Merge to main (production)
5. Tag version
```

### The Emergency Fix
```
1. Stash (save current work)
2. Hotfix (create fix branch)
3. Fix & Commit
4. Merge & Deploy
5. Switch back & Pop Stash
```

---

Remember: These workflows are guides, not rules. Adapt them to your team's needs!

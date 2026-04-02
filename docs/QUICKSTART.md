# Git Workflow Assistant - Quick Start Guide

Welcome! This guide will get you started with Git Workflow Assistant in 5 minutes.

## What is Git Workflow Assistant?

A VS Code extension that helps you execute common Git workflows while **showing you the exact commands** being run. Perfect for:
- Learning Git commands
- Avoiding memorization of complex command sequences
- Understanding what happens in each workflow
- Working faster with pre-built workflows

## Quick Setup

1. **Install the extension** (see README.md)
2. **Open a Git repository** in VS Code
3. **Look for the Git Workflows icon** in the Activity Bar (left sidebar)

## Your First Workflow

Let's create a feature branch:

### Step 1: Open Git Workflows
Click the Git Workflows icon in the sidebar, or press `Ctrl+Shift+P` and type "Git Workflow: Show Common Workflows"

### Step 2: Select Feature Branch
Click on "Feature Branch"

### Step 3: Enter Details
- Feature name: `my-first-feature`
- Base branch: `main` (or leave empty)

### Step 4: Review Commands
You'll see a preview like:
```
1. Switch to base branch 'main'
   $ git checkout main

2. Update base branch with latest changes
   $ git pull origin main

3. Create and switch to new feature branch
   $ git checkout -b feature/my-first-feature
```

### Step 5: Execute
Click "Execute" and watch the magic happen!

## Learning Mode

### See What's Happening
Check the "Git Workflow Assistant" output channel (bottom panel) to see:
- Each command being executed
- Output from Git
- Success/error messages

### Build Your Knowledge
After using a workflow:
1. Open the Command History in the sidebar
2. Click on commands to see what was executed
3. Copy commands to try them manually
4. Learn the Git commands naturally

## Most Useful Workflows

### 1. Daily Development
**Commit & Push**
- Stages all changes
- Creates a commit
- Pushes to remote
- Perfect for quick saves

### 2. Updating Your Branch
**Pull Rebase**
- Fetches latest changes
- Rebases your work on top
- Keeps history clean

### 3. Switching Tasks
**Stash & Switch**
- Saves your current work
- Switches to another branch
- Optionally restores work there

### 4. Merging Features
**Merge Branch**
- Choose merge strategy
- Merge another branch into current
- With clear options (no-ff, squash)

## Recommended Settings

Open Settings (`Ctrl+,`) and set:

```json
{
  "gitWorkflow.autoShowCommands": true,      // Learn by seeing
  "gitWorkflow.confirmBeforeExecute": true,  // Stay safe
  "gitWorkflow.saveCommandHistory": true     // Track progress
}
```

## Pro Tips

1. **Read the Descriptions**: Each command shows what it does
2. **Check the Output**: Learn from success and error messages
3. **Use History**: Review commands you've run before
4. **Start Simple**: Master basic workflows before advanced ones
5. **Go Manual**: Try running the commands yourself in terminal

## Common Questions

**Q: Can I customize workflows?**
A: Currently, workflows are pre-built. Custom workflows coming in future versions!

**Q: What if a command fails?**
A: You'll see the error and can choose to:
- Continue anyway
- Stop the workflow
- Retry the command

**Q: Is it safe for beginners?**
A: Yes! The extension:
- Shows commands before running them
- Asks for confirmation
- Explains what each step does
- Never runs destructive commands without warning

**Q: Will this teach me Git?**
A: Absolutely! By seeing commands repeatedly, you'll:
- Learn command syntax
- Understand workflow patterns
- Build confidence
- Eventually not need the extension

## Next Steps

1. **Try all 8 workflows** - Get familiar with each one
2. **Review your history** - See what you've accomplished
3. **Read command descriptions** - Understand each step
4. **Practice manually** - Run commands yourself
5. **Customize settings** - Make it work your way

---

**Ready to become a Git workflow pro? Start now!**

Remember: The goal is to help you understand Git, not hide it from you. Every command is transparent, every workflow is educational.

Happy learning!

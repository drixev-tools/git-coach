# Code Structure — Git Workflow Assistant

This document is for developers who want to understand, modify, or extend the codebase.

---

## Directory Layout

```
git-workflow-extension/
│
├── src/                          ← All TypeScript source code
│   ├── extension.ts              ← VS Code entry point
│   ├── gitCommandExecutor.ts     ← Shell execution engine
│   ├── gitValidator.ts           ← Input & environment guards
│   ├── errorHelper.ts            ← Git error parser
│   ├── workflowTreeProvider.ts   ← "Common Workflows" sidebar panel
│   ├── commandHistoryProvider.ts ← "Command History" sidebar panel
│   └── gitTipsProvider.ts        ← "Git Tips" sidebar panel
│
├── dist/                         ← Compiled JS output (generated, gitignored)
│
├── docs/                         ← Developer & user documentation
│   ├── CODE_STRUCTURE.md         ← This file
│   ├── INSTALLATION.md           ← Dev setup & publishing guide
│   ├── QUICKSTART.md             ← End-user quick start
│   ├── TESTING.md                ← Manual test checklist
│   └── WORKFLOW_EXAMPLES.md      ← Per-workflow usage scenarios
│
├── package.json                  ← Extension manifest (commands, views, settings)
├── tsconfig.json                 ← TypeScript config (src → dist)
└── README.md                     ← Public-facing project README
```

---

## Source Files — One by One

### `src/extension.ts`

**Role:** The VS Code entry point. Everything starts here.

VS Code calls `activate()` once when the extension loads. This function:

1. Instantiates all four service objects.
2. Registers the three tree views (sidebar panels).
3. Registers every `gitWorkflow.*` command.
4. Routes command invocations to `executeWorkflow()`.

```
activate()
├── new GitCommandExecutor(context)
├── new WorkflowTreeProvider()
├── new CommandHistoryProvider(context)
├── new GitTipsProvider()
├── registerTreeDataProvider × 3
├── registerCommand × ~15
└── executeWorkflow(type, executor)
    ├── GitValidator.checkGitInstalled()
    ├── GitValidator.checkGitRepository()
    └── switch(type) → execute*Workflow(executor)
```

Each `execute*Workflow` function:
- Collects user input via `vscode.window.showInputBox` / `showQuickPick`
- Validates input using `GitValidator`
- Builds a `GitCommand[]` array
- Delegates to `executor.executeCommandSequence()`

**Key exports:** `activate`, `deactivate`

---

### `src/gitCommandExecutor.ts`

**Role:** The execution engine. The only place that actually runs shell commands.

**Class:** `GitCommandExecutor`

```
constructor(context)
├── Creates the "Git Workflow Assistant" Output Channel
└── Loads commandHistory from globalState

executeCommandSequence(commands, workflowName)
├── Reads settings: autoShowCommands, confirmBeforeExecute
├── Shows preview modal (lists commands + descriptions)
├── Waits for user: Execute | Show Details | Cancel
├── FOR EACH command:
│   ├── exec(cmd.command, { cwd: workspaceFolder })
│   ├── On success: log to Output Channel, addToHistory()
│   └── On failure: ErrorHelper.parseGitError() → dialog
│       └── User choice: Retry (i--) | Continue | Stop | Suggestions
└── Shows final success/failure notification

addToHistory(command)
├── Prepends to commandHistory[]
├── Caps at 50 entries
├── Persists to globalState
└── Fires gitWorkflow.refreshHistory

getCurrentBranch()     → git branch --show-current
getBranches()          → git branch --format="%(refname:short)"
getCommits(limit)      → git log --oneline -n <limit>
executeCustomCommand() → wraps a single command in executeCommandSequence
```

**Interface exported:**
```typescript
interface GitCommand {
    command: string;          // The actual shell command
    description: string;      // Human-readable label
    documentationUrl?: string; // Link to git-scm.com/docs
    explanation?: string;      // Longer explanation shown in history
}
```

---

### `src/gitValidator.ts`

**Role:** Pure validation utility. No VS Code UI calls — only logic.

**Class:** `GitValidator` (all static methods)

| Method | What it checks | Throws / Returns |
|---|---|---|
| `checkGitInstalled()` | Runs `git --version` | throws `Error` if git not found |
| `checkGitRepository(path)` | Runs `git rev-parse --git-dir` | throws `Error` if not a repo |
| `validateBranchName(name)` | Empty, spaces, `..`, invalid chars, reserved names | `ValidationResult` |
| `validateCommitMessage(msg)` | Empty, < 3 chars, subject > 72 chars | `ValidationResult` |
| `validateVersionTag(version)` | Semantic versioning format | `ValidationResult` (warns, doesn't block) |

**Interface exported:**
```typescript
interface ValidationResult {
    isValid: boolean;
    errorMessage?: string; // Also used for warnings when isValid=true
}
```

`validateBranchName` allows: `a-z A-Z 0-9 - _ / .`
Rejects: spaces, `..`, leading/trailing `.` or `/`, `HEAD`

`validateVersionTag` warns (but allows) non-semver strings. The regex used is the official semver pattern supporting pre-release (`1.0.0-alpha.1`) and build metadata (`1.0.0+001`).

---

### `src/errorHelper.ts`

**Role:** Maps raw git error strings to structured, user-friendly messages.

**Class:** `ErrorHelper` (all static methods)

```
parseGitError(error) → ErrorInfo
```

Matches against these patterns (checked in order):

| Pattern match | `errorType` | Example suggestion |
|---|---|---|
| `not a git repository` | `not_a_repository` | `git init` |
| `already exists` | `branch_exists` | `git checkout <branch>` |
| `merge conflict` / `unmerged paths` | `merge_conflict` | `git merge --abort` |
| `local changes would be overwritten` | `local_changes_conflict` | `git stash` |
| `nothing to commit` | `nothing_to_commit` | `git add <file>` |
| `authentication failed` / `permission denied` | `authentication_failed` | Check credentials |
| `repository not found` | `remote_not_found` | `git remote -v` |
| `cannot lock ref` | `ref_lock` | Wait and retry |
| `bad revision` | `invalid_reference` | `git fetch origin` |
| `cannot rebase` + `uncommitted` | `rebase_uncommitted` | `git stash` |
| `push rejected` / `failed to push` | `push_rejected` | `git pull` first |
| _(anything else)_ | `generic` | `git status` |

`formatErrorForDisplay(errorInfo)` produces the numbered suggestion list shown in the Output Channel.

**Interface exported:**
```typescript
interface ErrorInfo {
    message: string;       // Short title (e.g. "Merge Conflicts Detected")
    suggestions: string[]; // Ordered list of actionable steps
    errorType: string;     // Machine-readable type slug
}
```

---

### `src/workflowTreeProvider.ts`

**Role:** Powers the "Common Workflows" sidebar panel.

**Classes:**
- `WorkflowItem extends vscode.TreeItem` — a single clickable row
- `WorkflowTreeProvider implements vscode.TreeDataProvider<WorkflowItem>` — the panel

`WorkflowItem` constructor sets:
```
label          → displayed text (e.g. "🌿 Feature Branch")
workflowType   → routing key (e.g. "feature") used by extension.ts
description    → short subtitle shown in the row
tooltip        → hover text (uses detailedDescription if provided)
command        → { command: 'gitWorkflow.executeWorkflow', arguments: [this] }
iconPath       → ThemeIcon('git-branch')
contextValue   → 'workflowItem' (used by package.json menu rules)
```

`getChildren()` returns a flat hardcoded list of 12 `WorkflowItem` nodes. There is no tree depth — all items are top-level leaves.

**The 12 workflow types and their keys:**

| Label | `workflowType` key |
|---|---|
| Feature Branch | `feature` |
| Commit & Push | `commitPush` |
| Pull Rebase | `pullRebase` |
| Merge Branch | `merge` |
| Stash & Switch | `stash` |
| Hotfix | `hotfix` |
| Release | `release` |
| Undo Commit | `undo` |
| Cherry-Pick | `cherryPick` |
| Revert Commit | `revert` |
| Interactive Rebase | `interactiveRebase` |
| Create & Switch Branch | `createSwitchBranch` |

---

### `src/commandHistoryProvider.ts`

**Role:** Powers the "Command History" sidebar panel and registers three secondary commands.

**Classes:**
- `HistoryItem extends vscode.TreeItem` — one row per past command
- `CommandHistoryProvider implements vscode.TreeDataProvider<HistoryItem>`

**Commands registered inside the constructor** (not in `extension.ts`):

| Command | Behaviour |
|---|---|
| `gitWorkflow.refreshHistory` | Fires `_onDidChangeTreeData` to re-render the list |
| `gitWorkflow.copyCommand` | Writes `item.gitCommand.command` to clipboard |
| `gitWorkflow.clearHistory` | Confirms, then clears `globalState('commandHistory')` |
| `gitWorkflow.explainCommand` | Shows info modal with command, description, explanation, optional docs link |

`getChildren()` reads `GitCommand[]` from `context.globalState` on every call — the provider holds no local state.

`showHistoryQuickPick()` opens a QuickPick list of the full history and lets the user copy or view details. Called by `gitWorkflow.showHistory`.

---

### `src/gitTipsProvider.ts`

**Role:** Powers the "Git Tips" sidebar panel with categorized, read-only tips.

**Classes:**
- `TipItem extends vscode.TreeItem` — a leaf tip node
- `CategoryItem extends vscode.TreeItem` — a collapsible folder node
- `GitTipsProvider implements vscode.TreeDataProvider<vscode.TreeItem>`

The tree has **two levels:**
```
Commits (CategoryItem, expanded)
├── Write Good Commit Messages (TipItem)
└── Atomic Commits (TipItem)
Branches (CategoryItem, expanded)
├── Branch Naming Conventions (TipItem)
└── Keep Branches Up to Date (TipItem)
...
```

`getChildren(element)`:
- No element → returns `CategoryItem[]` (one per unique category)
- `element instanceof CategoryItem` → returns `TipItem[]` for that category
- `element instanceof TipItem` → returns `[]` (leaf)

Tips are hardcoded in the `tips: GitTip[]` array. There are 10 tips across 5 categories: Commits, Branches, Merges, Workflow, Advanced.

Clicking a `TipItem` fires `gitWorkflow.showTipDetails`, which opens an info dialog with `tip.title`, `tip.details`, and an optional "Open Documentation" button.

**Interface exported:**
```typescript
interface GitTip {
    category: string;
    title: string;
    description: string;   // Short subtitle
    details: string;       // Full text shown in the dialog
    documentationUrl?: string;
}
```

---

## Class Dependency Map

```
extension.ts
├── uses → GitCommandExecutor
│           └── uses → ErrorHelper
├── uses → GitValidator
├── creates → WorkflowTreeProvider
├── creates → CommandHistoryProvider
└── creates → GitTipsProvider
```

`GitValidator` and `ErrorHelper` have **zero dependencies** — they are pure utility classes with no imports from other project files.

The three providers (`WorkflowTreeProvider`, `CommandHistoryProvider`, `GitTipsProvider`) only depend on `vscode` and, in the case of `CommandHistoryProvider`, on the `GitCommand` interface from `gitCommandExecutor.ts`.

---

## State Management

The extension has two kinds of state:

**In-memory (lost on reload):**
- `GitCommandExecutor.commandHistory[]` — a local cache, synced to `globalState` after each command

**Persistent (`vscode.ExtensionContext.globalState`):**
- Key: `'commandHistory'` — stores `GitCommand[]`, max 50 entries
- Written by: `GitCommandExecutor.addToHistory()`
- Read by: `CommandHistoryProvider.getChildren()` and `showHistoryQuickPick()`

There is no file-based state, no database, and no workspace-scoped state.

---

## Configuration Reference

All settings live under `gitWorkflow.*` namespace, defined in `package.json` → `contributes.configuration`. Read at runtime via:

```typescript
const config = vscode.workspace.getConfiguration('gitWorkflow');
config.get<boolean>('autoShowCommands', true);
```

| Setting key | Type | Default | Read in |
|---|---|---|---|
| `autoShowCommands` | boolean | `true` | `GitCommandExecutor` |
| `confirmBeforeExecute` | boolean | `true` | `GitCommandExecutor` |
| `saveCommandHistory` | boolean | `true` | `GitCommandExecutor` |
| `showTips` | boolean | `true` | _(declared but not yet read)_ |
| `validateInputs` | boolean | `true` | _(declared but not yet read)_ |
| `warnDestructiveOperations` | boolean | `true` | _(declared but not yet read)_ |
| `gitDocumentationBaseUrl` | string | `https://git-scm.com/docs` | `extension.ts` |

---

## Adding a New Workflow — Checklist

1. **`src/workflowTreeProvider.ts`**
   Add a `new WorkflowItem(label, 'myKey', shortDesc, longDesc)` to the array in `getChildren()`.

2. **`src/extension.ts`**
   - Register a command: `vscode.commands.registerCommand('gitWorkflow.myWorkflow', ...)`
   - Add `case 'myKey':` in the `switch` inside `executeWorkflow()`
   - Write the `async function executeMyWorkflow(executor)` that builds `GitCommand[]` and calls `executor.executeCommandSequence()`

3. **`package.json`**
   - Add entry to `contributes.commands` so it appears in the Command Palette
   - Optionally add a doc URL mapping in the `docMap` object in `gitWorkflow.showDocumentation`

---

## Build & Scripts

```bash
npm run compile      # tsc -p ./ → compiles src/ to dist/
npm run watch        # tsc -watch → recompiles on file save
npm run lint         # eslint src --ext ts
npm run vscode:prepublish   # runs compile (called by vsce before packaging)
```

TypeScript config (`tsconfig.json`):
- `rootDir: ./src` → `outDir: ./dist`
- Emits: `.js`, `.js.map`, `.d.ts`, `.d.ts.map`
- Strict mode on, `noUncheckedIndexedAccess` on

---

## VS Code Extension Lifecycle

```
VS Code starts
    └─ package.json activationEvents: ["onStartupFinished"]
           └─ activate(context) called
                ├─ Services instantiated
                ├─ Tree views registered
                └─ Commands registered

User triggers a command
    └─ executeWorkflow(type, executor)
         ├─ GitValidator guards run
         └─ Workflow function → GitCommandExecutor

VS Code closes or extension disabled
    └─ deactivate() called (currently a no-op)
       All subscriptions in context.subscriptions are disposed automatically
```

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
4. Read TESTING.md for more details
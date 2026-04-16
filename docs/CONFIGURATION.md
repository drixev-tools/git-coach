## Configuration Reference

All settings live under `gitWorkflow.*` namespace, defined in `package.json` → `contributes.configuration`. Read at runtime via:

```typescript
const config = vscode.workspace.getConfiguration('gitWorkflow');
config.get<boolean>('autoShowCommands', true);
```

| Setting key | Type | Default | Read in |
|---|---|---|---|
| `confirmBeforeExecute` | boolean | `true` | `GitCommandExecutor` |
| `saveCommandHistory` | boolean | `true` | `GitCommandExecutor` |
| `showTips` | boolean | `true` | `extension.ts` |
| `gitDocumentationBaseUrl` | string | `https://git-scm.com/docs` | `extension.ts` |

---
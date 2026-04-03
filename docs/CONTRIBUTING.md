## Contributing

Contributions are welcome! Here are ways to contribute:

1. **Add new workflows** - Submit PRs with useful Git workflows
2. **Improve descriptions** - Make command explanations clearer
3. **Report bugs** - Open issues for any problems
4. **Request features** - Suggest new workflow ideas

### Adding a New Workflow

1. Add command in `package.json`:
```json
{
  "command": "gitWorkflow.myWorkflow",
  "title": "Git Workflow: My Workflow"
}
```

2. Create workflow function in `workflows.ts` then add it in `extension.ts`:
```typescript
async function executeMyWorkflow(executor: GitCommandExecutor) {
  const commands = [
    {
      command: 'git ...',
      description: 'What this does'
    }
  ];
  await executor.executeCommandSequence(commands, 'My Workflow');
}
```

3. Add to workflow tree provider in `workflowTreeProvider.ts`


Remember: All new workflow new be approved before merge. Create a PR for that.
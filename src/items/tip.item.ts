import * as vscode from 'vscode';

export interface GitTip {
    category: string;
    title: string;
    description: string;
    details: string;
    documentationUrl?: string;
}

export class TipItem extends vscode.TreeItem {
    public readonly tip: GitTip;

    constructor(tip: GitTip) {
        super(tip.title, vscode.TreeItemCollapsibleState.None);
        this.tip = tip;
        this.tooltip = tip.description;
        this.description = tip.category;
        this.contextValue = 'gitTip';
        this.command = {
            command: 'gitWorkflow.showTipDetails',
            title: 'Show Tip Details',
            arguments: [this]
        };
    }

    iconPath = new vscode.ThemeIcon('lightbulb');
}
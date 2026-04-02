import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export class GitValidator {
    static async checkGitInstalled(): Promise<boolean> {
        try {
            await execAsync('git --version');
            return true;
        } catch (error) {
            throw new Error(
                'Git is not installed or not available in PATH. ' +
                'Please install Git from https://git-scm.com/downloads and ensure it is added to your system PATH.'
            );
        }
    }

    static async checkGitRepository(workspacePath: string): Promise<boolean> {
        try {
            await execAsync('git rev-parse --git-dir', {
                cwd: workspacePath
            });
            return true;
        } catch (error) {
            throw new Error(
                'The current workspace is not a Git repository. ' +
                'Please initialize a Git repository first using "git init" or open a folder that contains a Git repository.'
            );
        }
    }

    static validateBranchName(name: string): ValidationResult {
        if (!name || name.trim().length === 0) {
            return {
                isValid: false,
                errorMessage: 'Branch name cannot be empty'
            };
        }

        const trimmedName = name.trim();

        if (trimmedName.startsWith('.') || trimmedName.endsWith('.') ||
            trimmedName.startsWith('/') || trimmedName.endsWith('/')) {
            return {
                isValid: false,
                errorMessage: 'Branch name cannot start or end with "." or "/"'
            };
        }

        if (trimmedName.includes('..')) {
            return {
                isValid: false,
                errorMessage: 'Branch name cannot contain consecutive dots (..)'
            };
        }

        if (trimmedName.includes(' ')) {
            return {
                isValid: false,
                errorMessage: 'Branch name cannot contain spaces. Use hyphens (-) or underscores (_) instead.'
            };
        }

        const validBranchNameRegex = /^[a-zA-Z0-9._\/-]+$/;
        if (!validBranchNameRegex.test(trimmedName)) {
            return {
                isValid: false,
                errorMessage: 'Branch name contains invalid characters. Only alphanumeric characters, hyphens (-), underscores (_), forward slashes (/), and dots (.) are allowed.'
            };
        }

        const reservedNames = ['HEAD', 'head'];
        if (reservedNames.includes(trimmedName)) {
            return {
                isValid: false,
                errorMessage: `"${trimmedName}" is a reserved Git name and cannot be used as a branch name`
            };
        }

        return { isValid: true };
    }

    static validateCommitMessage(message: string): ValidationResult {
        if (!message || message.trim().length === 0) {
            return {
                isValid: false,
                errorMessage: 'Commit message cannot be empty'
            };
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length < 3) {
            return {
                isValid: false,
                errorMessage: 'Commit message is too short. Please provide a meaningful description.'
            };
        }

        const lines = trimmedMessage.split('\n');
        const subjectLine = lines[0];
        
        if (subjectLine && subjectLine.length > 72) {
            return {
                isValid: true, // Still valid, but warn the user
                errorMessage: `Warning: Subject line is ${subjectLine.length} characters. Consider keeping it under 72 characters for better readability.`
            };
        }

        return { isValid: true };
    }

    static validateVersionTag(version: string): ValidationResult {
        if (!version || version.trim().length === 0) {
            return {
                isValid: false,
                errorMessage: 'Version cannot be empty'
            };
        }

        const trimmedVersion = version.trim();
        
        // Remove leading 'v' if present for validation
        const versionToCheck = trimmedVersion.startsWith('v') 
            ? trimmedVersion.substring(1) 
            : trimmedVersion;

        const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+([\da-z\-]+(?:\.[\da-z\-]+)*))?$/i;
        
        if (!semverRegex.test(versionToCheck)) {
            return {
                isValid: true, // Still valid, but warn
                errorMessage: `Warning: "${trimmedVersion}" does not follow semantic versioning format (MAJOR.MINOR.PATCH). Consider using a format like "1.2.3".`
            };
        }

        return { isValid: true };
    }
}

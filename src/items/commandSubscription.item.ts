export interface CommandSubscription {
  command: string;
  workflowType?: string;
}

export interface ViewCommandSubscription extends CommandSubscription {
  callback: (...args: unknown[]) => void;
}

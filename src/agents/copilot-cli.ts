import type { AgentService } from './types';

// copilot-cli does not support session management yet
// Tracking issue: https://github.com/github/gh-copilot/issues/XXX
// Keeping the implementation stub for future support

export const createCopilotCliService = (): AgentService => ({
  newSession: (_input) => {
    throw new Error('copilot-cli session management is not yet supported');

    // Future implementation:
    // const command = `copilot --allow-all-tools --add-dir '${cwd}' --no-color --no-auto-update --model '${input.model}' --stream off -s -p '${input.prompt}'`;
    // const output = executeShellCommand(command);
    // return Promise.resolve({ sessionId: '???', message: output });
  },

  continueSession: (_input) => {
    throw new Error('copilot-cli session management is not yet supported');
  },
});

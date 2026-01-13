import type { AgentConfigItem } from '../config/schema';
import type { AgentService } from './types';
import { createClaudeCodeService } from './claude-code';
import { createCodexService } from './codex';
import { createCopilotCliService } from './copilot-cli';
import { createGeminiCliService } from './gemini-cli';

export const createAgentService = (config: AgentConfigItem): AgentService => {
  switch (config.type) {
    case 'claude-code':
      return createClaudeCodeService();
    case 'codex':
      return createCodexService();
    case 'gemini-cli':
      return createGeminiCliService();
    case 'copilot-cli':
      return createCopilotCliService();
    default: {
      const _exhaustive: never = config.type;
      throw new Error(`Unknown agent type: ${String(_exhaustive)}`);
    }
  }
};

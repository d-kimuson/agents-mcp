import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { AgentService } from './types';
import { executeShellCommand, parseShellJsonOutput } from '../utils/shell';

const claudeCodeOutputSchema = z.object({
  type: z.literal('result'),
  subtype: z.literal('success'),
  result: z.string(),
});

const parseClaudeCodeOutput = (json: unknown): string => {
  const parsed = claudeCodeOutputSchema.parse(json);
  return parsed.result;
};

export const createClaudeCodeService = (): AgentService => ({
  newSession: (input) => {
    const sessionId = randomUUID();
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `claude --dangerously-skip-permissions --session-id '${sessionId}' --output-format json ${modelArg} -p '${input.prompt}'`;
    const output = executeShellCommand(command);
    const json = parseShellJsonOutput(output);
    const message = parseClaudeCodeOutput(json);

    return {
      sessionId,
      message,
    };
  },

  continueSession: (input) => {
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `claude --dangerously-skip-permissions --resume '${input.sessionId}' --fork-session --output-format json ${modelArg} -p '${input.prompt}'`;
    const output = executeShellCommand(command);
    const json = parseShellJsonOutput(output);
    const message = parseClaudeCodeOutput(json);

    return {
      message,
    };
  },
});

import { z } from 'zod';
import type { AgentService } from './types';
import { executeShellCommand, parseShellJsonlOutput } from '../utils/shell';

const codexJsonlItemSchema = z.union([
  z.object({
    type: z.literal('thread.started'),
    thread_id: z.string(),
  }),
  z.object({
    type: z.literal('item.completed'),
    item: z.object({
      id: z.string(),
      type: z.literal('agent_message'),
      text: z.string(),
    }),
  }),
]);

const parseCodexJsonlOutput = (jsonl: unknown[]): { threadId: string; message: string } => {
  const parsedJsonl = jsonl.flatMap((json) => {
    const parsed = codexJsonlItemSchema.safeParse(json);
    if (!parsed.success) {
      return [];
    }
    return [parsed.data];
  });

  const threadId = parsedJsonl.find((item) => item.type === 'thread.started')?.thread_id;
  const message = parsedJsonl
    .slice()
    .reverse()
    .find((item) => item.type === 'item.completed')?.item.text;

  if (threadId === undefined || message === undefined) {
    throw new Error('Failed to parse codex output: thread_id or message not found');
  }

  return {
    threadId,
    message,
  };
};

export const createCodexService = (): AgentService => ({
  newSession: (input) => {
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check ${modelArg} --json '${input.prompt}'`;
    const output = executeShellCommand(command);
    const jsonl = parseShellJsonlOutput(output);
    const result = parseCodexJsonlOutput(jsonl);

    return {
      sessionId: result.threadId,
      message: result.message,
    };
  },

  continueSession: (input) => {
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `codex exec resume --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check ${modelArg} --json '${input.sessionId}' '${input.prompt}'`;
    const output = executeShellCommand(command);
    const jsonl = parseShellJsonlOutput(output);
    const result = parseCodexJsonlOutput(jsonl);

    return {
      message: result.message,
    };
  },
});

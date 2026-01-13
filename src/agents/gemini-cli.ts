import { z } from 'zod';
import type { AgentService } from './types';
import { executeShellCommand, parseShellJsonOutput } from '../utils/shell';

const geminiCliOutputSchema = z.object({
  session_id: z.string(),
  response: z.string(),
});

const parseGeminiCliOutput = (json: unknown): { sessionId: string; response: string } => {
  const parsed = geminiCliOutputSchema.parse(json);
  return {
    sessionId: parsed.session_id,
    response: parsed.response,
  };
};

export const createGeminiCliService = (): AgentService => ({
  newSession: (input) => {
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `gemini --approval-mode yolo --output-format json ${modelArg} -p '${input.prompt}'`;
    const output = executeShellCommand(command);
    const json = parseShellJsonOutput(output);
    const result = parseGeminiCliOutput(json);

    return {
      sessionId: result.sessionId,
      message: result.response,
    };
  },

  continueSession: (input) => {
    const modelArg = input.model !== undefined ? `--model '${input.model}'` : '';
    const command = `gemini --approval-mode yolo --output-format json ${modelArg} --resume '${input.sessionId}' -p '${input.prompt}'`;
    const output = executeShellCommand(command);
    const json = parseShellJsonOutput(output);
    const result = parseGeminiCliOutput(json);

    return {
      message: result.response,
    };
  },
});

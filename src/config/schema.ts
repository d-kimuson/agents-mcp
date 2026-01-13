import { z } from 'zod';

export const agentConfigItemSchema = z.object({
  type: z.enum(['claude-code', 'codex', 'gemini-cli', 'copilot-cli']),
  model: z.string().optional(),
});

export const agentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string().optional(),
  agents: z.array(agentConfigItemSchema),
});

export const configSchema = z.object({
  agents: z.array(agentConfigSchema),
});

export type AgentConfigItem = z.infer<typeof agentConfigItemSchema>;
export type AgentConfig = z.infer<typeof agentConfigSchema>;
export type Config = z.infer<typeof configSchema>;
